/**
 * @file BitGoProvider.test.ts
 */

import { describe, it, expect } from 'bun:test';
import { BitGoProvider } from '../../../src/integrations/custody/BitGoProvider';

describe('BitGoProvider', () => {
    const bitgo = new BitGoProvider('test-api-key', 'test');

    it('should create a wallet', async () => {
        const result = await bitgo.createWallet('test-wallet');
        expect(result.walletId).toContain('bitgo-wallet-');
    });

    it('should get a deposit address', async () => {
        const result = await bitgo.getDepositAddress('test-wallet-id');
        expect(result.address).toContain('bitgo-address-');
    });

    it('should initiate a withdrawal', async () => {
        const result = await bitgo.initiateWithdrawal('test-wallet-id', 'test-address', '1.0');
        expect(result.transactionId).toContain('bitgo-txn-');
    });
}); 