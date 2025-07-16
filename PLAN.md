# Project Implementation Plan

This document outlines the detailed development plan for the Core Banking DDD System. The project is divided into several phases to ensure a structured and incremental development process, resulting in a completely testable application.

## Phase 1: Project Setup & Core Infrastructure

- [x] Initialize Bun project (`bun init`).
- [x] Create the full directory structure as defined in `context.md`.
- [x] Create `package.json` with all dependencies from `context.md`.
- [x] Create `Dockerfile` and `docker-compose.yml`.
- [x] Implement the configuration system:
    - [x] Create `config.yml` with the structure from `context.md`.
    - [x] Create `.env.example`.
    - [x] Implement `src/config/AppConfig.ts` to load and parse `config.yml`.
- [x] Setup logger (`src/infrastructure/Logger.ts`).
- [x] Setup testing framework with `bun test`.
- [x] Setup linter and formatter configuration (`.eslintrc.json`, `.prettierrc.json`).
- [x] Fix all outstanding linter errors.

## Phase 2: Shared DDD Building Blocks

- [x] Implement `src/shared/Entity.ts`.
- [x] Implement `src/shared/AggregateRoot.ts`.
- [x] Implement `src/shared/ValueObject.ts`.
- [x] Implement `src/shared/Money.ts` as a value object.
- [x] Implement `src/shared/DomainEvent.ts`.
- [x] Implement `src/shared/EventBus.ts` (interface) and `src/infrastructure/RabbitMQEventBus.ts` (implementation).
- [x] Write integration test for `RabbitMQEventBus`.
- [x] Implement `src/shared/EventStore.ts` (interface).
- [x] Implement `src/shared/Repository.ts` (base interface).
- [x] Write unit tests for all shared components to ensure their reliability.

## Phase 3: Core Domain - Customers

- [x] Define Customer events in `src/domains/customers/events.ts`.
- [x] Implement the `Customer` aggregate in `src/domains/customers/Customer.ts`.
- [x] Implement `CustomerRepository` (merged interface and implementation) in the domain folder.
- [x] Implement `CustomerService` in `src/domains/customers/CustomerService.ts`.
- [x] Write comprehensive unit tests for the `Customer` aggregate and `CustomerService`, covering all business rules, events, and edge cases.

## Phase 4: Core Domain - Accounts

- [x] Define Account events in `src/domains/accounts/events.ts`.
- [x] Implement the `Account` aggregate in `src/domains/accounts/Account.ts` to support `checking`, `savings`, and `bitcoin-collateral` types.
- [x] Implement `AccountRepository` (merged interface and implementation) in the domain folder.
- [x] Implement `AccountService` in `src/domains/accounts/AccountService.ts`, including logic to check `config.yml` feature flags. The creation of a `bitcoin-collateral` account must trigger the creation of a corresponding `Wallet` in the custody domain.
- [x] Write comprehensive unit tests for the `Account` aggregate and `AccountService`, covering all account types, feature flags, business rules, and interactions with the event bus.

## Phase 5: Core Domain - Transactions

- [x] Define Transaction events in `src/domains/transactions/events.ts`.
- [x] Implement the `Transaction` aggregate in `src/domains/transactions/Transaction.ts`.
- [x] Implement `TransactionRepository` (merged interface and implementation) in the domain folder.
- [x] Implement `TransactionService` in `src/domains/transactions/TransactionService.ts`.
- [x] Write comprehensive unit tests for the `Transaction` aggregate and `TransactionService`.

## Phase 6: Pluggable Integrations

- [x] Implement base provider interfaces in `src/integrations/`.
    - [x] `KYCProvider.ts`
    - [x] `CustodyProvider.ts`
    - [x] `FraudProvider.ts`
    - [x] `ComplianceProvider.ts`
    - [x] `PaymentProvider.ts`
- [x] Implement the `IntegrationFactory` in `src/config/integrations.ts`.
- [x] Implement at least one concrete provider for each integration type based on `config.yml`.
- [x] Write integration tests for all implemented providers, mocking external API calls to ensure correctness.

## Phase 7: Database & Persistence

- [x] Define EdgeDB schema in `dbschema/default.esdl`, including schemas for all domains.
- [x] Implement `src/infrastructure/EdgeDBClient.ts`.
- [x] Implement `src/infrastructure/EdgeDBEventStore.ts` to persist and retrieve domain events.
- [x] Implement all repository concrete classes using the `EdgeDBEventStore` to reconstitute aggregates from their event streams.
- [x] Initialize database and verify Docker setup.
- [x] Create a database seeding script in `scripts/seed.ts`.
- [x] Write integration tests for the persistence layer to verify data integrity.

## Phase 8: API Layer (Hono)

- [x] Implement `src/api/server.ts` to setup the Hono application.
- [ ] Implement authentication middleware in `src/api/middleware/auth.ts`.
- [x] Implement validation middleware in `src/api/middleware/validation.ts` using Zod.
- [x] Create API routes for each domain:
    - [x] `src/api/routes/customers.ts`
    - [x] `src/api/routes/accounts.ts`
    - [x] `src/api/routes/transactions.ts`
    - [ ] `src/api/routes/lending.ts`
    - [ ] `src/api/routes/custody.ts` (For deposit addresses/withdrawals)
    - [ ] `src/api/routes/compliance.ts`
- [x] Write end-to-end tests for the entire API to ensure all use cases are covered.

## Phase 9: Lending, Custody, and Compliance Domains

This phase can be parallelized with others after the core domains are stable.

### 9.1 Custody Domain (Bitcoin Wallets)
- [ ] Define Custody events (`WalletCreated`, `DepositAddressGenerated`, `DepositDetected`, `WithdrawalInitiated`) in `src/domains/custody/events.ts`.
- [ ] Implement the `Wallet` aggregate in `src/domains/custody/Wallet.ts` to track its associated account, balances, and transaction history.
- [ ] Implement `WalletRepository` interface and its implementation.
- [ ] Implement `WalletService` in `src/domains/custody/WalletService.ts` with methods for:
    - `createWalletForAccount(accountId: string)`
    - `getDepositAddress(walletId: string): Promise<string>`
    - `processDeposit(payload: { walletId: string, amount: string, txHash: string })` (To be called by a webhook handler)
    - `initiateWithdrawal(payload: { walletId: string, amount: string, toAddress: string })`
- [ ] The `WalletService` will use the configured `CustodyProvider` from the `IntegrationFactory` to interact with the external service.
- [ ] Implement a webhook handler in the API layer to receive notifications from the custody provider (e.g., for new deposits).
- [ ] Write comprehensive unit tests for the `Wallet` aggregate and `WalletService`.

### 9.2 Lending & Compliance Domains
- [ ] Repeat the detailed implementation and testing process for the `Lending` and `Compliance` domains as done for Customers/Accounts.
- [ ] Ensure all services and aggregates correctly use feature flags from `config.yml`.
- [ ] Write comprehensive unit and integration tests for both domains.

## Phase 10: Finalization & Documentation

- [ ] Finalize `README.md` and `CONVENTIONS.md`.
- [ ] Perform a full end-to-end test of the entire application, covering all user stories.
- [ ] Conduct a thorough security and performance audit.

## Phase 11: Production Hardening & Operational Readiness

### 11.1 Operational & Monitoring Systems
- [ ] Implement a `/health` API endpoint to check the status of EdgeDB, RabbitMQ, Redis, and key integrations.
- [ ] Configure Dead-Letter Queues (DLQs) in `RabbitMQEventBus` to handle and log failed events for manual review.
- [ ] Implement a middleware to inject a `correlationId` into all incoming requests and pass it through all subsequent logs and events for end-to-end tracing.
- [ ] Create a secure set of admin API endpoints for support tasks, such as viewing an aggregate's event history or re-triggering failed events.

### 11.2 Enhanced Bitcoin/Custody Logic
- [ ] Add a `confirmationThreshold` setting to `config.yml` and enforce it in `WalletService` before crediting a deposit.
- [ ] Implement a configurable transaction fee strategy for withdrawals (absorb fee vs. deduct from user).
- [ ] Enhance the `Wallet` aggregate and listeners to track detailed withdrawal statuses (`pending`, `broadcast`, `confirmed`) based on custody provider webhooks.

### 11.3 User-Facing Asynchronous Flow Management
- [ ] Refactor long-running API operations (e.g., `initiateWithdrawal`) to immediately return a `202 Accepted` response with a transaction ID for status polling.
- [ ] Create a `NotificationService` that listens for key events (`DepositConfirmed`, `WithdrawalCompleted`) to send emails or other user alerts.

### 11.4 Security & Compliance Hardening
- [ ] Implement a full Role-Based Access Control (RBAC) system in the API middleware to enforce user permissions for all endpoints.
- [ ] Create a scheduled job runner (e.g., using a cron-like library) to handle recurring compliance tasks like generating daily reports. 