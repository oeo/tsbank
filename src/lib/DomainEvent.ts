/**
 * @file DomainEvent.ts
 */

import { v4 as uuidv4 } from 'uuid';

export interface DomainEvent {
  readonly eventId: string;
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly eventName: string;
  readonly payload: Record<string, unknown>;
  version?: number;
}

export const createDomainEvent = <
  T extends Omit<DomainEvent, 'eventId' | 'occurredAt'>,
>(
  event: T
): DomainEvent => {
  return {
    ...event,
    eventId: uuidv4(),
    occurredAt: new Date(),
  };
};
