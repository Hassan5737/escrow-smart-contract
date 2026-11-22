# Escrow Smart Contract

A Foundry-based Ethereum smart contract project focused on secure fund management between buyers and sellers, approval mechanisms, dispute resolution, and comprehensive smart contract testing.

## Overview

This project explores the development of an Escrow Smart Contract on Ethereum using Solidity and Foundry.

An escrow contract acts as an intermediary that securely holds funds until predefined conditions are satisfied. It helps establish trust between buyers and sellers by enforcing agreed-upon rules through smart contract logic.

The project is being developed as a practical learning experience, with an emphasis on understanding contract architecture, access control, fund management, dispute handling, and security-focused testing.

## Project Objectives

- Understand the architecture and functionality of an Escrow Smart Contract.
- Implement buyer and seller approval mechanisms.
- Manage secure fund deposits and releases.
- Handle disputes between involved parties.
- Apply custom errors for efficient error handling.
- Develop comprehensive tests covering expected behavior and negative scenarios.
- Practice smart contract development and testing using Foundry.

## Planned Features

The project is planned to cover the following functionality:

- Escrow contract initialization and configuration.
- Buyer and seller approval.
- Conditional fund release to the seller.
- Dispute submission and resolution.
- Custom errors and access restrictions.
- Unit testing and negative scenario testing.

*Features will be documented and updated as implementation progresses.*

## Technology Stack

- **Solidity:** Smart contract development.
- **Foundry:** Development, compilation, testing, and deployment framework.
- **Forge:** Smart contract testing and build management.
- **Git & GitHub:** Version control and project documentation.

## Project Structure

```text
escrow-smart-contract/
├── days/               # Day-by-day learning and implementation documentation
│   └── day-01/
├── lib/                # Project dependencies
├── script/             # Deployment and interaction scripts
├── src/                # Solidity smart contracts
├── test/               # Smart contract tests
├── foundry.toml        # Foundry configuration
├── .gitignore
└── README.md
```

## Development Status

<em>In Progress</em>

The project repository has been initialized, and its initial documentation and development structure are being established.

Smart contract implementation, testing, and further documentation will be added progressively throughout development.

## Learning Documentation

The `days/` directory is dedicated to documenting the project's development journey.

Each day will have its own README file covering:

- Concepts and technical topics studied.
- Implementation steps and code changes.
- Important technical decisions.
- Testing procedures and results.
- Key takeaways from the development process.

This documentation will provide a chronological record of how the project evolves from its initial setup into a complete implementation.

## Getting Started

### Prerequisites

- Git
- Foundry

### Installation

Clone the repository:

```bash
git clone https://github.com/Hassan5737/escrow-smart-contract.git
cd escrow-smart-contract
```

Install dependencies:

```bash
forge install
```

### Build

```bash
forge build
```

### Run Tests

```bash
forge test
```

## Author

**Hassan Ahmed Hassan**

- GitHub: [Hassan5737](https://github.com/Hassan5737)
- LinkedIn: [Hassan Ahmed Assad](https://www.linkedin.com/in/hassan-ahmed-assad/)

---

This project is part of an ongoing journey in Blockchain and Web3 development, with a focus on building practical Ethereum smart contract applications.