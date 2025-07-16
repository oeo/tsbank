/**
 * @file KountProvider.test.ts
 */

import { describe, it, expect } from 'bun:test';
import { KountProvider } from '../../../src/integrations/fraud/KountProvider';

describe('KountProvider', () => {
    it('should return a successful fraud check result', async () => {
        const kount = new KountProvider();
        const payload = { transactionId: 'test-txn-123' };

        const result = await kount.checkTransaction(payload);

        expect(result.status).toBe('approved');
        expect(result.score).toBe(40);
    });
}); 