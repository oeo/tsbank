/**
 * @file FireblocksProvider.ts
 */

import { v4 as uuidv4 } from 'uuid';
import { CustodyProvider } from './CustodyProvider';
import { logger } from '../../lib/Logger';

export class FireblocksProvider implements CustodyProvider {
    constructor(
        private apiKey: string,
        private privateKey: string
    ) {
        logger.info('FireblocksProvider initialized.');
    }

    async createWallet(name: string): Promise<{ walletId: string; }> {
        logger.info(`[Fireblocks Mock] Creating wallet: ${name}`);
        return { walletId: `fireblocks-wallet-${uuidv4()}` };
    }

    async getDepositAddress(walletId: string): Promise<{ address: string; }> {
        logger.info(`[Fireblocks Mock] Getting deposit address for wallet: ${walletId}`);
        return { address: `fireblocks-address-${uuidv4()}` };
    }
    
    async initiateWithdrawal(walletId: string, address: string, amount: string): Promise<{ transactionId: string; }> {
        logger.info(`[Fireblocks Mock] Initiating withdrawal of ${amount} to ${address} from wallet ${walletId}`);
        return { transactionId: `fireblocks-txn-${uuidv4()}` };
    }
}
