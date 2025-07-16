/**
 * @file KYCProvider.ts
 */

export interface KYCVerificationResult {
    status: 'approved' | 'rejected' | 'pending';
    [key: string]: any;
}

export interface KYCProvider {
    verifyIdentity(customerId: string, documents: any): Promise<KYCVerificationResult>;
} 