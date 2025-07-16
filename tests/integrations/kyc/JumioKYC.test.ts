/**
 * @file JumioKYC.test.ts
 */

import { describe, it, expect } from 'bun:test';
import { JumioKYC } from '../../../src/integrations/kyc/JumioKYC';
import { v4 as uuidv4 } from 'uuid';

describe('JumioKYC', () => {
    it('should return a successful verification result', async () => {
        const jumio = new JumioKYC('test-api-key', 'test-api-secret', 'https://api.jumio.com');
        const customerId = uuidv4();
        const documents = {}; // Mock documents

        const result = await jumio.verifyIdentity(customerId, documents);

        expect(result.status).toBe('approved');
        expect(result.verificationId).toContain('jumio-verification-');
    });
}); 