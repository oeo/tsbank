/**
 * @file Customer.test.ts
 */

import { describe, it, expect } from 'bun:test';
import { Customer } from '../../../src/core/customers/Customer';
import { CUSTOMER_CREATED, CUSTOMER_VERIFIED, CUSTOMER_RISK_LEVEL_UPDATED, CUSTOMER_FLAGGED_FOR_MANUAL_REVIEW } from '../../../src/core/customers/events';

describe('Customer Aggregate', () => {
    it('should create a new customer and record a CustomerCreated event', () => {
        const customer = Customer.create('cust-123', 'John Doe', 'john@doe.com', '12345');
        
        expect(customer.id).toBe('cust-123');
        expect(customer.events).toHaveLength(1);
        
        const event = customer.events[0];
        expect(event.eventName).toBe(CUSTOMER_CREATED);
        expect(event.payload.name).toBe('John Doe');
    });

    it('should be able to be reconstituted from a stream of events', () => {
        const events = [
            { eventName: CUSTOMER_CREATED, aggregateId: 'cust-123', payload: { name: 'John Doe', email: 'john@doe.com', phone: '12345' }, eventId: '1', occurredAt: new Date() },
            { eventName: CUSTOMER_VERIFIED, aggregateId: 'cust-123', payload: { verificationStatus: 'approved' }, eventId: '2', occurredAt: new Date() }
        ];

        const customer = Customer.fromEvents(events);
        // @ts-expect-error accessing private property for test
        expect(customer.status).toBe('verified');
    });

    it('should record a CustomerVerified event when verified', () => {
        const customer = Customer.create('cust-123', 'John Doe', 'john@doe.com', '12345');
        customer.clearEvents(); // Clear creation event for isolation

        customer.verify();

        expect(customer.events).toHaveLength(1);
        expect(customer.events[0].eventName).toBe(CUSTOMER_VERIFIED);
    });

    it('should throw an error if trying to verify an already verified customer', () => {
        const customer = Customer.create('cust-123', 'John Doe', 'john@doe.com', '12345');
        customer.verify(); // First verification
        
        expect(() => customer.verify()).toThrow('Customer is already verified.');
    });

    it('should record a CustomerRiskLevelUpdated event', () => {
        const customer = Customer.create('cust-123', 'John Doe', 'john@doe.com', '12345');
        customer.clearEvents();

        customer.updateRiskLevel(3);

        expect(customer.events).toHaveLength(1);
        const event = customer.events[0];
        expect(event.eventName).toBe(CUSTOMER_RISK_LEVEL_UPDATED);
        expect(event.payload.newRiskLevel).toBe(3);
    });

    it('should record a CustomerFlaggedForManualReview event', () => {
        const customer = Customer.create('cust-123', 'John Doe', 'john@doe.com', '12345');
        customer.clearEvents();

        customer.flagForManualReview('High risk score');

        expect(customer.events).toHaveLength(1);
        const event = customer.events[0];
        expect(event.eventName).toBe(CUSTOMER_FLAGGED_FOR_MANUAL_REVIEW);
        expect(event.payload.reason).toBe('High risk score');
    });
}); 