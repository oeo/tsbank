/**
 * @file Account.test.ts
 */

import { describe, it, expect } from 'bun:test';
import { Account } from '../../../src/core/accounts/Account';
import { Money } from '../../../src/lib/Money';
import { ACCOUNT_CREATED, ACCOUNT_DEPOSITED, ACCOUNT_WITHDRAWN, ACCOUNT_CLOSED } from '../../../src/core/accounts/events';

describe('Account Aggregate', () => {
    it('should create a new account and record an AccountCreated event', () => {
        const initialBalance = Money.create(100, 'USD');
        const account = Account.create('acc-123', 'cust-456', 'checking', initialBalance);
        
        expect(account.id).toBe('acc-123');
        expect(account.events).toHaveLength(1);
        
        const event = account.events[0];
        expect(event.eventName).toBe(ACCOUNT_CREATED);
        expect(event.payload.customerId).toBe('cust-456');
        expect(event.payload.type).toBe('checking');
        expect((event.payload.initialBalance as Money).amount).toBe(10000);
    });

    it('should deposit funds and record an AccountDeposited event', () => {
        const initialBalance = Money.create(100, 'USD');
        const account = Account.create('acc-123', 'cust-456', 'checking', initialBalance);
        account.clearEvents();

        const depositAmount = Money.create(50, 'USD');
        account.deposit(depositAmount);

        expect(account.events).toHaveLength(1);
        const event = account.events[0];
        expect(event.eventName).toBe(ACCOUNT_DEPOSITED);
        expect((event.payload.amount as Money).amount).toBe(5000);
    });

    it('should withdraw funds and record an AccountWithdrawn event', () => {
        const initialBalance = Money.create(100, 'USD');
        const account = Account.create('acc-123', 'cust-456', 'checking', initialBalance);
        account.clearEvents();

        const withdrawalAmount = Money.create(50, 'USD');
        account.withdraw(withdrawalAmount);

        expect(account.events).toHaveLength(1);
        const event = account.events[0];
        expect(event.eventName).toBe(ACCOUNT_WITHDRAWN);
        expect((event.payload.amount as Money).amount).toBe(5000);
    });

    it('should throw an error when withdrawing more than the balance', () => {
        const initialBalance = Money.create(50, 'USD');
        const account = Account.create('acc-123', 'cust-456', 'checking', initialBalance);
        
        const withdrawalAmount = Money.create(100, 'USD');
        expect(() => account.withdraw(withdrawalAmount)).toThrow('Insufficient funds.');
    });

    it('should close the account and record an AccountClosed event', () => {
        const initialBalance = Money.create(100, 'USD');
        const account = Account.create('acc-123', 'cust-456', 'checking', initialBalance);
        account.clearEvents();

        account.close('User request');

        expect(account.events).toHaveLength(1);
        const event = account.events[0];
        expect(event.eventName).toBe(ACCOUNT_CLOSED);
        expect(event.payload.reason).toBe('User request');
    });

    it('should throw an error when trying to deposit to a closed account', () => {
        const initialBalance = Money.create(100, 'USD');
        const account = Account.create('acc-123', 'cust-456', 'checking', initialBalance);
        account.close('User request');

        const depositAmount = Money.create(50, 'USD');
        expect(() => account.deposit(depositAmount)).toThrow('Cannot deposit to a closed account.');
    });
}); 