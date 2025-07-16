/**
 * @file server.ts
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { logger as honoLogger } from 'hono/logger';
import { logger } from '../lib/Logger';
import { createAccountRoutes } from './routes/accounts';
import { createCustomerRoutes } from './routes/customers';
import { createTransactionRoutes } from './routes/transactions';
import { RabbitMQEventBus } from '../infrastructure/RabbitMQEventBus';
import { config } from '../config/AppConfig';

// Data Repositories
import { CustomerRepository } from '../core/customers/CustomerRepository';
import { AccountRepository } from '../core/accounts/AccountRepository';
import { TransactionRepository } from '../core/transactions/TransactionRepository';
// Application Services
import { CustomerService } from '../core/customers/CustomerService';
import { AccountService } from '../core/accounts/AccountService';
import { TransactionService } from '../core/transactions/TransactionService';

const app = new Hono();

// Service Instantiation
const eventBus = new RabbitMQEventBus(config.get().rabbitmq.url);
eventBus.connect();

const customerRepo = new CustomerRepository();
const accountRepo = new AccountRepository();
const transactionRepo = new TransactionRepository();

const customerService = new CustomerService(customerRepo, eventBus);
const accountService = new AccountService(accountRepo, eventBus);
const transactionService = new TransactionService(
  transactionRepo,
  accountRepo,
  eventBus
);

// Middleware
app.use(
  '*',
  honoLogger((message: string) => logger.info(message))
);

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
