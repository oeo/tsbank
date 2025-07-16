/**
 * @file TransactionService.ts
 */

import { v4 as uuidv4 } from 'uuid';
import { Transaction } from './Transaction';
import { ITransactionRepository } from './TransactionRepository';
import { IAccountRepository } from '../accounts/AccountRepository';
import { Money } from '../../shared/Money';
import { EventBus } from '../../shared/EventBus';

export class TransactionService {
  constructor(
    private transactionRepo: ITransactionRepository,
    private accountRepo: IAccountRepository,
    private eventBus: EventBus
  ) {}

  /**
   * transfer funds between accounts
   */
  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amount: Money
  ): Promise<Transaction> {
    const fromAccount = await this.accountRepo.findById(fromAccountId);
    if (!fromAccount) {
      throw new Error('Sender account not found.');
    }

    const toAccount = await this.accountRepo.findById(toAccountId);
    if (!toAccount) {
      throw new Error('Recipient account not found.');
    }

    const transactionId = uuidv4();
    const transaction = Transaction.create(
      transactionId,
      fromAccountId,
      toAccountId,
      amount,
      'transfer'
    );

    try {
      fromAccount.withdraw(amount);
      toAccount.deposit(amount);

      transaction.complete();

      await this.accountRepo.save(fromAccount);
      await this.accountRepo.save(toAccount);
      await this.transactionRepo.save(transaction);

      // Publish all events
      const events = [...fromAccount.events, ...toAccount.events, ...transaction.events];
      for (const event of events) {
          await this.eventBus.publish(event);
      }

      fromAccount.clearEvents();
      toAccount.clearEvents();
      transaction.clearEvents();

      return transaction;

    } catch (error: any) {
        transaction.fail(error.message);
        await this.transactionRepo.save(transaction);
        
        for (const event of transaction.events) {
            await this.eventBus.publish(event);
        }
        transaction.clearEvents();
        
        // Re-throw the original error to the caller
        throw error;
    }
  }

  /**
   * get transaction by id
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    return this.transactionRepo.findById(id);
  }
} 