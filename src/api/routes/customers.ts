/**
 * @file src/api/routes/customers.ts
 */

import { Hono } from 'hono';
import { z } from 'zod';
import { validator } from 'hono/validator';
import { CustomerService } from '../../domains/customers/CustomerService';

export const createCustomerRoutes = (customerService: CustomerService) => {
    const customers = new Hono();

    // Schemas
    const createCustomerSchema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(10),
    });

    // Routes
    customers.post(
        '/',
        validator('json', (value, c) => {
            const parsed = createCustomerSchema.safeParse(value);
            if (!parsed.success) {
                return c.json({ error: 'Invalid input', details: parsed.error.issues }, 400);
            }
            return parsed.data;
        }),
        async (c) => {
            const { name, email, phone } = c.req.valid('json');
            try {
                const customer = await customerService.createCustomer(name, email, phone);
                return c.json({ id: customer.id }, 201);
            } catch (error: any) {
                return c.json({ error: error.message }, 400);
            }
        }
    );

    customers.get('/:id', async (c) => {
        const id = c.req.param('id');
        const customer = await customerService.getCustomerById(id); // Assumes service has this method
        if (!customer) {
            return c.json({ error: 'Customer not found' }, 404);
        }
        return c.json(customer);
    });

    return customers;
}; 