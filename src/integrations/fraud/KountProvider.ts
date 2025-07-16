/**
 * @file KountProvider.ts
 */

import { FraudProvider, FraudCheckResult } from './FraudProvider';
import { logger } from '../../infrastructure/Logger';

export class KountProvider implements FraudProvider {
    constructor() {
        logger.info('KountProvider initialized.');
    }

    async checkTransaction(payload: any): Promise<FraudCheckResult> {
        logger.info(`[Kount Mock] Checking transaction`);
        return {
            score: 40, // Mock score
            status: 'approved',
        };
    }
}
