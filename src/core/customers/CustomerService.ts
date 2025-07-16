/**
 * @file CustomerService.ts
 */

import { v4 as uuidv4 } from 'uuid';
import { Customer } from './Customer';
import { ICustomerRepository } from './primitives';
import { config } from '../../config/AppConfig';
import { IntegrationFactory } from '../../config/integrations';
import { EventBus } from '../../lib/EventBus';
import { KYCProvider } from '../../integrations/kyc/KYCProvider';

export class CustomerService {
  private kycProvider: KYCProvider | null;

  constructor(
    private customerRepo: ICustomerRepository,
    private eventBus: EventBus
  ) {
    this.kycProvider = IntegrationFactory.createKYCProvider() as KYCProvider | null;
  }

  /**
   * create a new customer
   */
  async createCustomer(name: string, email: string, phone: string): Promise<Customer> {
    const existingCustomer = await this.customerRepo.findByEmail(email);
    if (existingCustomer) {
        throw new Error('A customer with this email already exists.');
    }
    
    const customerId = uuidv4();
    const customer = Customer.create(customerId, name, email, phone);

    customer.updateRiskLevel(config.get().risk.default_customer_risk_level);

    await this.customerRepo.save(customer);

    for (const event of customer.events) {
      await this.eventBus.publish(event);
    }
    customer.clearEvents();

    return customer;
  }

  /**
   * get customer by id
   */
  async getCustomerById(id: string): Promise<Customer | null> {
    return this.customerRepo.findById(id);
  }

  /**
   * verify customer identity
   */
  async verifyCustomer(customerId: string, documents: any): Promise<void> {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (config.get().compliance.kyc_required && this.kycProvider) {
      const kycResult = await this.kycProvider.verifyIdentity(customerId, documents);

      if (kycResult.status === 'approved') {
        customer.verify();
        await this.customerRepo.save(customer);

        for (const event of customer.events) {
          await this.eventBus.publish(event);
        }
        customer.clearEvents();
      } else {
          throw new Error(`KYC verification failed with status: ${kycResult.status}`);
      }
    } else {
      customer.verify();
      await this.customerRepo.save(customer);
    }
  }

  /**
   * update customer risk
   */
  async updateRiskLevel(customerId: string, newLevel: number): Promise<void> {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const riskConfig = config.get().risk;

    if (newLevel >= riskConfig.block_threshold) {
      throw new Error('Risk level too high - customer blocked');
    }

    customer.updateRiskLevel(newLevel);

    if (newLevel >= riskConfig.manual_review_threshold) {
      customer.flagForManualReview('Risk level exceeded manual review threshold.');
    }
    
    await this.customerRepo.save(customer);

    for (const event of customer.events) {
      await this.eventBus.publish(event);
    }
    customer.clearEvents();
  }
} 