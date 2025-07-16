/**
 * @file FraudProvider.ts
 */

export interface FraudCheckResult {
    score: number;
    status: 'approved' | 'rejected' | 'review';
}

export interface FraudProvider {
    checkTransaction(payload: Record<string, unknown>): Promise<FraudCheckResult>;
} 