/**
 * @file events.ts
 */

import { DomainEvent, createDomainEvent } from '../../shared/DomainEvent';

export const CUSTOMER_CREATED = 'customer.created';
export const CUSTOMER_VERIFIED = 'customer.verified';
export const CUSTOMER_RISK_LEVEL_UPDATED = 'customer.risk_level.updated';
export const CUSTOMER_FLAGGED_FOR_MANUAL_REVIEW = 'customer.manual_review.flagged';

export type CustomerCreatedEvent = DomainEvent & {
  eventName: typeof CUSTOMER_CREATED;
  payload: {
    name: string;
    email: string;
    phone: string;
  };
};

export type CustomerVerifiedEvent = DomainEvent & {
  eventName: typeof CUSTOMER_VERIFIED;
  payload: {
    verificationStatus: string;
  };
};

export type CustomerRiskLevelUpdatedEvent = DomainEvent & {
    eventName: typeof CUSTOMER_RISK_LEVEL_UPDATED;
    payload: {
        newRiskLevel: number;
    };
};

export type CustomerFlaggedForManualReviewEvent = DomainEvent & {
    eventName: typeof CUSTOMER_FLAGGED_FOR_MANUAL_REVIEW;
    payload: {
        reason: string;
    };
};


// Event Creators
export const createCustomerCreatedEvent = (
    aggregateId: string,
    payload: CustomerCreatedEvent['payload']
): CustomerCreatedEvent =>
  createDomainEvent({
    eventName: CUSTOMER_CREATED,
    aggregateId,
    payload,
  }) as CustomerCreatedEvent;

export const createCustomerVerifiedEvent = (
    aggregateId: string,
    payload: CustomerVerifiedEvent['payload']
): CustomerVerifiedEvent =>
    createDomainEvent({
        eventName: CUSTOMER_VERIFIED,
        aggregateId,
        payload,
    }) as CustomerVerifiedEvent;

export const createCustomerRiskLevelUpdatedEvent = (
    aggregateId: string,
    payload: CustomerRiskLevelUpdatedEvent['payload']
): CustomerRiskLevelUpdatedEvent =>
    createDomainEvent({
        eventName: CUSTOMER_RISK_LEVEL_UPDATED,
        aggregateId,
        payload,
    }) as CustomerRiskLevelUpdatedEvent;

export const createCustomerFlaggedForManualReviewEvent = (
    aggregateId: string,
    payload: CustomerFlaggedForManualReviewEvent['payload']
): CustomerFlaggedForManualReviewEvent =>
    createDomainEvent({
        eventName: CUSTOMER_FLAGGED_FOR_MANUAL_REVIEW,
        aggregateId,
        payload,
    }) as CustomerFlaggedForManualReviewEvent; 