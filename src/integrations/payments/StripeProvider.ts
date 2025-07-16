/**
 * @file StripeProvider.ts
 */

import { v4 as uuidv4 } from 'uuid';
import { PaymentProvider, PaymentIntent } from './PaymentProvider';
import { logger } from '../../infrastructure/Logger';

export class StripeProvider implements PaymentProvider {
    constructor() {
        logger.info('StripeProvider initialized.');
    }

    async createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent> {
        logger.info(`[Stripe Mock] Creating payment intent for ${amount} ${currency}`);
        return {
            id: `pi_${uuidv4()}`,
            clientSecret: `pi_${uuidv4()}_secret_${uuidv4()}`,
            status: 'requires_payment_method',
        };
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        logger.info(`[Stripe Mock] Verifying webhook signature`);
        return true; // Always succeed for mock
    }
}
