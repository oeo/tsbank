/**
 * @file PlaidProvider.ts
 */

import { v4 as uuidv4 } from 'uuid';
import { PaymentProvider, PaymentIntent } from './PaymentProvider';
import { logger } from '../../infrastructure/Logger';

export class PlaidProvider implements PaymentProvider {
    constructor() {
        logger.info('PlaidProvider initialized.');
    }

    async createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent> {
        logger.info(`[Plaid Mock] Creating payment intent for ${amount} ${currency}`);
        return {
            id: `pi_${uuidv4()}`,
            clientSecret: `pi_${uuidv4()}_secret_${uuidv4()}`,
            status: 'requires_payment_method',
        };
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        logger.info(`[Plaid Mock] Verifying webhook signature`);
        return true; // Always succeed for mock
    }
}
