/**
 * @file TransactionService.test.ts
 */

import { describe, it, expect, mock, spyOn, beforeEach } from 'bun:test';
import { TransactionService } from '../../../src/core/transactions/TransactionService';
import { Transaction } from '../../../src/core/transactions/Transaction';
import { Account } from '../../../src/core/accounts/Account';
import { EventBus } from '../../../src/lib/EventBus';
import { Money } from '../../../src/lib/Money';
import { ITransactionRepository } from '../../../src/core/transactions/primitives';
import { IAccountRepository } from '../../../src/core/accounts/primitives';

// Mocks
const mockTransactionRepo: ITransactionRepository = {
    findById: mock(async (id: string) => null),
    save: mock(async (transaction: Transaction) => {}),
};

const mockAccountRepo: IAccountRepository = {
    findById: mock(async (id: string) => null),
    findByCustomerId: mock(async (customerId: string) => []),
    save: mock(async (account: Account) => {}),
};

const mockEventBus: EventBus = {
    publish: mock(async (event) => {}),
    subscribe: mock((eventName, callback) => {}),
};

describe('TransactionService', () => {

    beforeEach(() => {
        (mockTransactionRepo.findById as any).mockClear();
        (mockTransactionRepo.save as any).mockClear();
        (mockAccountRepo.findById as any).mockClear();
        (mockAccountRepo.save as any).mockClear();
        (mockEventBus.publish as any).mockClear();
    });

    it('should successfully transfer funds between two accounts', async () => {
        const fromAccount = Account.create('acc-from', 'cust-1', 'checking', Money.create(1000, 'USD'));
        const toAccount = Account.create('acc-to', 'cust-2', 'checking', Money.create(500, 'USD'));

        (mockAccountRepo.findById as any).mockImplementation((id: string) => {
            if (id === 'acc-from') return fromAccount;
            if (id === 'acc-to') return toAccount;
            return null;
        });

        const service = new TransactionService(mockTransactionRepo, mockAccountRepo, mockEventBus);
        const amount = Money.create(100, 'USD');

        const transaction = await service.transfer('acc-from', 'acc-to', amount);

        expect(transaction).toBeInstanceOf(Transaction);
        expect(mockAccountRepo.save).toHaveBeenCalledTimes(2);
        expect(mockTransactionRepo.save).toHaveBeenCalledTimes(1);
        expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should fail the transaction if the sender has insufficient funds', async () => {
        const fromAccount = Account.create('acc-from', 'cust-1', 'checking', Money.create(50, 'USD'));
        const toAccount = Account.create('acc-to', 'cust-2', 'checking', Money.create(500, 'USD'));

        (mockAccountRepo.findById as any).mockImplementation((id: string) => {
            if (id === 'acc-from') return fromAccount;
            if (id === 'acc-to') return toAccount;
            return null;
        });

        const service = new TransactionService(mockTransactionRepo, mockAccountRepo, mockEventBus);
        const amount = Money.create(100, 'USD');

        await expect(service.transfer('acc-from', 'acc-to', amount))
            .rejects.toThrow('Insufficient funds.');

        // Verify that the failed transaction was saved
        expect(mockTransactionRepo.save).toHaveBeenCalledTimes(1);
        
        const savedTransaction = (mockTransactionRepo.save as any).mock.calls[0][0];
        // @ts-ignore private property access
        expect(savedTransaction.status).toBe('failed');
    });

    it('should throw an error if the sender account does not exist', async () => {
        (mockAccountRepo.findById as any).mockResolvedValue(null);
        const service = new TransactionService(mockTransactionRepo, mockAccountRepo, mockEventBus);
        const amount = Money.create(100, 'USD');

        await expect(service.transfer('acc-non-existent', 'acc-to', amount))
            .rejects.toThrow('Sender account not found.');
    });
}); 