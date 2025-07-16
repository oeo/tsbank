import { Account } from './Account';

export interface IAccountRepository {
  findById(id: string): Promise<Account | null>;
  findByCustomerId(customerId: string): Promise<Account[]>;
  save(account: Account): Promise<void>;
} 