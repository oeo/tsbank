/**
 * @file tests/infrastructure/EdgeDBEventStore.test.ts
 */

// @ts-ignore
import { describe, it, expect, beforeEach } from 'bun:test';
import { EdgeDBEventStore } from '../../src/infrastructure/EdgeDBEventStore';
import { createDomainEvent, DomainEvent } from '../../src/lib/DomainEvent';
import edgedb from '../../src/infrastructure/EdgeDBClient';

describe('EdgeDBEventStore', () => {
    const eventStore = new EdgeDBEventStore();

    it('should save and retrieve events for an aggregate', async () => {
        const aggregateId = `test-agg-${Date.now()}`;
        await edgedb.execute(`DELETE DomainEvent FILTER .aggregate_id = <str>$aggregateId;`, { aggregateId });
        await edgedb.execute(`DELETE AggregateVersion FILTER .aggregate_id = <str>$aggregateId;`, { aggregateId });

        const event1 = createDomainEvent({
            aggregateId,
            eventName: 'TestEvent1',
            payload: { value: 'foo' },
        });

        const event2 = createDomainEvent({
            aggregateId,
            eventName: 'TestEvent2',
            payload: { value: 'bar' },
        });

        await eventStore.saveEvents(aggregateId, [event1, event2], -1);

        const retrievedEvents = await eventStore.getEventsForAggregate(aggregateId);

        expect(retrievedEvents).toHaveLength(2);
        expect(retrievedEvents[0].eventName).toBe('TestEvent1');
        expect(retrievedEvents[1].payload.value).toBe('bar');
        expect(retrievedEvents[1].version).toBe(1);
    });

    it('should throw a concurrency error for incorrect expected version', async () => {
        const aggregateId = `test-agg-${Date.now()}`;
        await edgedb.execute(`DELETE DomainEvent FILTER .aggregate_id = <str>$aggregateId;`, { aggregateId });
        await edgedb.execute(`DELETE AggregateVersion FILTER .aggregate_id = <str>$aggregateId;`, { aggregateId });

        const event1 = createDomainEvent({
            aggregateId,
            eventName: 'InitialEvent',
            payload: { value: 'initial' },
        });

        // Save initial event, version becomes 0
        await eventStore.saveEvents(aggregateId, [event1], -1);

        const event2 = createDomainEvent({
            aggregateId,
            eventName: 'SecondEvent',
            payload: { value: 'second' },
        });
        
        // Try to save another event with the wrong expected version
        const promise = eventStore.saveEvents(aggregateId, [event2], -1); // Should be 0

        await expect(promise).rejects.toThrow(/Optimistic concurrency check failed/);
    });

    it('should correctly save events for an existing aggregate', async () => {
        const aggregateId = `test-agg-${Date.now()}`;
        await edgedb.execute(`DELETE DomainEvent FILTER .aggregate_id = <str>$aggregateId;`, { aggregateId });
        await edgedb.execute(`DELETE AggregateVersion FILTER .aggregate_id = <str>$aggregateId;`, { aggregateId });

        const event1 = createDomainEvent({
            aggregateId,
            eventName: 'FirstEvent',
            payload: {},
        });
        await eventStore.saveEvents(aggregateId, [event1], -1); // version is now 0

        const event2 = createDomainEvent({
            aggregateId,
            eventName: 'SecondEvent',
            payload: {},
        });
        await eventStore.saveEvents(aggregateId, [event2], 0); // correct expected version

        const retrievedEvents = await eventStore.getEventsForAggregate(aggregateId);
        expect(retrievedEvents).toHaveLength(2);
        expect(retrievedEvents[1].version).toBe(1);
    });
}); 