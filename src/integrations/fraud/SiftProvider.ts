/**
 * @file SiftProvider.ts
 */

import { FraudProvider, FraudCheckResult } from './FraudProvider';
import { logger } from '../../infrastructure/Logger';

export class SiftProvider implements FraudProvider {
    constructor() {
        logger.info('SiftProvider initialized.');
    }

    async checkTransaction(payload: any): Promise<FraudCheckResult> {
        logger.info(`[Sift Mock] Checking transaction`);
        return {
            score: 50, // Mock score
            status: 'approved',
        };
    }
}
