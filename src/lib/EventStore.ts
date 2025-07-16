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
