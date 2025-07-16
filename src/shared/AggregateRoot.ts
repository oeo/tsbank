/**
 * @file AggregateRoot.ts
 */

import { DomainEvent } from './DomainEvent';
import { Entity } from './Entity';

export abstract class AggregateRoot<T> extends Entity<T> {
  private domainEvents: DomainEvent[] = [];

  /**
   * get domain events
   */
  get events(): DomainEvent[] {
    return this.domainEvents;
  }

  /**
   * add a domain event
   */
  protected addEvent(domainEvent: DomainEvent): void {
    this.domainEvents.push(domainEvent);
  }

  /**
   * clear all domain events
   */
  public clearEvents(): void {
    this.domainEvents = [];
  }
} 