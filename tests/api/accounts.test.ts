/**
 * @file tests/api/accounts.test.ts
 */

import { describe, it, expect, mock } from 'bun:test';
import { Hono } from 'hono';
import { createAccountRoutes } from '../../src/api/routes/accounts';
import { AccountService } from '../../src/core/accounts/AccountService';
import { Account } from '../../src/core/accounts/Account';
import { Money } from '../../src/lib/Money';

const mockAccountService = {
    createAccount: mock(async (customerId, type) => Account.create('mock-id', customerId, type, Money.create(0, 'USD'))),
    getAccountById: mock(async (id) => {
        if (id === 'mock-id') {
            return Account.create('mock-id', 'mock-cust-id', 'checking', Money.create(100, 'USD'));
        }
        return null;
    }),
} as unknown as AccountService;

const app = new Hono();
app.route('/accounts', createAccountRoutes(mockAccountService));

describe('Account API', () => {
    it('should create a new account', async () => {
        const accountData = {
            customerId: 'a57a6278-3568-4f24-9b2f-7634f18b317e',
            type: 'checking'
        };

        const req = new Request('http://localhost/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(accountData)
        });

        const res = await app.fetch(req);
        expect(res.status).toBe(201);

        const json = await res.json() as { id: string };
        expect(json).toHaveProperty('id', 'mock-id');
    });

    it('should retrieve an existing account', async () => {
        const getReq = new Request('http://localhost/accounts/mock-id');
        const getRes = await app.fetch(getReq);
        
        expect(getRes.status).toBe(200);
        const json = await getRes.json() as { id: string };
        expect(json.id).toBe('mock-id');
    });
}); 