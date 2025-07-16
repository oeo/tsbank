/**
 * @file OnfidoKYC.ts
 */

import { v4 as uuidv4 } from 'uuid';
import { KYCProvider, KYCVerificationResult } from './KYCProvider';
import { logger } from '../../lib/Logger';

export class OnfidoKYC implements KYCProvider {
    constructor(
        private apiKey: string,
        private baseUrl: string
    ) {
        logger.info('OnfidoKYC provider initialized.');
    }

    async verifyIdentity(customerId: string, documents: any): Promise<KYCVerificationResult> {
        logger.info(`[Onfido Mock] Verifying identity for customer: ${customerId}`);
        return {
            status: 'approved',
            verificationId: `onfido-verification-${uuidv4()}`,
        };
    }
}
