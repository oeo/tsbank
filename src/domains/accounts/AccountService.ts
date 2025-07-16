/**
 * @file AccountService.ts
 */

import { v4 as uuidv4 } from 'uuid';
import { Account } from './Account';
import { IAccountRepository } from './AccountRepository';
import { config } from '../../config/AppConfig';
import { Money } from '../../shared/Money';
import { EventBus } from '../../shared/EventBus';
import { DomainEvent, createDomainEvent } from '../../shared/DomainEvent';
import { AccountType } from './events';

// This is a placeholder for an event that the Wallet service would listen for.
export const BITCOIN_WALLET_REQUIRED = 'account.bitcoin_wallet.required';

export type BitcoinWalletRequiredEvent = DomainEvent & {
    eventName: typeof BITCOIN_WALLET_REQUIRED;
    payload: {
        accountId: string;
        customerId: string;
    }
}

export const createBitcoinWalletRequiredEvent = (
    aggregateId: string,
    payload: BitcoinWalletRequiredEvent['payload']
): BitcoinWalletRequiredEvent =>
  createDomainEvent({
    eventName: BITCOIN_WALLET_REQUIRED,
    aggregateId,
    payload,
  }) as BitcoinWalletRequiredEvent;

export class AccountService {
  constructor(
    private accountRepo: IAccountRepository,
    private eventBus: EventBus
  ) {}

  /**
   * create a new account
   */
  async createAccount(
    customerId: string,
    type: AccountType
  ): Promise<Account> {
    if (type === 'savings' && !config.isFeatureEnabled('savings_accounts')) {
      throw new Error('Savings accounts are not enabled.');
    }

    if (type === 'bitcoin-collateral' && !config.isFeatureEnabled('bitcoin_collateral')) {
      throw new Error('Bitcoin collateral accounts are not enabled.');
    }

    const accountId = uuidv4();
    const minBalance = Money.create(
      config.getLimit('minimum_account_balance'),
      config.get().bank.currency
    );

    const account = Account.create(accountId, customerId, type, minBalance);

    await this.accountRepo.save(account);

    for (const event of account.events) {
      await this.eventBus.publish(event);
    }
    
    // If it's a bitcoin account, publish an event for the wallet service to pick up
    if (type === 'bitcoin-collateral') {
        const walletEvent = createBitcoinWalletRequiredEvent(accountId, { accountId, customerId });
        await this.eventBus.publish(walletEvent);
    }
    
    account.clearEvents();

    return account;
  }

  /**
   * get account by id
   */
  async getAccountById(id: string): Promise<Account | null> {
    return this.accountRepo.findById(id);
  }

  /**
   * withdraw funds from account
   */
  async withdraw(accountId: string, amount: Money): Promise<void> {
    const account = await this.accountRepo.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    const limits = config.get().limits.withdrawal_limits;
    const limitAmount = limits[account.type as keyof typeof limits];
    const limit = Money.create(limitAmount, amount.currency);

    if (amount.amount > limit.amount) {
      throw new Error(`Withdrawal amount of ${amount.amount} cents exceeds limit of ${limit.amount} cents.`);
    }

    account.withdraw(amount);
    await this.accountRepo.save(account);

    for (const event of account.events) {
      await this.eventBus.publish(event);
    }
    account.clearEvents();
  }
} 