/**
 * @file CoinbaseProvider.ts
 */

import { v4 as uuidv4 } from 'uuid';
import { CustodyProvider } from './CustodyProvider';
import { logger } from '../../lib/Logger';

export class CoinbaseProvider implements CustodyProvider {
    constructor(
        private apiKey: string,
        private apiSecret: string
    ) {
        logger.info('CoinbaseProvider initialized.');
    }

    async createWallet(name: string): Promise<{ walletId: string; }> {
        logger.info(`[Coinbase Mock] Creating wallet: ${name}`);
        return { walletId: `coinbase-wallet-${uuidv4()}` };
    }

    async getDepositAddress(walletId: string): Promise<{ address: string; }> {
        logger.info(`[Coinbase Mock] Getting deposit address for wallet: ${walletId}`);
        return { address: `coinbase-address-${uuidv4()}` };
    }
    
    async initiateWithdrawal(walletId: string, address: string, amount: string): Promise<{ transactionId: string; }> {
        logger.info(`[Coinbase Mock] Initiating withdrawal of ${amount} to ${address} from wallet ${walletId}`);
        return { transactionId: `coinbase-txn-${uuidv4()}` };
    }
}
