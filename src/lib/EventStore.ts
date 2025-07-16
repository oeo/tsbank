/**
 * @file EventStore.ts
 */

import { DomainEvent } from './DomainEvent';

export interface EventStore {
  saveEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void>;
  getEventsForAggregate(aggregateId: string): Promise<DomainEvent[]>;
}

export class ConcurrencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConcurrencyError';
  }
}
