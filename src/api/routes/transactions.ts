/**
 * @file src/api/routes/transactions.ts
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { TransactionService } from '../../core/transactions/TransactionService';
import { Money } from '../../lib/Money';

const createTransactionSchema = z.object({
    fromAccountId: z.string().uuid(),
    toAccountId: z.string().uuid(),
    amount: z.number().positive(),
    currency: z.string().length(3),
});

export const createTransactionRoutes = (transactionService: TransactionService) => {
    const app = new Hono();

    app.post(
        '/transfer',
        zValidator('json', createTransactionSchema),
        async (c) => {
            const { fromAccountId, toAccountId, amount, currency } = c.req.valid('json');
            try {
                const money = Money.create(amount, currency.toUpperCase());
                const transaction = await transactionService.transfer(fromAccountId, toAccountId, money);
                return c.json({ id: transaction.id, status: 'completed' }, 201);
            } catch (error: any) {
                return c.json({ error: error.message }, 400);
            }
        }
    );

    app.get('/:id', async (c) => {
        const id = c.req.param('id');
        const transaction = await transactionService.getTransactionById(id); // Assumes service has this method
        if (!transaction) {
            return c.json({ error: 'Transaction not found' }, 404);
        }
        return c.json(transaction);
    });

    return app;
}; 