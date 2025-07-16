/**
 * @file Transaction.test.ts
 */

// @ts-expect-error
import { describe, it, expect } from 'bun:test';
import { Transaction } from '../../../src/domains/transactions/Transaction';
import { Money } from '../../../src/shared/Money';
import { TRANSACTION_CREATED, TRANSACTION_COMPLETED, TRANSACTION_FAILED } from '../../../src/domains/transactions/events';

describe('Transaction Aggregate', () => {
    it('should create a new transaction and record a TransactionCreated event', () => {
        const amount = Money.create(100, 'USD');
        const transaction = Transaction.create('txn-123', 'acc-from', 'acc-to', amount, 'transfer');
        
        expect(transaction.id).toBe('txn-123');
        expect(transaction.events).toHaveLength(1);
        
        const event = transaction.events[0];
        expect(event.eventName).toBe(TRANSACTION_CREATED);
        expect(event.payload.fromAccountId).toBe('acc-from');
        expect(event.payload.toAccountId).toBe('acc-to');
        expect((event.payload.amount as Money).amount).toBe(10000);
    });

    it('should complete a pending transaction and record a TransactionCompleted event', () => {
        const amount = Money.create(100, 'USD');
        const transaction = Transaction.create('txn-123', 'acc-from', 'acc-to', amount, 'transfer');
        transaction.clearEvents();

        transaction.complete();

        expect(transaction.events).toHaveLength(1);
        expect(transaction.events[0].eventName).toBe(TRANSACTION_COMPLETED);
    });

    it('should fail a pending transaction and record a TransactionFailed event', () => {
        const amount = Money.create(100, 'USD');
        const transaction = Transaction.create('txn-123', 'acc-from', 'acc-to', amount, 'transfer');
        transaction.clearEvents();

        transaction.fail('Insufficient funds');

        expect(transaction.events).toHaveLength(1);
        const event = transaction.events[0];
        expect(event.eventName).toBe(TRANSACTION_FAILED);
        expect(event.payload.reason).toBe('Insufficient funds');
    });

    it('should throw an error when trying to complete a non-pending transaction', () => {
        const amount = Money.create(100, 'USD');
        const transaction = Transaction.create('txn-123', 'acc-from', 'acc-to', amount, 'transfer');
        transaction.complete();

        expect(() => transaction.complete()).toThrow('Cannot complete a transaction that is already completed.');
    });

    it('should throw an error when trying to fail a non-pending transaction', () => {
        const amount = Money.create(100, 'USD');
        const transaction = Transaction.create('txn-123', 'acc-from', 'acc-to', amount, 'transfer');
        transaction.fail('Initial failure');

        expect(() => transaction.fail('Another reason')).toThrow('Cannot fail a transaction that is already failed.');
    });
}); 