/**
 * @file integrations.ts
 */

import { config } from './AppConfig';
import { BitGoProvider } from '../integrations/custody/BitGoProvider';
import { CoinbaseProvider } from '../integrations/custody/CoinbaseProvider';
import { CustodyProvider } from '../integrations/custody/CustodyProvider';
import { FireblocksProvider } from "../integrations/custody/FireblocksProvider";
import { JumioKYC } from '../integrations/kyc/JumioKYC';
import { OnfidoKYC } from '../integrations/kyc/OnfidoKYC';
import { PersonaKYC } from '../integrations/kyc/PersonaKYC';
import { KYCProvider } from '../integrations/kyc/KYCProvider';
import { StripeProvider } from '../integrations/payments/StripeProvider';
import { PlaidProvider } from '../integrations/payments/PlaidProvider';
import { PaymentProvider } from '../integrations/payments/PaymentProvider';
import { KountProvider } from '../integrations/fraud/KountProvider';
import { SiftProvider } from '../integrations/fraud/SiftProvider';
import { FraudProvider } from '../integrations/fraud/FraudProvider';
import { ComplianceProvider } from '../integrations/compliance/ComplianceProvider';

export class IntegrationFactory {
    public static createKYCProvider(): KYCProvider | null {
        if (!config.isIntegrationEnabled('kyc')) return null;
        const provider = config.getIntegrationProvider('kyc');
        switch (provider) {
            case 'jumio': 
                return new JumioKYC(
                    process.env.JUMIO_API_KEY!,
                    process.env.JUMIO_API_SECRET!,
                    process.env.JUMIO_BASE_URL!
                );
            case 'onfido': 
                return new OnfidoKYC(
                    process.env.ONFIDO_API_KEY!,
                    process.env.ONFIDO_BASE_URL!
                );
            case 'persona': 
                return new PersonaKYC(
                    process.env.PERSONA_API_KEY!,
                    process.env.PERSONA_BASE_URL!
                );
            default: throw new Error(`Unknown KYC provider: ${provider}`);
        }
    }

    public static createCustodyProvider(): CustodyProvider | null {
        if (!config.isIntegrationEnabled('custody')) return null;
        const provider = config.getIntegrationProvider('custody');
        switch (provider) {
            case 'bitgo': 
                return new BitGoProvider(
                    process.env.BITGO_API_KEY!,
                    process.env.BITGO_ENVIRONMENT as 'test' | 'prod'
                );
            case 'coinbase': 
                return new CoinbaseProvider(
                    process.env.COINBASE_API_KEY!,
                    process.env.COINBASE_API_SECRET!
                );
            case 'fireblocks': 
                return new FireblocksProvider(
                    process.env.FIREBLOCKS_API_KEY!,
                    process.env.FIREBLOCKS_PRIVATE_KEY!
                );
            default: throw new Error(`Unknown custody provider: ${provider}`);
        }
    }

    public static createFraudProvider(): FraudProvider | null {
        if (!config.isIntegrationEnabled('fraud')) return null;
        const provider = config.getIntegrationProvider('fraud');
        switch(provider) {
            case 'sift':
                return new SiftProvider();
            case 'kount':
                return new KountProvider();
            default:
                throw new Error(`Unknown fraud provider: ${provider}`);
        }
    }

    public static createComplianceProvider(): ComplianceProvider | null {
        if (!config.isIntegrationEnabled('compliance')) return null;
        const provider = config.getIntegrationProvider('compliance');
        switch(provider) {
            default:
                throw new Error(`Unknown compliance provider: ${provider}`);
        }
    }

    public static createPaymentProvider(): PaymentProvider | null {
        if (!config.isIntegrationEnabled('payments')) return null;
        const provider = config.getIntegrationProvider('payments');
        switch(provider) {
            case 'stripe':
                return new StripeProvider();
            case 'plaid':
                return new PlaidProvider();
            default:
                throw new Error(`Unknown payment provider: ${provider}`);
        }
    }
} 