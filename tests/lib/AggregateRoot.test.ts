/**
 * @file AggregateRoot.test.ts
 */

// @ts-ignore
import { describe, it, expect } from 'bun:test';
import { AggregateRoot } from '../../src/lib/AggregateRoot';
import { DomainEvent, createDomainEvent } from '../../src/lib/DomainEvent';

class TestAggregate extends AggregateRoot<string> {
    constructor(id: string) {
        super(id);
    }

    public doSomething(): void {
        const event = createDomainEvent({
            eventName: 'SomethingDone',
            aggregateId: this.id,
            payload: { foo: 'bar' }
        });
        this.addEvent(event);
    }
}

describe('AggregateRoot', () => {
    it('should add events to the aggregate', () => {
        const aggregate = new TestAggregate('test-agg-id');
        aggregate.doSomething();

        expect(aggregate.events).toHaveLength(1);
        const event = aggregate.events[0];
        expect(event.eventName).toBe('SomethingDone');
        expect(event.aggregateId).toBe('test-agg-id');
        expect(event.payload).toEqual({ foo: 'bar' });
    });

    it('should clear events from the aggregate', () => {
        const aggregate = new TestAggregate('test-agg-id');
        aggregate.doSomething();
        
        expect(aggregate.events).toHaveLength(1);
        
        aggregate.clearEvents();
        
        expect(aggregate.events).toHaveLength(0);
    });

    it('should start with an empty list of events', () => {
        const aggregate = new TestAggregate('test-agg-id');
        expect(aggregate.events).toHaveLength(0);
    });
}); 