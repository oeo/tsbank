/**
 * @file Transaction.ts
 */

import { AggregateRoot } from '../../shared/AggregateRoot';
import { DomainEvent } from '../../shared/DomainEvent';
import { Money } from '../../shared/Money';
import { 
    TRANSACTION_CREATED,
    TRANSACTION_COMPLETED,
    TRANSACTION_FAILED,
    TransactionType,
    createTransactionCreatedEvent,
    createTransactionCompletedEvent,
    createTransactionFailedEvent
} from './events';

type TransactionStatus = 'pending' | 'completed' | 'failed';

export class Transaction extends AggregateRoot<string> {
    private fromAccountId: string;
    private toAccountId: string;
    private amount: Money;
    private type: TransactionType;
    private status: TransactionStatus;
    private failureReason?: string;

    private constructor(id: string) {
        super(id);
    }

    /**
     * create a new transaction
     */
    public static create(id: string, fromAccountId: string, toAccountId: string, amount: Money, type: TransactionType): Transaction {
        const transaction = new Transaction(id);
        const event = createTransactionCreatedEvent(id, { fromAccountId, toAccountId, amount, type });
        transaction.apply(event);
        transaction.addEvent(event);
        return transaction;
    }

    /**
     * reconstitute from events
     */
    public static fromEvents(events: DomainEvent[]): Transaction {
        const transaction = new Transaction(events[0].aggregateId);
        events.forEach(event => transaction.apply(event));
        return transaction;
    }

    /**
     * apply event to state
     */
    private apply(event: DomainEvent): void {
        switch (event.eventName) {
            case TRANSACTION_CREATED:
                this.fromAccountId = event.payload.fromAccountId;
                this.toAccountId = event.payload.toAccountId;
                this.amount = Money.from(event.payload.amount.props);
                this.type = event.payload.type;
                this.status = 'pending';
                break;
            case TRANSACTION_COMPLETED:
                this.status = 'completed';
                break;
            case TRANSACTION_FAILED:
                this.status = 'failed';
                this.failureReason = event.payload.reason;
                break;
        }
    }

    /**
     * complete the transaction
     */
    public complete(): void {
        if (this.status !== 'pending') {
            throw new Error(`Cannot complete a transaction that is already ${this.status}.`);
        }
        const event = createTransactionCompletedEvent(this.id);
        this.apply(event);
        this.addEvent(event);
    }

    /**
     * fail the transaction
     */
    public fail(reason: string): void {
        if (this.status !== 'pending') {
            throw new Error(`Cannot fail a transaction that is already ${this.status}.`);
        }
        const event = createTransactionFailedEvent(this.id, { reason });
        this.apply(event);
        this.addEvent(event);
    }

    /**
     * toJSON
     */
    public toJSON() {
        return {
            id: this._id,
            fromAccountId: this.fromAccountId,
            toAccountId: this.toAccountId,
            amount: this.amount.props,
            type: this.type,
            status: this.status,
            failureReason: this.failureReason,
        };
    }
} 