/**
 * @file PaymentProvider.ts
 */

export interface PaymentIntent {
    id: string;
    clientSecret: string;
    status: 'succeeded' | 'requires_payment_method' | 'processing';
}

export interface PaymentProvider {
    createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent>;
    verifyWebhookSignature(payload: string, signature: string): boolean;
} 