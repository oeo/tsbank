/**
 * @file tests/infrastructure/RabbitMQEventBus.test.ts
 */

// @ts-ignore
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { RabbitMQEventBus } from '../../src/infrastructure/RabbitMQEventBus';
import { createDomainEvent, DomainEvent } from '../../src/shared/DomainEvent';
import { config } from '../../src/config/AppConfig';

describe('RabbitMQEventBus Integration Test', () => {
    let eventBus: RabbitMQEventBus;
    const connectionString = config.get().rabbitmq.url;

    // Set up connection before all tests
    beforeAll(async () => {
        eventBus = new RabbitMQEventBus(connectionString);
        await eventBus.connect();
    });

    // Close connection after all tests
    afterAll(async () => {
        await eventBus.close();
    });

    it('should publish an event and receive it via a subscriber', async () => {
        const eventName = 'test.event.occurred';
        const aggregateId = `test-agg-${Date.now()}`;
        const payload = { message: 'Hello RabbitMQ' };

        const eventToPublish = createDomainEvent({
            aggregateId,
            eventName,
            payload,
        });

        // Use a promise to wait for the event to be received
        const receivedEventPromise = new Promise<DomainEvent>((resolve) => {
            eventBus.subscribe(eventName, (receivedEvent) => {
                resolve(receivedEvent);
            });
        });

        // Add a small delay to ensure the subscription is active before publishing
        await new Promise(resolve => setTimeout(resolve, 50));

        await eventBus.publish(eventToPublish);

        const receivedEvent = await receivedEventPromise;

        expect(receivedEvent).toBeDefined();
        expect(receivedEvent.eventId).toBe(eventToPublish.eventId);
        expect(receivedEvent.aggregateId).toBe(aggregateId);
        expect(receivedEvent.payload.message).toBe(payload.message);
    }, 1000); // Add a timeout to the test
}); 