/**
 * @file IntegrationFactory.test.ts
 */

// @ts-ignore
import { describe, it, expect, spyOn, afterEach } from 'bun:test';
import { IntegrationFactory } from '../../src/config/integrations';
import { config } from '../../src/config/AppConfig';
import { BitGoProvider } from '../../src/integrations/custody/BitGoProvider';

describe('IntegrationFactory', () => {

    afterEach(() => {
        // Restore all mocks after each test
        spyOn(config, 'getIntegrationProvider').mockRestore();
        spyOn(config, 'isIntegrationEnabled').mockRestore();
    });

    it('should create a BitGoProvider for custody when specified in config', () => {
        // Mock the config to ensure 'bitgo' is the provider
        spyOn(config, 'getIntegrationProvider').mockReturnValue('bitgo');
        spyOn(config, 'isIntegrationEnabled').mockReturnValue(true);

        const provider = IntegrationFactory.createCustodyProvider();

        expect(provider).toBeInstanceOf(BitGoProvider);
    });

    it('should return null if the integration is disabled', () => {
        spyOn(config, 'isIntegrationEnabled').mockReturnValue(false);

        const provider = IntegrationFactory.createCustodyProvider();

        expect(provider).toBeNull();
    });

    it('should throw an error for an unknown provider', () => {
        spyOn(config, 'getIntegrationProvider').mockReturnValue('unknown_provider');
        spyOn(config, 'isIntegrationEnabled').mockReturnValue(true);

        expect(() => IntegrationFactory.createCustodyProvider()).toThrow('Unknown custody provider: unknown_provider');
    });
}); 