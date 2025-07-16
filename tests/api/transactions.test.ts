/**
 * @file tests/api/transactions.test.ts
 */

import { describe, it, expect, mock } from 'bun:test';
import { Hono } from 'hono';
import { createTransactionRoutes } from '../../src/api/routes/transactions';
import { TransactionService } from '../../src/core/transactions/TransactionService';
import { Transaction } from '../../src/core/transactions/Transaction';
import { Money } from '../../src/lib/Money';

const mockTransactionService = {
    transfer: mock(async (from, to, amount) => Transaction.create('mock-txn-id', from, to, amount, 'transfer')),
    getTransactionById: mock(async (id) => {
        if (id === 'mock-txn-id') {
            return Transaction.create('mock-txn-id', 'from-acc', 'to-acc', Money.create(100, 'USD'), 'transfer');
        }
        return null;
    }),
} as unknown as TransactionService;

const app = new Hono();
app.route('/transactions', createTransactionRoutes(mockTransactionService));

describe('Transaction API', () => {
    it('should create a new transaction', async () => {
        const transactionData = {
            fromAccountId: 'a57a6278-3568-4f24-9b2f-7634f18b317e',
            toAccountId: 'b57a6278-3568-4f24-9b2f-7634f18b317f',
            amount: 100,
            currency: 'USD'
        };

        const req = new Request('http://localhost/transactions/transfer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        });

        const res = await app.fetch(req);
        expect(res.status).toBe(201);

        const json = await res.json() as { id: string };
        expect(json).toHaveProperty('id', 'mock-txn-id');
    });

    it('should retrieve an existing transaction', async () => {
        const getReq = new Request('http://localhost/transactions/mock-txn-id');
        const getRes = await app.fetch(getReq);
        
        expect(getRes.status).toBe(200);
        const json = await getRes.json() as { id: string };
        expect(json.id).toBe('mock-txn-id');
    });
}); 