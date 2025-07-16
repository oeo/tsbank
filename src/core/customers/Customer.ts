/**
 * @file Customer.ts
 */

import { AggregateRoot } from '../../lib/AggregateRoot';
import { DomainEvent } from '../../lib/DomainEvent';
import { 
    createCustomerCreatedEvent,
    createCustomerFlaggedForManualReviewEvent,
    createCustomerRiskLevelUpdatedEvent,
    createCustomerVerifiedEvent,
    CUSTOMER_CREATED,
    CUSTOMER_FLAGGED_FOR_MANUAL_REVIEW,
    CUSTOMER_RISK_LEVEL_UPDATED,
    CUSTOMER_VERIFIED
} from './events';

type CustomerStatus = 'pending_verification' | 'verified' | 'rejected';

export class Customer extends AggregateRoot<string> {
    private name!: string;
    private email!: string;
    private phone!: string;
    private status!: CustomerStatus;
    private riskLevel!: number;
    private manualReviewRequired!: boolean;

    private constructor(id: string) {
        super(id);
    }

    /**
     * create a new customer
     */
    public static create(id: string, name: string, email: string, phone: string): Customer {
        const customer = new Customer(id);
        const event = createCustomerCreatedEvent(id, { name, email, phone });
        customer.apply(event);
        customer.addEvent(event);
        return customer;
    }

    /**
     * reconstitute from events
     */
    public static fromEvents(events: DomainEvent[]): Customer {
        const customer = new Customer(events[0].aggregateId);
        events.forEach(event => customer.apply(event));
        return customer;
    }

    /**
     * apply event to state
     */
    private apply(event: DomainEvent): void {
        switch (event.eventName) {
            case CUSTOMER_CREATED:
                this.name = event.payload.name as string;
                this.email = event.payload.email as string;
                this.phone = event.payload.phone as string;
                this.status = 'pending_verification';
                this.riskLevel = 0;
                this.manualReviewRequired = false;
                break;
            case CUSTOMER_VERIFIED:
                this.status = 'verified';
                break;
            case CUSTOMER_RISK_LEVEL_UPDATED:
                this.riskLevel = event.payload.newRiskLevel as number;
                break;
            case CUSTOMER_FLAGGED_FOR_MANUAL_REVIEW:
                this.manualReviewRequired = true;
                break;
        }
    }

    /**
     * verify customer identity
     */
    public verify(): void {
        if (this.status === 'verified') {
            throw new Error('Customer is already verified.');
        }
        const event = createCustomerVerifiedEvent(this.id, { verificationStatus: 'approved' });
        this.apply(event);
        this.addEvent(event);
    }

    /**
     * update customer risk
     */
    public updateRiskLevel(newLevel: number): void {
        const event = createCustomerRiskLevelUpdatedEvent(this.id, { newRiskLevel: newLevel });
        this.apply(event);
        this.addEvent(event);
    }

    /**
     * flag for manual review
     */
    public flagForManualReview(reason: string): void {
        const event = createCustomerFlaggedForManualReviewEvent(this.id, { reason });
        this.apply(event);
        this.addEvent(event);
    }

    /**
     * toJSON
     */
    public toJSON() {
        return {
            id: this._id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            status: this.status,
            riskLevel: this.riskLevel,
            manualReviewRequired: this.manualReviewRequired
        };
    }
} 