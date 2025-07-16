/**
 * @file seed.ts
 */

import { v4 as uuidv4 } from 'uuid';
import { CustomerRepository } from '../src/domains/customers/CustomerRepository';
import { AccountRepository } from '../src/domains/accounts/AccountRepository';
import { Customer } from '../src/domains/customers/Customer';
import { Account } from '../src/domains/accounts/Account';
import { Money } from '../src/shared/Money';
import { logger } from '../src/infrastructure/Logger';

const seed = async () => {
    logger.info('Starting database seeding...');

    const customerRepo = new CustomerRepository();
    const accountRepo = new AccountRepository();

    // --- Create Customer ---
    const customerId = uuidv4();
    const customer = Customer.create(customerId, 'John Doe', 'john.doe@example.com', '123-456-7890');
    customer.verify(); // Mark as verified for simplicity
    await customerRepo.save(customer);
    logger.info(`Created customer: John Doe (${customerId})`);

    // --- Create Checking Account ---
    const checkingAccountId = uuidv4();
    const checkingAccount = Account.create(
        checkingAccountId, 
        customerId, 
        'checking', 
        Money.create(5000, 'USD')
    );
    await accountRepo.save(checkingAccount);
    logger.info(`Created checking account for John Doe with $5000 USD`);

    // --- Create Bitcoin Collateral Account ---
    const btcAccountId = uuidv4();
    const btcAccount = Account.create(
        btcAccountId,
        customerId,
        'bitcoin-collateral',
        Money.create(0, 'BTC') // Start with 0 balance
    );
    await accountRepo.save(btcAccount);
    logger.info(`Created bitcoin-collateral account for John Doe`);

    logger.info('Database seeding complete.');
};

seed().catch(err => {
    logger.error('Seeding failed:', err);
    process.exit(1);
}); 