//  SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

contract Escrow {
    // custom Errors
    error Escrow_onlyBuyer();
    error Escrow_onlySeller();
    error Escrow_onlyBuyerOrSeller();
    error Escrow_onlyArbiter();
    error Escrow_NoDisputeRaised();
    error Escrow_TransferFailed();

    address public buyer;
    address public seller;
    address public arbiter;

    uint256 public amount;

    bool public buyerApproved;
    bool public sellerApproved;
    bool public isDisputeRaised;

    constructor(address _buyer, address _seller, address _arbiter) 
    payable {
        buyer = _buyer;
        seller = _seller;
        arbiter = _arbiter;
        amount = msg.value;
    }

    function approveByBuyer() external {
        if(msg.sender != buyer) revert Escrow_onlyBuyer();
        buyerApproved = true;

        releaseIfAgreed();
    }

    function approveBySeller() external {
       if(msg.sender != seller) revert Escrow_onlySeller();
        sellerApproved = true;

        releaseIfAgreed();
    }

    function releaseIfAgreed() internal {
        if( buyerApproved && sellerApproved && !isDisputeRaised)
        {
            (bool success, ) = seller.call{value: amount}("");
            if (!success) revert  Escrow_TransferFailed();
        }
    }

    function resolveDispute(bool _approveForSeller) external {
        if(msg.sender != arbiter) revert Escrow_onlyArbiter();
        if(!isDisputeRaised) revert  Escrow_NoDisputeRaised();

        if (_approveForSeller)
        {
            (bool success, ) = seller.call{value: amount}("");
            if (!success) revert  Escrow_TransferFailed();
        } else {
            (bool success, ) = buyer.call{value: amount}("");
            if (!success) revert  Escrow_TransferFailed();
        }
    }

    function raiseDispute() external {
        if(msg.sender != buyer && msg.sender != seller) revert Escrow_onlyBuyerOrSeller();
        isDisputeRaised = true;

    }
}