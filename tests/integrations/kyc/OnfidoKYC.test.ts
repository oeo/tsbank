/**
 * @file OnfidoKYC.test.ts
 */

import { describe, it, expect } from 'bun:test';
import { OnfidoKYC } from '../../../src/integrations/kyc/OnfidoKYC';
import { v4 as uuidv4 } from 'uuid';

describe('OnfidoKYC', () => {
    it('should return a successful verification result', async () => {
        const onfido = new OnfidoKYC('test-api-key', 'https://api.onfido.com');
        const customerId = uuidv4();
        const documents = {}; // Mock documents

        const result = await onfido.verifyIdentity(customerId, documents);

        expect(result.status).toBe('approved');
        expect(result.verificationId).toContain('onfido-verification-');
    });
}); 