/**
 * @file events.ts
 */

import { DomainEvent, createDomainEvent } from '../../shared/DomainEvent';
import { Money } from '../../shared/Money';

export const TRANSACTION_CREATED = 'transaction.created';
export const TRANSACTION_COMPLETED = 'transaction.completed';
export const TRANSACTION_FAILED = 'transaction.failed';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';

export type TransactionCreatedEvent = DomainEvent & {
  eventName: typeof TRANSACTION_CREATED;
  payload: {
    fromAccountId: string;
    toAccountId: string;
    amount: Money;
    type: TransactionType;
  };
};

export type TransactionCompletedEvent = DomainEvent & {
    eventName: typeof TRANSACTION_COMPLETED;
    payload: {};
};

export type TransactionFailedEvent = DomainEvent & {
    eventName: typeof TRANSACTION_FAILED;
    payload: {
        reason: string;
    };
};

// Event Creators
export const createTransactionCreatedEvent = (
    aggregateId: string,
    payload: TransactionCreatedEvent['payload']
): TransactionCreatedEvent =>
  createDomainEvent({
    eventName: TRANSACTION_CREATED,
    aggregateId,
    payload,
  }) as TransactionCreatedEvent;

export const createTransactionCompletedEvent = (
    aggregateId: string
): TransactionCompletedEvent =>
    createDomainEvent({
        eventName: TRANSACTION_COMPLETED,
        aggregateId,
        payload: {},
    }) as TransactionCompletedEvent;

export const createTransactionFailedEvent = (
    aggregateId: string,
    payload: TransactionFailedEvent['payload']
): TransactionFailedEvent =>
    createDomainEvent({
        eventName: TRANSACTION_FAILED,
        aggregateId,
        payload,
    }) as TransactionFailedEvent; 