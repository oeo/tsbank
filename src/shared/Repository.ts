/**
 * @file Repository.ts
 */

import { AggregateRoot } from './AggregateRoot';

export interface Repository<T extends AggregateRoot<unknown>> {
  findById(id: string): Promise<T | null>;
  save(aggregate: T): Promise<void>;
} 