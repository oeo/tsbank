/**
 * @file PersonaKYC.test.ts
 */

import { describe, it, expect } from 'bun:test';
import { PersonaKYC } from '../../../src/integrations/kyc/PersonaKYC';
import { v4 as uuidv4 } from 'uuid';

describe('PersonaKYC', () => {
    it('should return a successful verification result', async () => {
        const persona = new PersonaKYC('test-api-key', 'https://api.withpersona.com');
        const customerId = uuidv4();
        const documents = {}; // Mock documents

        const result = await persona.verifyIdentity(customerId, documents);

        expect(result.status).toBe('approved');
        expect(result.verificationId).toContain('persona-verification-');
    });
}); 