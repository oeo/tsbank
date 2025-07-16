/**
 * @file server.ts
 */

import { Hono } from 'hono';
import { logger as honoLogger } from 'hono/logger';
import { logger } from '../infrastructure/Logger';
import { createCustomerRoutes } from './routes/customers';
import { createAccountRoutes } from './routes/accounts';
import { createTransactionRoutes } from './routes/transactions';

// Dependencies
import { CustomerRepository } from '../domains/customers/CustomerRepository';
import { AccountRepository } from '../domains/accounts/AccountRepository';
import { TransactionRepository } from '../domains/transactions/TransactionRepository';
import { RabbitMQEventBus } from '../infrastructure/RabbitMQEventBus';
import { CustomerService } from '../domains/customers/CustomerService';
import { AccountService } from '../domains/accounts/AccountService';
import { TransactionService } from '../domains/transactions/TransactionService';
import { config } from '../config/AppConfig';

const app = new Hono();

// Service Instantiation
const eventBus = new RabbitMQEventBus(config.get().rabbitmq.url);
eventBus.connect();

const customerRepo = new CustomerRepository();
const accountRepo = new AccountRepository();
const transactionRepo = new TransactionRepository();

const customerService = new CustomerService(customerRepo, eventBus);
const accountService = new AccountService(accountRepo, eventBus);
const transactionService = new TransactionService(transactionRepo, accountRepo, eventBus);


// Middleware
app.use('*', honoLogger((message: string) => logger.info(message)));

// Routes
app.route('/customers', createCustomerRoutes(customerService));
app.route('/accounts', createAccountRoutes(accountService));
app.route('/transactions', createTransactionRoutes(transactionService));

// Health check
app.get('/health', (c) => {
    return c.json({ status: 'ok' });
});

logger.info('Hono server initialized.');

export default app; 