/**
 * @file AccountService.test.ts
 */

// @ts-expect-error
import { describe, it, expect, mock, spyOn, beforeEach } from 'bun:test';
import { AccountService, BITCOIN_WALLET_REQUIRED } from '../../../src/domains/accounts/AccountService';
import { Account } from '../../../src/domains/accounts/Account';
import { AccountRepository } from '../../../src/domains/accounts/AccountRepository';
import { EventBus } from '../../../src/shared/EventBus';
import { config } from '../../../src/config/AppConfig';
import { Money } from '../../../src/shared/Money';
import { IAccountRepository } from '../../../src/domains/accounts/AccountRepository';

// Mocks
const mockAccountRepo: IAccountRepository = {
    findById: mock(async (id: string) => null),
    findByCustomerId: mock(async (customerId: string) => []),
    save: mock(async (account: Account) => {}),
};

const mockEventBus: EventBus = {
    publish: mock(async (event) => {}),
    subscribe: mock((eventName, callback) => {}),
};

describe('AccountService', () => {

    beforeEach(() => {
        (mockAccountRepo.findById as any).mockClear();
        (mockAccountRepo.save as any).mockClear();
        (mockEventBus.publish as any).mockClear();
    });

    it('should create a checking account, save it, and publish an event', async () => {
        spyOn(config, 'isFeatureEnabled').mockReturnValue(true);
        const service = new AccountService(mockAccountRepo, mockEventBus);

        const account = await service.createAccount('cust-123', 'checking');

        expect(mockAccountRepo.save).toHaveBeenCalled();
        expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
        expect(account.type).toBe('checking');
    });

    it('should create a bitcoin-collateral account and publish an extra event', async () => {
        spyOn(config, 'isFeatureEnabled').mockReturnValue(true);
        const service = new AccountService(mockAccountRepo, mockEventBus);

        const account = await service.createAccount('cust-123', 'bitcoin-collateral');
        
        expect(mockAccountRepo.save).toHaveBeenCalled();
        // Called for AccountCreated and BitcoinWalletRequired
        expect(mockEventBus.publish).toHaveBeenCalledTimes(2); 

        const walletRequiredEvent = (mockEventBus.publish as any).mock.calls[1][0];
        expect(walletRequiredEvent.eventName).toBe(BITCOIN_WALLET_REQUIRED);
    });

    it('should throw an error if a feature is not enabled', async () => {
        spyOn(config, 'isFeatureEnabled').mockReturnValue(false);
        const service = new AccountService(mockAccountRepo, mockEventBus);

        await expect(service.createAccount('cust-123', 'savings'))
            .rejects.toThrow('Savings accounts are not enabled.');
    });

    it('should successfully withdraw from an account', async () => {
        const initialBalance = Money.create(5000, 'USD');
        const account = Account.create('acc-123', 'cust-456', 'checking', initialBalance);
        (mockAccountRepo.findById as any).mockResolvedValueOnce(account);
        spyOn(config, 'get').mockReturnValue({ ...config.get(), limits: { ...config.get().limits, withdrawal_limits: { checking: 10000 } } });
        
        // Clear creation events to isolate the events from this service call
        account.clearEvents();
        
        const service = new AccountService(mockAccountRepo, mockEventBus);
        const withdrawalAmount = Money.create(1000, 'USD');
        
        await service.withdraw('acc-123', withdrawalAmount);

        expect(mockAccountRepo.save).toHaveBeenCalled();
        expect(mockEventBus.publish).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if withdrawal amount exceeds limits', async () => {
        const initialBalance = Money.create(5000, 'USD');
        const account = Account.create('acc-123', 'cust-456', 'checking', initialBalance);
        (mockAccountRepo.findById as any).mockResolvedValueOnce(account);
        spyOn(config, 'get').mockReturnValue({ ...config.get(), limits: { ...config.get().limits, withdrawal_limits: { checking: 500 } } });

        const service = new AccountService(mockAccountRepo, mockEventBus);
        const withdrawalAmount = Money.create(1000, 'USD');

        await expect(service.withdraw('acc-123', withdrawalAmount))
            .rejects.toThrow(/exceeds limit/);
    });
}); 