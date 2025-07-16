/**
 * @file AccountRepository.ts
 */

import { Account } from './Account';
import { EdgeDBEventStore } from '../../infrastructure/EdgeDBEventStore';
import { edgedb } from '../../infrastructure/EdgeDBClient';
import { IAccountRepository } from './primitives';

export class AccountRepository implements IAccountRepository {
    private eventStore = new EdgeDBEventStore();

    /**
     * find by id
     */
    async findById(id: string): Promise<Account | null> {
        const events = await this.eventStore.getEventsForAggregate(id);
        if (events.length === 0) {
            return null;
        }
        return Account.fromEvents(events);
    }

    /**
     * find by customer id
     */
    async findByCustomerId(customerId: string): Promise<Account[]> {
        const accountIds = await edgedb.query<{ id: string }>(`
            SELECT DomainEvent {
                id := .aggregate_id
            }
            FILTER .event_name = 'account.created'
            AND .payload['customerId'] = <str>$customerId
        `, { customerId });

        const accounts = await Promise.all(
            accountIds.map(async ({ id }) => this.findById(id))
        );
        
        return accounts.filter((account): account is Account => account !== null);
    }

    /**
     * save account
     */
    async save(account: Account): Promise<void> {
        // This is a naive implementation for getting the version. In a real scenario,
        // the aggregate root would track its own version. For now, we query.
        const versionResult = await edgedb.querySingle<{ version: number }>(`
            SELECT AggregateVersion { version } FILTER .aggregate_id = <str>$id
        `, { id: account.id });

        const currentVersion = versionResult?.version ?? -1;

        await this.eventStore.saveEvents(account.id, account.events, currentVersion);
    }
} 