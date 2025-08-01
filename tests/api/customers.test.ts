/**
 * @file tests/api/customers.test.ts
 */

import { describe, it, expect, mock } from 'bun:test';
import { Hono } from 'hono';
import { createCustomerRoutes } from '../../src/api/routes/customers';
import { CustomerService } from '../../src/core/customers/CustomerService';
import { Customer } from '../../src/core/customers/Customer';

// Mock CustomerService
const mockCustomerService = {
    createCustomer: mock(async (name, email) => Customer.create('mock-id', name, email, 'mock-phone')),
    getCustomerById: mock(async (id) => {
        if (id === 'mock-id') {
            return Customer.create('mock-id', 'Mock Customer', 'mock@example.com', '1234567890');
        }
        return null;
    }),
} as unknown as CustomerService;

const app = new Hono();
app.route('/customers', createCustomerRoutes(mockCustomerService));

describe('Customer API', () => {
    it('should create a new customer', async () => {
        const customerData = {
            name: 'Test Customer',
            email: `test.${Date.now()}@example.com`,
            phone: '1234567890'
        };

        const req = new Request('http://localhost/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });

        const res = await app.fetch(req);
        expect(res.status).toBe(201);

        const json = await res.json() as { id: string };
        expect(json.id).toBe('mock-id');
    });

    it('should retrieve an existing customer', async () => {
        const getReq = new Request('http://localhost/customers/mock-id');
        const getRes = await app.fetch(getReq);
        
        expect(getRes.status).toBe(200);
        const json = await getRes.json() as { id: string, name: string };
        expect(json.id).toBe('mock-id');
        expect(json.name).toBe('Mock Customer');
    });
}); 