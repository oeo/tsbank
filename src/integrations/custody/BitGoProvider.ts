/**
 * @file BitGoProvider.ts
 */

import { v4 as uuidv4 } from 'uuid';
import { CustodyProvider } from './CustodyProvider';
import { logger } from '../../infrastructure/Logger';

export class BitGoProvider implements CustodyProvider {
    private apiKey: string;
    private environment: 'test' | 'prod';

    constructor(apiKey: string, environment: 'test' | 'prod') {
        this.apiKey = apiKey;
        this.environment = environment;
        logger.info(`BitGoProvider initialized for ${environment} environment.`);
    }

    /**
     * creates a mock wallet
     */
    async createWallet(name: string): Promise<{ walletId: string; }> {
        logger.info(`[BitGo Mock] Creating wallet: ${name}`);
        const walletId = `bitgo-wallet-${uuidv4()}`;
        return { walletId };
    }

    /**
     * gets a mock deposit address
     */
    async getDepositAddress(walletId: string): Promise<{ address: string; }> {
        logger.info(`[BitGo Mock] Getting deposit address for wallet: ${walletId}`);
        const address = `bitgo-address-${uuidv4()}`;
        return { address };
    }
    
    /**
     * initiates a mock withdrawal
     */
    async initiateWithdrawal(walletId: string, address: string, amount: string): Promise<{ transactionId: string; }> {
        logger.info(`[BitGo Mock] Initiating withdrawal of ${amount} to ${address} from wallet ${walletId}`);
        const transactionId = `bitgo-txn-${uuidv4()}`;
        return { transactionId };
    }
}
