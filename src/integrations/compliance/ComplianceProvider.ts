/**
 * @file ComplianceProvider.ts
 */

export interface SanctionScreeningResult {
    isMatch: boolean;
    details: string;
}

export interface ComplianceProvider {
    screenCustomer(name: string, address: string): Promise<SanctionScreeningResult>;
} 