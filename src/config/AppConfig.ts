/**
 * @file AppConfig.ts
 */
import { readFileSync } from 'fs';
import { parse } from 'yaml';

export interface AppConfig {
  bank: {
    name: string;
    code: string;
    country: string;
    timezone: string;
    currency: string;
  };
  branding: {
    logo_url: string;
    primary_color: string;
    secondary_color: string;
    theme: string;
  };
  server: {
    port: number;
  };
  rabbitmq: {
    url: string;
  };
  features: {
    bitcoin_collateral: boolean;
    real_time_fraud_detection: boolean;
    automated_compliance: boolean;
    multi_currency: boolean;
    instant_payments: boolean;
    loan_origination: boolean;
    savings_accounts: boolean;
    business_accounts: boolean;
  };
  limits: {
    daily_transaction_limit: number;
    monthly_transaction_limit: number;
    loan_to_value_ratio: number;
    minimum_collateral_ratio: number;
    maximum_loan_amount: number;
    minimum_account_balance: number;
    withdrawal_limits: {
      checking: number;
      savings: number;
      bitcoin_collateral: number;
    };
  };
  integrations: {
    kyc: {
      provider: string;
      enabled: boolean;
    };
    custody: {
      provider: string;
      enabled: boolean;
    };
    fraud: {
      provider: string;
      enabled: boolean;
    };
    compliance: {
      provider: string;
      enabled: boolean;
    };
    payments: {
      provider: string;
      enabled: boolean;
    };
    price_feeds: {
      primary: string;
      secondary: string;
      enabled: boolean;
    };
  };
  risk: {
    default_customer_risk_level: number;
    auto_approve_threshold: number;
    manual_review_threshold: number;
    block_threshold: number;
    collateral_monitoring: {
      price_check_interval: number;
      margin_call_threshold: number;
      liquidation_threshold: number;
    };
  };
  compliance: {
    kyc_required: boolean;
    aml_monitoring: boolean;
    suspicious_activity_threshold: number;
    currency_transaction_report_threshold: number;
    reporting: {
      daily_reports: boolean;
      weekly_reports: boolean;
      monthly_reports: boolean;
    };
  };
  jurisdiction: {
    code: string;
    regulations: string[];
    required_licenses: string[];
  };
}

// Simple deep merge helper
const mergeDeep = (target: any, source: any): any => {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
};

const isObject = (item: any): item is Record<string, any> => {
    return (item && typeof item === 'object' && !Array.isArray(item));
};

class ConfigLoader {
  private config: AppConfig;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const configFile = readFileSync('config.yml', 'utf8');
      this.config = parse(configFile) as AppConfig;

      // If in test environment, load and merge test config
      if (process.env.NODE_ENV === 'test') {
        try {
          const testConfigFile = readFileSync('config.test.yml', 'utf8');
          const testConfig = parse(testConfigFile) as Record<string, any>;
          this.config = mergeDeep(this.config, testConfig) as AppConfig;
        } catch (error: any) {
          // It's okay if the test config doesn't exist
          console.warn('Could not load config.test.yml. Using default config for tests.');
        }
      }

    } catch (error) {
      console.error('Failed to load config.yml:', error);
      process.exit(1);
    }
  }

  get(): AppConfig {
    return this.config;
  }

  getBankName(): string {
    return this.config.bank.name;
  }

  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  getIntegrationProvider(
    integration: keyof Omit<AppConfig['integrations'], 'price_feeds'>
  ): string {
    return this.config.integrations[integration].provider;
  }

  isIntegrationEnabled(integration: keyof AppConfig['integrations']): boolean {
    return this.config.integrations[integration].enabled;
  }

  getLimit(limit: string): number {
    return this.config.limits[limit as keyof AppConfig['limits']] as number;
  }

  getJurisdictionCode(): string {
    return this.config.jurisdiction.code;
  }

  getRequiredLicenses(): string[] {
    return this.config.jurisdiction.required_licenses;
  }
}

export const config = new ConfigLoader(); 