/**
 * @file PersonaKYC.ts
 */

import { v4 as uuidv4 } from 'uuid';
import { KYCProvider, KYCVerificationResult } from './KYCProvider';
import { logger } from '../../infrastructure/Logger';

export class PersonaKYC implements KYCProvider {
    constructor(
        private apiKey: string,
        private baseUrl: string
    ) {
        logger.info('PersonaKYC provider initialized.');
    }

    async verifyIdentity(customerId: string, documents: any): Promise<KYCVerificationResult> {
        logger.info(`[Persona Mock] Verifying identity for customer: ${customerId}`);
        return {
            status: 'approved',
            verificationId: `persona-verification-${uuidv4()}`,
        };
    }
}
