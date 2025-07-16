# Coding and Architectural Conventions

This document provides the conventions for developing this project. Adhering to these conventions is crucial for maintaining code quality, consistency, and ease of maintenance.

## 1. Code Style (ALIEN)

We follow the ALIEN code style for clean, professional, and maintainable TypeScript code.

### 1.1. File Organization

#### File Header
Every `.ts` file must begin with a JSDoc header containing the `@file` tag.

```typescript
/**
 * @file filename.ts
 */
```

#### Import Structure
Group imports logically with empty lines between groups. If an import has 4 or more named imports, break it into multiple lines.

```typescript
// external dependencies
import { Hono } from 'hono';
import { z } from 'zod';

// project core
import { Customer } from '../core/customers/Customer';

// project libraries
import { 
  AggregateRoot, 
  DomainEvent,
  Entity,
  ValueObject,
} from '../lib';
```

### 1.2. Type Definitions

- Use vertical bar alignment for union types.
- Break long interfaces across multiple lines.
- Group similar types together.

```typescript
type AccountStatus = 
  | 'pending' 
  | 'active' 
  | 'dormant'
  | 'closed';

interface AccountDetails {
  type: 'checking' | 'savings';
  currency: string;
  createdAt: Date;
}
```

### 1.3. Classes

- Use private class fields with a `#` prefix instead of the `private` keyword.
- Group related fields together.
- Initialize fields via the `apply()` method in aggregates.

```typescript
export class Account extends AggregateRoot<string> {
  #customerId!: string;
  #balance!: Money;
  #status!: AccountStatus;

  private constructor(id: string) {
    super(id);
  }
}
```

### 1.4. Methods

- Include a concise JSDoc for public methods only.
- Use the `#` prefix for private methods.
- Keep comments lowercase and brief.

```typescript
/**
 * deposits funds into the account
 */
deposit(amount: Money): void {
  // implementation
}

/**
 * validates transaction eligibility
 */
#canPerformTransaction(amount: Money): boolean {
  // implementation
}
```

## 2. Architecture

### 2.1. Domain-Driven Design (DDD)

The system is built using DDD principles.

- **Core**: The core logic is organized into domains (`customers`, `accounts`, etc.) located in `src/core/`.
- **Aggregates**: Each domain has an Aggregate Root (e.g., `Customer.ts`, `Account.ts`) that enforces business rules and invariants. It is the only object that can be loaded from the repository.
- **Entities**: Objects with an identity that are not aggregate roots.
- **Value Objects**: Immutable objects without identity, defined by their attributes (e.g., `Money.ts`).
- **Repositories**: Provide an abstraction for persisting and retrieving Aggregate Roots. The repository interface for a domain is defined in that domain's `primitives.ts` file (e.g., `IAccountRepository` in `src/core/accounts/primitives.ts`).
- **Services**: Contain domain logic that doesn't naturally fit within an aggregate (e.g., coordinating between aggregates or external systems).

### 2.2. Event Sourcing

- **Pattern**: State changes are not saved directly. Instead, they are recorded as a sequence of immutable `DomainEvent`s. The current state of an aggregate is derived by replaying its events.
- **Events**: Events are past-tense statements about something that happened in the domain (e.g., `CustomerCreated`, `AccountCredited`). They are stored in the `EventStore`.
- **Event Bus**: An `EventBus` is used to publish events to other parts of the system or external services for asynchronous processing.

### 2.3. Configuration Management

- **`config.yml`**: The primary file for configuring the bank's behavior, including feature flags, business rules, and integration settings. **DO NOT** store secrets here.
- **`.env`**: Used for environment-specific variables and secrets (API keys, database credentials).
- **`AppConfig.ts`**: The central loader for `config.yml`. All configuration access should go through this module.
- **`IntegrationFactory.ts`**: Dynamically creates provider instances based on the `integrations` section of `config.yml`.

## 3. Adding New Features

### 3.1. How to Add a New Domain

1.  Create a new directory under `src/core/`.
2.  Define the Aggregate Root and Events.
3.  Define the repository interface (e.g., `INewDomainRepository`) in a `primitives.ts` file within the new domain directory.
4.  Define the Application Service.
5.  Implement the repository in the `infrastructure` layer.
6.  Add API routes in a new file under `src/api/routes/`.

### 3.2. How to Add a New Integration Provider

1.  Add the new provider's implementation in the appropriate `src/integrations/` subdirectory (e.g., `src/integrations/kyc/NewKYC.ts`). It must implement the base `...Provider.ts`