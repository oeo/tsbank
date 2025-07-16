/**
 * @file CustodyProvider.ts
 */

export interface CustodyProvider {
    createWallet(name: string): Promise<{ walletId: string }>;
    getDepositAddress(walletId: string): Promise<{ address: string }>;
    initiateWithdrawal(walletId: string, address: string, amount: string): Promise<{ transactionId: string }>;
} 