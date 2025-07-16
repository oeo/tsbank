/**
 * @file CustomerService.test.ts
 */

import { describe, it, expect, mock, spyOn, beforeEach } from 'bun:test';
import { CustomerService } from '../../../src/core/customers/CustomerService';
import { Customer } from '../../../src/core/customers/Customer';
import { ICustomerRepository } from '../../../src/core/customers/primitives';
import { EventBus } from '../../../src/lib/EventBus';
import { config } from '../../../src/config/AppConfig';
import { IntegrationFactory } from '../../../src/config/integrations';

// Mocks
const mockCustomerRepo: ICustomerRepository = {
    findById: mock(async (id: string) => null),
    findByEmail: mock(async (email: string) => null),
    save: mock(async (customer: Customer) => {}),
};

const mockEventBus: EventBus = {
    publish: mock(async (event) => {}),
    subscribe: mock((eventName, callback) => {}),
};

const mockKycProvider = {
    verifyIdentity: mock(async (customerId: string, documents: any) => ({ status: 'approved' as const })),
};

// Mock the IntegrationFactory to return our mock provider
spyOn(IntegrationFactory, 'createKYCProvider').mockReturnValue(mockKycProvider);

describe('CustomerService', () => {
    
    beforeEach(() => {
        (mockCustomerRepo.findById as any).mockClear();
        (mockCustomerRepo.findByEmail as any).mockClear();
        (mockCustomerRepo.save as any).mockClear();
        (mockEventBus.publish as any).mockClear();
        (mockKycProvider.verifyIdentity as any).mockClear();
    });

    it('should create a customer, save it, and publish events', async () => {
        const service = new CustomerService(mockCustomerRepo, mockEventBus);
        
        const customer = await service.createCustomer('Jane Doe', 'jane@doe.com', '54321');

        expect(mockCustomerRepo.findByEmail).toHaveBeenCalledWith('jane@doe.com');
        expect(mockCustomerRepo.save).toHaveBeenCalled();
        expect(mockEventBus.publish).toHaveBeenCalledTimes(2); // Created + RiskLevelUpdated
        expect(customer).toBeInstanceOf(Customer);
        expect(customer.id).toBeString();
    });

    it('should throw an error if a customer with the same email already exists', async () => {
        const service = new CustomerService(mockCustomerRepo, mockEventBus);
        const existingCustomer = Customer.create('cust-123', 'John Doe', 'john@doe.com', '12345');
        (mockCustomerRepo.findByEmail as any).mockResolvedValueOnce(existingCustomer);

        await expect(service.createCustomer('John Doe', 'john@doe.com', '12345'))
            .rejects.toThrow('A customer with this email already exists.');
    });

    it('should verify a customer using the kyc provider', async () => {
        const service = new CustomerService(mockCustomerRepo, mockEventBus);
        const customer = Customer.create('cust-123', 'John Doe', 'john@doe.com', '12345');
        (mockCustomerRepo.findById as any).mockResolvedValueOnce(customer);
        
        await service.verifyCustomer('cust-123', {});

        expect(mockKycProvider.verifyIdentity).toHaveBeenCalled();
        expect(mockCustomerRepo.save).toHaveBeenCalled();
        expect(mockEventBus.publish).toHaveBeenCalled();
    });

    it('should throw an error if kyc verification fails', async () => {
        const service = new CustomerService(mockCustomerRepo, mockEventBus);
        const customer = Customer.create('cust-123', 'John Doe', 'john@doe.com', '12345');
        (mockCustomerRepo.findById as any).mockResolvedValueOnce(customer);
        (mockKycProvider.verifyIdentity as any).mockResolvedValueOnce({ status: 'rejected' });

        await expect(service.verifyCustomer('cust-123', {}))
            .rejects.toThrow('KYC verification failed with status: rejected');
    });

    it('should update risk level and flag for review if threshold is met', async () => {
        // Set manual review threshold high for this test
        spyOn(config, 'get').mockReturnValue({ ...config.get(), risk: { ...config.get().risk, manual_review_threshold: 4, block_threshold: 10 } });

        const service = new CustomerService(mockCustomerRepo, mockEventBus);
        const customer = Customer.create('cust-123', 'John Doe', 'john@doe.com', '12345');
        (mockCustomerRepo.findById as any).mockResolvedValueOnce(customer);

        // Clear creation events to isolate the events from this service call
        customer.clearEvents();

        await service.updateRiskLevel('cust-123', 4);

        // Save is called, and publish is called for both RiskLevelUpdated and ManualReviewFlagged
        expect(mockCustomerRepo.save).toHaveBeenCalled();
        expect(mockEventBus.publish).toHaveBeenCalledTimes(2);
    });
}); 