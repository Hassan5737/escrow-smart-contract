# Escrow Contract Fundamentals and Implementation

## Overview

This day focuses on building the first version of an Ethereum Escrow smart contract using Solidity.

An escrow contract acts as an intermediary that holds funds until predefined conditions are satisfied. Instead of transferring funds directly between two parties, the funds are deposited into a smart contract and released according to an agreed approval process.

In this implementation, the contract involves three participants:

- **Buyer:** The party depositing funds and approving the transaction.
- **Seller:** The party receiving the funds after the required approvals.
- **Arbiter:** A trusted third party responsible for resolving disputes.

The goal of this implementation is to understand the core structure and behavior of an escrow contract, including fund management, access control, conditional execution, dispute handling, and gas-efficient error handling.

## 1. Understanding an Escrow Smart Contract

An escrow smart contract holds funds on behalf of two parties until specific conditions are met.

This approach is useful when two parties want to complete a transaction without requiring one party to blindly trust the other.

### Example Scenario

Imagine a buyer wants to purchase a product from a seller:

1. The buyer deposits the agreed amount into the escrow contract.
2. The seller agrees to the transaction.
3. Both parties approve the transaction.
4. Once both approvals are received, the contract releases the funds to the seller.

If a disagreement occurs before the transaction is completed, either party can raise a dispute. The arbiter then decides whether the funds should be released to the seller or returned to the buyer.

### Why Use a Smart Contract?

A smart contract can enforce predefined conditions programmatically.

Once deployed, the contract's rules determine when funds can be transferred and which participants are authorized to perform specific actions.

This reduces the need to rely on one party to manually execute the agreed conditions.

## 2. Contract Structure and State Variables

The implementation starts with the Solidity version declaration and the contract definition.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

contract Escrow {
    // Contract implementation
}
```

### SPDX License Identifier

The SPDX identifier specifies the license under which the source code is published.

It helps tools and developers identify the licensing terms of the contract.

### Pragma Directive

The pragma directive specifies the Solidity compiler version range accepted by the source file.

In this project:

```solidity
pragma solidity ^0.8.31;
```

The caret allows compatible compiler versions from 0.8.31 up to, but not including, 0.9.0.

### State Variables

State variables store information on the blockchain as part of the contract's persistent state.

The Escrow contract uses the following variables:

```solidity
address public buyer;
address public seller;
address public arbiter;

uint256 public amount;

bool public buyerApproved;
bool public sellerApproved;
bool public isDisputeRaised;
```

| Variable | Purpose |
|---|---|
| `buyer` | Stores the buyer's address. |
| `seller` | Stores the seller's address. |
| `arbiter` | Stores the arbiter's address. |
| `amount` | Stores the amount deposited during deployment. |
| `buyerApproved` | Indicates whether the buyer has approved the transaction. |
| `sellerApproved` | Indicates whether the seller has approved the transaction. |
| `isDisputeRaised` | Indicates whether a dispute has been raised. |

### The `public` Visibility Modifier

The `public` modifier makes a state variable accessible through an automatically generated getter function.

For example:

```solidity
address public buyer;
```

Allows external callers to retrieve the buyer's address without writing a separate getter function.

### Why Use `bool`?

A Boolean variable represents one of two possible values:

- `true`
- `false`

In this contract, Boolean variables are used to track approvals and the dispute status.

## 3. Constructor and Initial Fund Deposit

A constructor is a special function that executes only once when a contract is deployed.

It is commonly used to initialize the contract's state.

```solidity
constructor(
    address _buyer,
    address _seller,
    address _arbiter
) payable {
    buyer = _buyer;
    seller = _seller;
    arbiter = _arbiter;
    amount = msg.value;
}
```

### Constructor Parameters

The constructor receives three addresses:

- `_buyer`: The buyer's address.
- `_seller`: The seller's address.
- `_arbiter`: The arbiter's address.

These values are assigned to the corresponding state variables.

### The `payable` Modifier

The `payable` modifier allows a function to receive Ether.

Since the constructor is payable, the contract can receive its initial deposit during deployment.

### Understanding `msg.value`

`msg.value` represents the amount of Ether, measured in wei, sent with the current transaction.

The constructor stores this value in:

```solidity
amount = msg.value;
```

This allows the contract to keep track of the initial escrow deposit.

**Important:** The amount is stored in wei, which is the smallest denomination of Ether.

## 4. Access Control

Access control determines which addresses are authorized to execute specific functions.

The contract uses `msg.sender` to identify the address that initiated the current transaction.

For example:

```solidity
if (msg.sender != buyer) revert Escrow_onlyBuyer();
```

This condition ensures that only the buyer can execute the protected operation.

The contract defines different authorization rules:

| Participant | Authorized Operations |
|---|---|
| Buyer | Approve the transaction and raise a dispute. |
| Seller | Approve the transaction and raise a dispute. |
| Arbiter | Resolve a raised dispute. |

Access control is essential because smart contracts are publicly accessible. Without proper authorization checks, unauthorized addresses could execute sensitive operations.

## 5. Buyer and Seller Approvals

The contract requires both parties to approve the transaction before automatically releasing the funds.

### Buyer Approval

```solidity
function approveByBuyer() external {
    if (msg.sender != buyer) revert Escrow_onlyBuyer();

    buyerApproved = true;

    releaseIfAgreed();
}
```

This function:

1. Verifies that the caller is the buyer.
2. Updates `buyerApproved` to `true`.
3. Calls `releaseIfAgreed()` to check whether the release conditions have been satisfied.

### Seller Approval

```solidity
function approveBySeller() external {
    if (msg.sender != seller) revert Escrow_onlySeller();

    sellerApproved = true;

    releaseIfAgreed();
}
```

This function follows the same process but verifies the seller's address and updates `sellerApproved`.

### Why Separate Approval Functions?

Each participant must independently authorize the transaction.

This makes the approval process explicit and prevents one participant from approving on behalf of the other.

## 6. Conditional Fund Release

The `releaseIfAgreed()` function is responsible for checking whether the contract can release the escrowed funds.

```solidity
function releaseIfAgreed() internal {
    if (
        buyerApproved &&
        sellerApproved &&
        !isDisputeRaised
    ) {
        (bool success, ) = seller.call{value: amount}("");

        if (!success) revert Escrow_TransferFailed();
    }
}
```

### Understanding the Release Conditions

The contract checks three conditions:

1. `buyerApproved` must be `true`.
2. `sellerApproved` must be `true`.
3. `isDisputeRaised` must be `false`.

Only when all three conditions are satisfied does the contract attempt to transfer the funds.

### Understanding `internal`

The `internal` visibility modifier allows a function to be called from within the contract and its derived contracts.

It cannot be called directly by an ordinary external account.

This is appropriate for `releaseIfAgreed()` because it is an internal operation triggered by the approval functions.

### Understanding Low-Level `call`

The following statement transfers Ether to the seller:

```solidity
(bool success, ) = seller.call{value: amount}("");
```

The `call` operation returns two values:

- `success`: A Boolean indicating whether the call succeeded.
- Return data: The data returned by the called account, which is ignored here.

The `value` option specifies how much Ether to send.

The empty string means that no function-call data is being supplied.

### Why Check `success`?

Unlike high-level calls that automatically propagate failures, low-level `call` reports failure through its returned Boolean value.

Therefore, the contract must explicitly check the result.

```solidity
if (!success) revert Escrow_TransferFailed();
```

If the transfer fails, the transaction is reverted.

## 7. Raising a Dispute

Either the buyer or the seller can raise a dispute before the transaction is completed.

```solidity
function raiseDispute() external {
    if (
        msg.sender != buyer &&
        msg.sender != seller
    ) revert Escrow_onlyBuyerOrSeller();

    isDisputeRaised = true;
}
```

### How It Works

1. The contract checks whether the caller is the buyer or seller.
2. If neither party initiated the transaction, the operation reverts.
3. Otherwise, `isDisputeRaised` becomes `true`.

### Why Is the Dispute Flag Important?

The dispute flag prevents the automatic release condition from being satisfied.

The `releaseIfAgreed()` function explicitly checks:

```solidity
!isDisputeRaised
```

This means that once a dispute has been raised, the normal approval process cannot automatically release the funds.

The contract must instead follow the dispute resolution process.

## 8. Resolving a Dispute

The arbiter is responsible for deciding the outcome of a dispute.

```solidity
function resolveDispute(bool _approveForSeller) external {
    if (msg.sender != arbiter) revert Escrow_onlyArbiter();

    if (!isDisputeRaised) revert Escrow_NoDisputeRaised();

    if (_approveForSeller) {
        (bool success, ) = seller.call{value: amount}("");

        if (!success) revert Escrow_TransferFailed();
    } else {
        (bool success, ) = buyer.call{value: amount}("");

        if (!success) revert Escrow_TransferFailed();
    }
}
```

### Understanding the Function Parameter

The function receives a Boolean parameter:

`_approveForSeller`

- `true`: The arbiter approves releasing the funds to the seller.
- `false`: The arbiter decides that the funds should be returned to the buyer.

### Resolution Process

Before making a decision, the contract verifies two conditions:

1. The caller must be the arbiter.
2. A dispute must already have been raised.

After these checks, the contract transfers the funds according to the arbiter's decision.

This creates two possible outcomes:

| Arbiter Decision | Fund Recipient |
|---|---|
| `true` | Seller |
| `false` | Buyer |

The same transfer-success check is used in both cases to handle failed Ether transfers.

## 9. Custom Errors and Gas Optimization

Custom errors are one of the important improvements introduced in Solidity 0.8.4.

They provide a structured and gas-efficient way to report why a transaction should fail.

Instead of using traditional `require` statements with string messages, this implementation defines custom errors and triggers them using `revert`.

### Traditional `require`

A common approach to validation is:

```solidity
require(msg.sender == buyer, "Only buyer can perform this action");
```

This works, but the descriptive string requires additional encoded error data.

### Custom Error Approach

The Escrow contract defines its errors as follows:

```solidity
error Escrow_onlyBuyer();
error Escrow_onlySeller();
error Escrow_onlyBuyerOrSeller();
error Escrow_onlyArbiter();
error Escrow_NoDisputeRaised();
error Escrow_TransferFailed();
```

They are then used with the `revert` statement:

```solidity
if (msg.sender != buyer) revert Escrow_onlyBuyer();
```

### Why Are Custom Errors More Gas-Efficient?

The key difference is how the revert information is encoded.

A traditional string-based revert uses the built-in `Error(string)` format, which includes dynamically encoded string data.

A custom error without parameters only needs its four-byte error selector.

That means Solidity can return a compact error identifier instead of encoding a descriptive string.

This can reduce:

- Contract deployment cost.
- Runtime gas cost when the reverting condition is reached.
- The amount of revert data generated.

The exact savings depend on the error message, compiler settings, and implementation.

### Understanding the Error Selector

An error selector is the first four bytes of the Keccak-256 hash of the error signature.

For example:

```solidity
error Escrow_onlyBuyer();
```

Its signature is:

```text
Escrow_onlyBuyer()
```

The selector identifies the custom error and allows external tools and applications to decode the failure using the contract ABI.

### Why Use `revert`?

The `revert` statement stops the current execution and rolls back state changes made during the reverted call.

For example:

```solidity
if (msg.sender != arbiter) revert Escrow_onlyArbiter();
```

If someone other than the arbiter calls this function, the operation is stopped immediately and the error is returned.

### Can Custom Errors Have Parameters?

Yes.

Custom errors can include parameters to provide additional context.

For example:

```solidity
error InsufficientBalance(uint256 available, uint256 required);
```

Usage:

```solidity
if (amount > balance) {
    revert InsufficientBalance(balance, amount);
}
```

This makes custom errors useful for both simple authorization checks and more detailed validation.

### Important Comparison

| Approach | Error Information | Gas Consideration |
|---|---|---|
| `require(condition, "message")` | String-based error message | Usually more expensive than a parameterless custom error. |
| `require(condition)` | No descriptive message | Does not include a string payload. |
| `if (!condition) revert CustomError()` | Custom error selector | Compact and usually gas-efficient. |

**Key takeaway:** Custom errors are not just a different syntax for reporting failures. They provide a structured way to communicate errors while reducing the cost associated with string-based revert messages.

## 10. Complete Contract Workflow

The current implementation follows this sequence:

1. Deploy the contract with the buyer, seller, and arbiter addresses.
2. Deposit Ether through the payable constructor.
3. The buyer and seller independently approve the transaction.
4. After both approvals, the contract checks whether a dispute exists.
5. If no dispute exists, the contract attempts to release the funds to the seller.
6. If either party raises a dispute before automatic release, the arbiter can resolve it.
7. The arbiter chooses whether the funds should go to the seller or return to the buyer.

## 11. Current Implementation and Known Limitations

This version focuses on understanding the fundamental Escrow workflow. It is an educational implementation, not a production-ready financial contract.

The following considerations should be addressed in future development:

- **Input validation:** The constructor does not currently validate zero addresses or ensure that the participants are different.
- **Release state tracking:** There is no dedicated `isReleased` state variable to record that the funds have already been released.
- **State updates before external calls:** The transfer functions should follow the Checks-Effects-Interactions pattern and account for reentrancy risks.
- **Dispute lifecycle:** The contract does not currently reset or finalize the dispute state after resolution.
- **Repeated operations:** Additional state checks are needed to prevent operations from being repeated after the escrow has been completed.
- **Testing:** The implementation still needs comprehensive unit tests, including unauthorized calls, failed transfers, approval combinations, and dispute scenarios.

These limitations are useful learning opportunities and will guide subsequent improvements.

## 12. Key Concepts Learned

By completing this implementation, the following Solidity and smart contract concepts were explored:

- Escrow smart contract architecture.
- Solidity contract structure and state variables.
- Constructor initialization.
- Payable functions and Ether deposits.
- `msg.sender` and `msg.value`.
- Visibility modifiers: `external` and `internal`.
- Access control using address comparisons.
- Boolean state tracking.
- Conditional execution.
- Ether transfers using low-level `call`.
- Handling failed external calls.
- Dispute management and arbitration.
- Custom errors and the `revert` statement.
- Gas optimization through efficient error handling.

## References

- [Solidity Documentation: Contracts and Custom Errors](https://docs.soliditylang.org/en/latest/contracts.html#custom-errors)
- [Solidity Documentation: Error Handling and Revert](https://docs.soliditylang.org/en/latest/control-structures.html#error-handling-assert-require-revert-and-exceptions)
- [Solidity Blog: Custom Errors](https://www.soliditylang.org/blog/2021/04/21/custom-errors/)

---

**Project:** Escrow Smart Contract  
**Development Day:** 01  
**Status:** Initial implementation completed; testing and security improvements are pending.