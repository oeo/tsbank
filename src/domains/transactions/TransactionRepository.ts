/**
 * @file TransactionRepository.ts
 */

import { Transaction } from './Transaction';
import { EdgeDBEventStore } from '../../infrastructure/EdgeDBEventStore';
import { edgedb } from '../../infrastructure/EdgeDBClient';
import { Repository } from '../../shared/Repository';

export interface ITransactionRepository extends Repository<Transaction> {
    // No specific methods needed for now, but can be added later
}

export class TransactionRepository implements ITransactionRepository {
    private eventStore = new EdgeDBEventStore();

    /**
     * find by id
     */
    async findById(id: string): Promise<Transaction | null> {
        const events = await this.eventStore.getEventsForAggregate(id);
        if (events.length === 0) {
            return null;
        }
        return Transaction.fromEvents(events);
    }

    /**
     * save transaction
     */
    async save(transaction: Transaction): Promise<void> {
        const versionResult = await edgedb.querySingle<{ version: number }>(`
            SELECT AggregateVersion { version } FILTER .aggregate_id = <str>$id
        `, { id: transaction.id });

        const currentVersion = versionResult?.version ?? -1;

        await this.eventStore.saveEvents(transaction.id, transaction.events, currentVersion);
    }
} 