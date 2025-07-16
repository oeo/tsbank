import { Transaction } from './Transaction';

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  save(transaction: Transaction): Promise<void>;
} 