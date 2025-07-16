/**
 * @file EventBus.ts
 */

import { DomainEvent } from './DomainEvent';

export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventName: string, callback: (event: DomainEvent) => void): void;
}
