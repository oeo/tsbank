/**
 * @file Account.ts
 */

import { AggregateRoot } from '../../lib/AggregateRoot';
import { DomainEvent } from '../../lib/DomainEvent';
import { Money } from '../../lib/Money';
import { 
    ACCOUNT_CREATED,
    ACCOUNT_DEPOSITED,
    ACCOUNT_WITHDRAWN,
    ACCOUNT_CLOSED,
    createAccountCreatedEvent,
    createAccountDepositedEvent,
    createAccountWithdrawnEvent,
    createAccountClosedEvent,
    AccountType
} from './events';

type AccountStatus = 'open' | 'closed';

export class Account extends AggregateRoot<string> {
    private customerId!: string;
    private balance!: Money;
    public type!: AccountType;
    private status!: AccountStatus;

    private constructor(id: string) {
        super(id);
    }

    /**
     * create a new account
     */
    public static create(id: string, customerId: string, type: AccountType, initialBalance: Money): Account {
        const account = new Account(id);
        const event = createAccountCreatedEvent(id, { customerId, type, initialBalance });
        account.apply(event);
        account.addEvent(event);
        return account;
    }

    /**
     * reconstitute from events
     */
    public static fromEvents(events: DomainEvent[]): Account {
        const account = new Account(events[0].aggregateId);
        events.forEach(event => account.apply(event));
        return account;
    }

    /**
     * apply event to state
     */
    private apply(event: DomainEvent): void {
        switch (event.eventName) {
            case ACCOUNT_CREATED:
                this.customerId = event.payload.customerId as string;
                this.type = event.payload.type as AccountType;
                this.balance = Money.from((event.payload.initialBalance as Money).props);
                this.status = 'open';
                break;
            case ACCOUNT_DEPOSITED:
                this.balance = this.balance.add(Money.from((event.payload.amount as Money).props));
                break;
            case ACCOUNT_WITHDRAWN:
                this.balance = this.balance.subtract(Money.from((event.payload.amount as Money).props));
                break;
            case ACCOUNT_CLOSED:
                this.status = 'closed';
                break;
        }
    }

    /**
     * deposit funds
     */
    public deposit(amount: Money): void {
        if (this.status === 'closed') {
            throw new Error('Cannot deposit to a closed account.');
        }
        const event = createAccountDepositedEvent(this.id, { amount });
        this.apply(event);
        this.addEvent(event);
    }

    /**
     * withdraw funds
     */
    public withdraw(amount: Money): void {
        if (this.status === 'closed') {
            throw new Error('Cannot withdraw from a closed account.');
        }
        if (this.balance.amount < amount.amount) {
            throw new Error('Insufficient funds.');
        }
        const event = createAccountWithdrawnEvent(this.id, { amount });
        this.apply(event);
        this.addEvent(event);
    }

    /**
     * close the account
     */
    public close(reason: string): void {
        if (this.status === 'closed') {
            throw new Error('Account is already closed.');
        }
        const event = createAccountClosedEvent(this.id, { reason });
        this.apply(event);
        this.addEvent(event);
    }

    /**
     * toJSON
     */
    public toJSON() {
        return {
            id: this._id,
            customerId: this.customerId,
            type: this.type,
            balance: this.balance.props,
            status: this.status,
        };
    }
} 