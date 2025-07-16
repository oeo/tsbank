/**
 * @file Account.test.ts
 */

import { describe, it, expect } from 'bun:test';
import { Account } from '../../../src/core/accounts/Account';
import { Money } from '../../../src/lib/Money';
import { 
    ACCOUNT_CREATED, 
    ACCOUNT_DEPOSITED, 
    ACCOUNT_WITHDRAWN, 
    ACCOUNT_CLOSED,
    createAccountCreatedEvent,
    createAccountDepositedEvent,
    createAccountWithdrawnEvent
} from '../../../src/core/accounts/events';
import { v4 as uuidv4 } from 'uuid';

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

    it('should be able to be reconstituted from a stream of events', () => {
        const accountId = uuidv4();
        const customerId = uuidv4();
        const events = [
            createAccountCreatedEvent(accountId, { customerId, type: 'checking', initialBalance: Money.create(100, 'USD') }),
            createAccountDepositedEvent(accountId, { amount: Money.create(50, 'USD') }),
            createAccountWithdrawnEvent(accountId, { amount: Money.create(20, 'USD') }),
        ];

        const account = Account.fromEvents(events);

        expect(account.id).toBe(accountId);
        expect(account.toJSON().balance.amount).toBe(13000); // 100 + 50 - 20 = 130 dollars in cents
    });

    it('should deposit funds and record an AccountDeposited event', () => {
        const account = Account.create(uuidv4(), uuidv4(), 'checking', Money.create(100, 'USD'));
        account.deposit(Money.create(50, 'USD'));

        const events = account.events;
        expect(events.length).toBe(2);
        const depositedEvent = events[1];
        expect(depositedEvent.eventName).toBe(ACCOUNT_DEPOSITED);
        expect(depositedEvent.payload.amount.amount).toBe(5000);
    });

    it('should withdraw funds and record an AccountWithdrawn event', () => {
        const account = Account.create(uuidv4(), uuidv4(), 'checking', Money.create(100, 'USD'));
        account.withdraw(Money.create(20, 'USD'));

        const events = account.events;
        expect(events.length).toBe(2);
        const withdrawnEvent = events[1];
        expect(withdrawnEvent.eventName).toBe(ACCOUNT_WITHDRAWN);
        expect(withdrawnEvent.payload.amount.amount).toBe(2000);
    });

    it('should throw an error when withdrawing more than the balance', () => {
        const account = Account.create(uuidv4(), uuidv4(), 'checking', Money.create(10, 'USD'));
        expect(() => account.withdraw(Money.create(20, 'USD'))).toThrow('Insufficient funds.');
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
        const account = Account.create(uuidv4(), uuidv4(), 'checking', Money.create(100, 'USD'));
        account.close('test reason');
        expect(() => account.deposit(Money.create(50, 'USD'))).toThrow('Cannot deposit to a closed account.');
    });
}); 