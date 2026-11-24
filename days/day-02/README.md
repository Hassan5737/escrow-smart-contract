# Smart Contract Testing & Deployment

## Overview

The second and final development day of this Escrow Smart Contract project focused on testing the contract's behavior, validating its main execution paths, handling failure scenarios, and deploying the contract to the Ethereum Sepolia testnet.

After implementing the core Escrow functionality on Day 01, this stage focused on verifying that the contract behaves as expected under different conditions.

The project was tested using Foundry, achieving 18 passing tests and 100% coverage across lines, statements, branches, and functions. The contract was then deployed to Sepolia and verified through multiple blockchain explorers.

## 1. Testing Environment

The project uses Foundry's testing framework to write and execute Solidity tests.

The test file is located at:

```text
test/
└── Escrow.t.sol
```

The test contract imports Foundry's `Test` utility and the Escrow contract:

```solidity
import {Test} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";
```

### Test Setup

The `setUp()` function initializes a fresh testing environment before each test.

It deploys a new Escrow contract with:

- A predefined buyer address.
- A predefined seller address.
- A predefined arbiter address.
- An initial deposit of 1 ETH.

The test addresses are generated using Foundry's `makeAddr()` helper.

```solidity
address public buyer = makeAddr("buyer");
address public seller = makeAddr("seller");
address public arbiter = makeAddr("arbiter");

uint256 public constant AMOUNT = 1 ether;

function setUp() public {
    escrow = new Escrow{value: AMOUNT}(buyer, seller, arbiter);
}
```

Using a fresh contract instance for every test keeps test scenarios isolated and prevents state changes in one test from affecting another.

## 2. Constructor Testing

The constructor test verifies that the contract is initialized correctly.

It checks:

- The buyer address.
- The seller address.
- The arbiter address.
- The deposited amount.
- The contract's Ether balance.
- The initial approval states.
- The initial dispute state.

The test confirms that the contract starts with the expected configuration and that all approval and dispute flags are initially false.

## 3. Access Control & Approval Testing

The approval functions are restricted to their respective participants.

The tests verify that:

- Only the buyer can call `approveByBuyer()`.
- Only the seller can call `approveBySeller()`.
- Unauthorized callers receive the expected custom error.
- Approving by only one participant does not release the funds.

The tests also cover both approval sequences:

1. Buyer approves first, followed by the seller.
2. Seller approves first, followed by the buyer.

In both successful scenarios, the contract transfers the deposited Ether to the seller after both approvals are received.

## 4. Negative Testing

Negative testing checks how a contract behaves when an operation is attempted under conditions that should prevent it from succeeding.

This is especially important in smart contracts because unexpected execution paths can lead to incorrect state transitions or unintended fund transfers.

### Scenario 1: Dispute Prevents Fund Release

The test performs the following steps:

1. The buyer approves the transaction.
2. The buyer raises a dispute.
3. The seller approves the transaction.
4. The test verifies that the funds remain in the Escrow contract.

Even though both participants have approved, the raised dispute prevents the normal release mechanism from transferring the funds.

### Scenario 2: Ether Transfer Failure

A helper contract named `RejectEther` is used to simulate a recipient that cannot receive Ether.

It intentionally does not implement a `receive()` or `fallback()` function.

The test verifies that when the seller cannot receive Ether, the transfer fails and the Escrow contract reverts with:

```solidity
Escrow.Escrow_TransferFailed.selector
```

This checks the failure-handling behavior of the low-level `call` operation.

## 5. Dispute Testing

The dispute mechanism is tested from both authorization and execution perspectives.

### Raising a Dispute

The tests verify that:

- The buyer can raise a dispute.
- The seller can raise a dispute.
- Unauthorized accounts cannot raise a dispute.

### Resolving a Dispute

The tests verify that:

- Only the arbiter can resolve a dispute.
- The arbiter cannot resolve a dispute if none has been raised.
- The arbiter can release the funds to the seller.
- The arbiter can return the funds to the buyer.

### Transfer Failure During Dispute Resolution

Additional tests simulate failed Ether transfers when the arbiter attempts to send funds to either participant.

These tests confirm that the contract reverts with the expected custom error when the recipient cannot receive Ether.

## 6. Foundry Testing Utilities

The test suite uses several Foundry utilities and assertion methods.

| Utility | Purpose |
|---|---|
| `setUp()` | Initializes the testing environment before each test. |
| `makeAddr()` | Creates deterministic test addresses. |
| `vm.prank()` | Executes the next call as a specified address. |
| `vm.expectRevert()` | Expects the next call to revert with a specified error. |
| `assertEq()` | Checks whether two values are equal. |
| `assertTrue()` | Checks whether a condition is true. |
| `assertFalse()` | Checks whether a condition is false. |

These utilities make it possible to simulate different participants, validate access restrictions, and test both successful and unsuccessful execution paths.

## 7. Test Results

The complete test suite was executed using:

```bash
forge test
```

Results:

```text
Ran 18 tests for test/Escrow.t.sol:EscrowTest

Suite result: ok.
18 passed; 0 failed; 0 skipped
```

### Coverage Report

Coverage was generated using:

```bash
forge coverage
```

The reported results were:

| Metric | Coverage |
|---|---:|
| Lines | 100% (28/28) |
| Statements | 100% (36/36) |
| Branches | 100% (11/11) |
| Functions | 100% (6/6) |

All reported executable lines, statements, branches, and functions in `src/Escrow.sol` were covered by the test suite.

A 100% coverage report indicates that the measured code paths were exercised by tests. It does not, by itself, guarantee the absence of security vulnerabilities or prove that every possible edge case has been tested.

## 8. Sepolia Deployment

After completing the tests, the Escrow contract was deployed to the Ethereum Sepolia testnet.

The deployment used Foundry's `forge create` command.

The deployment configuration was organized using a Makefile, while environment-specific values were stored in a local `.env` file.

The deployment command uses:

- The Foundry account keystore.
- The Sepolia RPC endpoint.
- The `--broadcast` flag.
- The initial Ether deposit.
- The buyer, seller, and arbiter constructor arguments.

The contract was deployed with an initial deposit of 0.01 ETH.

### Deployment Details

| Field | Value |
|---|---|
| Network | Ethereum Sepolia |
| Chain ID | 11155111 |
| Contract | Escrow |
| Initial Deposit | 0.01 ETH |
| Compiler Used | Solidity 0.8.37 |
| Deployer | `0x708f5b324aCcC61c9bfc30bF10653783e3680d4E` |

### Contract Address

```text
0x87Be26BfA7714A1E50aAF60C712f7b3dc3Bc809D
```

### Constructor Participants

| Role | Address |
|---|---|
| Buyer | `0xbba7C7a7dC52d7e3C73AFa8D911179400488e685` |
| Seller | `0x5b9Ce141355C47DB71c33B918761E0F7c2a4f81e` |
| Arbiter | `0xCE182C721Ee80f639ebe506f9951b7894420f482` |

## 9. Contract Verification

After deployment, the contract source code was submitted for verification through multiple blockchain verification services.

The verification process allows developers and users to inspect the published source code and compare it with the deployed contract bytecode.

The deployed contract was successfully verified on Etherscan and submitted through Sourcify. The contract is also available on Blockscout.

Verification links:

- [Etherscan – Sepolia](https://sepolia.etherscan.io/address/0x87Be26BfA7714A1E50aAF60C712f7b3dc3Bc809D)
- [Sourcify – Full Match](https://repo.sourcify.dev/contracts/full_match/11155111/0x87Be26BfA7714A1E50aAF60C712f7b3dc3Bc809D/)
- [Blockscout – Sepolia](https://eth-sepolia.blockscout.com/address/0x87Be26BfA7714A1E50aAF60C712f7b3dc3Bc809D)

## 10. Deployment Configuration

The project uses a Makefile to simplify common deployment and verification commands.

The `.env` file contains local configuration values, including:

- `RPC_URL`
- `BUYER`
- `SELLER`
- `ARBITER`
- `ETHERSCAN_API_KEY`

Sensitive values are intentionally excluded from version control.

The `.gitignore` file excludes `.env` to prevent environment variables and API keys from being committed.

The Makefile provides two main targets:

- `make deploy` – Deploys the Escrow contract.
- `make verify` – Submits the deployed contract for source verification.

Never commit private keys, API keys, or other secrets to a public repository.

## 11. What I Learned

During this stage, I gained practical experience with:

- Writing isolated Solidity tests using Foundry.
- Testing constructor initialization and contract state.
- Simulating different callers with `vm.prank()`.
- Testing access control and custom error reverts.
- Covering successful and unsuccessful transaction paths.
- Simulating Ether transfer failures.
- Understanding the importance of negative testing.
- Measuring code coverage using `forge coverage`.
- Deploying contracts to an Ethereum testnet.
- Managing deployment configuration through environment variables and Makefiles.
- Verifying deployed contract source code through blockchain explorers.

## Final Result

The Escrow Smart Contract project was implemented, tested, deployed, and verified on the Ethereum Sepolia testnet.

The final test run reported 18 passing tests, with 100% coverage across all four reported coverage metrics.

This project provided practical experience with Solidity development, Foundry testing, Ether transfers, access control, dispute handling, testnet deployment, and contract verification.

**Project Status:** Initial implementation completed.

**Future Direction:** Extend the project with a frontend application and improve the smart contract's functionality, state management, and security before treating it as a production-ready system.