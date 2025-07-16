/**
 * @file src/api/routes/accounts.ts
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { AccountService } from '../../core/accounts/AccountService';

export const createAccountRoutes = (accountService: AccountService) => {
    const accounts = new Hono();

    // Schemas
    const createAccountSchema = z.object({
        customerId: z.string().uuid(),
        type: z.enum(['checking', 'savings', 'bitcoin-collateral']),
    });

    // Routes
    accounts.post(
        '/',
        zValidator('json', createAccountSchema),
        async (c) => {
            const { customerId, type } = c.req.valid('json');
            try {
                const account = await accountService.createAccount(customerId, type);
                return c.json({ id: account.id }, 201);
            } catch (error: any) {
                return c.json({ error: error.message }, 400);
            }
        }
    );

    accounts.get('/:id', async (c) => {
        const id = c.req.param('id');
        const account = await accountService.getAccountById(id); // Assumes service has this method
        if (!account) {
            return c.json({ error: 'Account not found' }, 404);
        }
        return c.json(account);
    });

    return accounts;
}; 