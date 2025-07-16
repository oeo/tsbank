/**
 * @file EdgeDBEventStore.ts
 */

import { EventStore, ConcurrencyError } from '../lib/EventStore';
import { DomainEvent } from '../lib/DomainEvent';
import edgedb from './EdgeDBClient';
import { logger } from '../lib/Logger';

export class EdgeDBEventStore implements EventStore {
  /**
   * get events for an aggregate
   */
  async getEventsForAggregate(aggregateId: string): Promise<DomainEvent[]> {
    const events = await edgedb.query<DomainEvent>(
      `
            SELECT DomainEvent {
                eventId := .event_id,
                aggregateId := .aggregate_id,
                eventName := .event_name,
                payload,
                occurredAt := .occurred_at,
                version
            }
            FILTER .aggregate_id = <str>$aggregateId
            ORDER BY .version ASC
        `,
      { aggregateId }
    );

    return events;
  }

  /**
   * save events for an aggregate
   */
  async saveEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    if (events.length === 0) {
      return;
    }

    await edgedb.transaction(async (tx) => {
      const versionResult = await tx.querySingle(
        `SELECT AggregateVersion { version } FILTER .aggregate_id = <str>$aggregateId`,
        { aggregateId }
      );

      const currentVersion =
        (versionResult as { version: number } | null)?.version ?? -1;

      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyError(
          `Optimistic concurrency check failed for aggregate ${aggregateId}. Expected version ${expectedVersion}, but found ${currentVersion}.`
        );
      }

      let newVersion = currentVersion;
      for (const event of events) {
        newVersion++;
        await tx.execute(
          `
                    INSERT DomainEvent {
                        event_id := <uuid>$eventId,
                        aggregate_id := <str>$aggregateId,
                        event_name := <EventName>$eventName,
                        payload := <json>$payload,
                        version := <int64>${newVersion}
                    }
                `,
          {
            eventId: event.eventId,
            aggregateId: event.aggregateId,
            eventName: event.eventName,
            payload: event.payload,
          }
        );
      }

      // Upsert the new version for the aggregate
      await tx.execute(
        `
                INSERT AggregateVersion {
                    aggregate_id := <str>$aggregateId,
                    version := <int64>${newVersion}
                }
                UNLESS CONFLICT ON .aggregate_id
                ELSE (
                    UPDATE AggregateVersion SET { version := <int64>${newVersion} }
                )
            `,
        { aggregateId }
      );
    });

    logger.info(
      `Saved ${events.length} events for aggregate ${aggregateId}. New version is ${expectedVersion + events.length}.`
    );
  }
}
