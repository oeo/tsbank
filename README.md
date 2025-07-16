# Core Banking DDD System

A Domain-Driven Design (DDD) core banking system with event sourcing, built with Bun and TypeScript. This system is designed to be highly configurable and extensible, allowing for different features, business rules, and integrations to be enabled per deployment.

## 🚀 Quick Start

1.  **Clone the repository**
    ```bash
    git clone . 
    cd tsbank
    ```

2.  **Install dependencies**
    ```bash
    bun install
    ```

3.  **Configure your bank**
    - Copy the example environment file: `cp .env.example .env`
    - Edit `.env` to include your secrets for integrations and services.
    - Edit `config.yml` to define your bank's settings, features, integrations, and business rules.

4.  **Start infrastructure services**
    ```bash
    docker-compose up -d
    ```
    This will start EdgeDB, Redis, and RabbitMQ.

5.  **Initialize the database**
    ```bash
    bun db:migrate
    bun db:seed
    ```

6.  **Start the application**
    ```bash
    bun dev
    ```
    The API will be available at `http://localhost:3000`.

## 🔧 Configuration

The system's behavior is primarily controlled by two files:

### `config.yml`
This file is the heart of the bank's configuration. It allows you to tailor the system without changing any code.

- **`bank`**: General information like bank name, country, and default currency.
- **`features`**: A set of feature flags to enable or disable major functionalities like Bitcoin-backed loans or business accounts.
- **`integrations`**: Select the desired third-party provider for services like KYC, custody, and fraud detection.
- **`limits`**: Define business rules such as transaction limits, loan-to-value ratios, and withdrawal limits.
- **`risk`**: Configure risk management parameters, including customer risk levels and collateral monitoring thresholds.
- **`compliance`**: Set rules for regulatory requirements like KYC and AML monitoring.

### `.env`
This file holds all secrets and environment-specific connection strings. It should never be committed to source control. Use it for API keys, database passwords, and other sensitive information required by the integrations and services defined in `config.yml`.

## 🏗️ Architecture

The system is architected using principles of Domain-Driven Design (DDD) and Event Sourcing.

### Domains
The core business logic is segregated into domains, each representing a distinct part of the banking business:
- **`customers`**: Manages customer information, onboarding, and KYC status.
- **`accounts`**: Handles creation and management of customer accounts (checking, savings, etc.).
- **`transactions`**: Responsible for processing all money movements.
- **`lending`**: Manages loan origination, collateral, and servicing.
- **`custody`**: Handles digital asset custody, particularly for collateral.
- **`compliance`**: Manages regulatory reporting and compliance checks.

### Event Sourcing
Instead of storing the current state of data, we store a sequence of all changes as immutable events. This provides a full audit trail, historical data, and powerful debugging capabilities.

### Pluggable Integrations
The system uses a factory pattern to dynamically load third-party service providers based on the `config.yml` file. This makes it easy to switch between providers (e.g., from Jumio to Onfido for KYC) with a simple configuration change.

## 🧪 Testing

The project uses Bun's built-in test runner.

```bash
# Run all tests once
bun test

# Run tests in watch mode
bun test --watch
```

## 🐳 Deployment

The application's supporting services (database, message broker) are containerized using Docker for easy setup.

```bash
# Build and deploy all services
docker-compose up --build -d
```

You can then run the application locally, and it will connect to the services running in Docker.

```bash
bun dev
```

## 🔒 Security

- **Audit Trail**: Event sourcing provides a complete, immutable log of all actions.
- **Configuration**: Secrets are strictly managed via environment variables. 
