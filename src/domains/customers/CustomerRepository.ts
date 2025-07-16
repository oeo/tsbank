/**
 * @file CustomerRepository.ts
 */

import { Customer } from './Customer';
import { EdgeDBEventStore } from '../../infrastructure/EdgeDBEventStore';
import { edgedb } from '../../infrastructure/EdgeDBClient';
import { Repository } from '../../shared/Repository';

export interface ICustomerRepository extends Repository<Customer> {
    findByEmail(email: string): Promise<Customer | null>;
}

export class CustomerRepository implements ICustomerRepository {
    private eventStore = new EdgeDBEventStore();

    /**
     * find by id
     */
    async findById(id: string): Promise<Customer | null> {
        const events = await this.eventStore.getEventsForAggregate(id);
        if (events.length === 0) {
            return null;
        }
        return Customer.fromEvents(events);
    }
    
    /**
     * find by email
     */
    async findByEmail(email: string): Promise<Customer | null> {
        const result = await edgedb.querySingle<{ aggregate_id: string }>(`
            SELECT DomainEvent { aggregate_id }
            FILTER .event_name = 'customer.created'
            AND .payload['email'] = <str>$email
            LIMIT 1
        `, { email });

        if (!result) {
            return null;
        }

        return this.findById(result.aggregate_id);
    }

    /**
     * save customer
     */
    async save(customer: Customer): Promise<void> {
        const versionResult = await edgedb.querySingle<{ version: number }>(`
            SELECT AggregateVersion { version } FILTER .aggregate_id = <str>$id
        `, { id: customer.id });

        const currentVersion = versionResult?.version ?? -1;

        await this.eventStore.saveEvents(customer.id, customer.events, currentVersion);
    }
} 