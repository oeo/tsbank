/**
 * @file events.ts
 */

import { DomainEvent, createDomainEvent } from '../../lib/DomainEvent';
import { Money } from '../../lib/Money';

export const ACCOUNT_CREATED = 'account.created';
export const ACCOUNT_DEPOSITED = 'account.deposited';
export const ACCOUNT_WITHDRAWN = 'account.withdrawn';
export const ACCOUNT_CLOSED = 'account.closed';

export type AccountType = 'checking' | 'savings' | 'bitcoin-collateral';

export type AccountCreatedEvent = DomainEvent & {
  eventName: typeof ACCOUNT_CREATED;
  payload: {
    customerId: string;
    type: AccountType;
    initialBalance: Money;
  };
};

export type AccountDepositedEvent = DomainEvent & {
    eventName: typeof ACCOUNT_DEPOSITED;
    payload: {
        amount: Money;
    };
};

export type AccountWithdrawnEvent = DomainEvent & {
    eventName: typeof ACCOUNT_WITHDRAWN;
    payload: {
        amount: Money;
    };
};

export type AccountClosedEvent = DomainEvent & {
    eventName: typeof ACCOUNT_CLOSED;
    payload: {
        reason: string;
    };
};


// Event Creators
export const createAccountCreatedEvent = (
    aggregateId: string,
    payload: AccountCreatedEvent['payload']
): AccountCreatedEvent =>
  createDomainEvent({
    eventName: ACCOUNT_CREATED,
    aggregateId,
    payload,
  }) as AccountCreatedEvent;

export const createAccountDepositedEvent = (
    aggregateId: string,
    payload: AccountDepositedEvent['payload']
): AccountDepositedEvent =>
    createDomainEvent({
        eventName: ACCOUNT_DEPOSITED,
        aggregateId,
        payload,
    }) as AccountDepositedEvent;

export const createAccountWithdrawnEvent = (
    aggregateId: string,
    payload: AccountWithdrawnEvent['payload']
): AccountWithdrawnEvent =>
    createDomainEvent({
        eventName: ACCOUNT_WITHDRAWN,
        aggregateId,
        payload,
    }) as AccountWithdrawnEvent;

export const createAccountClosedEvent = (
    aggregateId: string,
    payload: AccountClosedEvent['payload']
): AccountClosedEvent =>
    createDomainEvent({
        eventName: ACCOUNT_CLOSED,
        aggregateId,
        payload,
    }) as AccountClosedEvent; 