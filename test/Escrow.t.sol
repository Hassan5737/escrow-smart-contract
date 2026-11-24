//  SPDX-License-Identifier: MIT
pragma solidity ^0.8.31;

import {Test} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";

contract RejectEther {
    // empty contract intentionally - no receive() or fallback()
}

contract EscrowTest is Test {
    Escrow public escrow;

    address public buyer = makeAddr("buye");
    address public seller = makeAddr("seller");
    address public arbiter = makeAddr("arbiter");

    uint256 public constant AMOUNT = 1 ether;

    function setUp() public {
        escrow = new Escrow{value: AMOUNT}(buyer, seller, arbiter);

    }

    function test_Constructor() public view {
        assertEq(escrow.buyer(), buyer);
        assertEq(escrow.seller(), seller);
        assertEq(escrow.arbiter(), arbiter);
        assertEq(escrow.amount(), AMOUNT);
        assertEq(address(escrow).balance, AMOUNT);
        assertFalse(escrow.buyerApproved());
        assertFalse(escrow.sellerApproved());
        assertFalse(escrow.isDisputeRaised());
    }

    function test_approveByBuyer_RevertIfNotBuyer() public {
        vm.prank(seller);
        vm.expectRevert(Escrow.Escrow_onlyBuyer.selector);
        escrow.approveByBuyer();
    }

    function test_approveByBuyer_NoReleaseWhenSellerHasNotApproved() public {
        vm.prank(buyer);
        escrow.approveByBuyer();

        assertTrue(escrow.buyerApproved());
        assertFalse(escrow.sellerApproved());
        assertEq(address(escrow).balance, AMOUNT);
        assertEq(seller.balance, 0);

    }

    function test_approveBySeller_RevertIfNotSeller() public {
        vm.prank(buyer);
        vm.expectRevert(Escrow.Escrow_onlySeller.selector);
        escrow.approveBySeller();

    }

        function test_approveBySeller_NoReleaseWhenBuyerHasNotApproved() public {
        vm.prank(seller);
        escrow.approveBySeller();

        assertTrue(escrow.sellerApproved());
        assertFalse(escrow.buyerApproved());
        assertEq(address(escrow).balance, AMOUNT);
        assertEq(seller.balance, 0);

    }

    function test_releaseWhenBuyerThenSellerApprove_transferFundsToSeller() public {
        uint256 sellerBalanceBefore = seller.balance;

        vm.prank(buyer);
        escrow.approveByBuyer();
        vm.prank(seller);
        escrow.approveBySeller();

        assertEq(address(escrow).balance, 0);
        assertEq(seller.balance, sellerBalanceBefore + AMOUNT);
    }
    function test_releaseWhenSellerThenBuyerApprove_transferFundsToSeller() public {
        uint256 sellerBalanceBefore = seller.balance;

        vm.prank(seller);
        escrow.approveBySeller();
        vm.prank(buyer);
        escrow.approveByBuyer();

        assertEq(address(escrow).balance, 0);
        assertEq(seller.balance, sellerBalanceBefore + AMOUNT);
    }

    function test_Release_DoseNotHappen_WhenDisputeRaised () public {
        uint256 sellerBalanceBefore = seller.balance;

        vm.prank(buyer);
        escrow.approveByBuyer();

        vm.prank(buyer);
        escrow.raiseDispute();

        vm.prank(seller);
        escrow.approveBySeller();

        assertTrue(escrow.buyerApproved());
        assertTrue(escrow.sellerApproved());
        assertTrue(escrow.isDisputeRaised());
        assertEq(address(escrow).balance, AMOUNT);
        assertEq(seller.balance, sellerBalanceBefore);
    }

    function test_Release_RevertsOnTransferFailure_WhenSellerCannotReceiveEther() public {
        RejectEther badSeller = new RejectEther();
        Escrow badEscrow = new Escrow{value: AMOUNT}(buyer, address(badSeller), arbiter);

        vm.prank(buyer);
        badEscrow.approveByBuyer();
        vm.prank(address(badSeller));
        vm.expectRevert(Escrow.Escrow_TransferFailed.selector);
        badEscrow.approveBySeller();
    }

    function test_raiseDispute_RevertsIfNotBuyerOrSeller() public {
        vm.prank(arbiter);
        vm.expectRevert(Escrow.Escrow_onlyBuyerOrSeller.selector);
        escrow.raiseDispute();
    }

    function test_raiseDispute_ByBuyer() public {
        vm.prank(buyer);
        escrow.raiseDispute();
        assertTrue(escrow.isDisputeRaised());
    }

    function test_raiseDispute_BySeller() public {
        vm.prank(seller);
        escrow.raiseDispute();
        assertTrue(escrow.isDisputeRaised());
    }

    function test_ResolveDispute_RevertsIfNotArbiter() public {
        vm.prank(buyer);
        escrow.raiseDispute();

        vm.prank(buyer);
        vm.expectRevert(Escrow.Escrow_onlyArbiter.selector);
        escrow.resolveDispute(false);
        
    }

    function test_ResolveDispute_RevertsIfNoDisputeRaised() public {
        vm.prank(arbiter);
        vm.expectRevert(Escrow.Escrow_NoDisputeRaised.selector);
        escrow.resolveDispute(true);
    }

    function test_ResolveDispute_ApproveForSeller() public {
        uint256 sellerBalanceBefore = seller.balance;


        vm.prank(buyer);
        escrow.raiseDispute();

        vm.prank(arbiter);
        escrow.resolveDispute(true);

        assertEq(address(escrow).balance, 0);
        assertEq(seller.balance, sellerBalanceBefore + AMOUNT);
    }

    function test_ResolveDispute_ApproveForBuyer() public {
        uint256 buyerBalanceBefore = buyer.balance;


        vm.prank(buyer);
        escrow.raiseDispute();

        vm.prank(arbiter);
        escrow.resolveDispute(false);

        assertEq(address(escrow).balance, 0);
        assertEq(buyer.balance, buyerBalanceBefore + AMOUNT);
    }

    function test_ResolveDispute_RevertsOnTransferFailure_ToSeller() public {
        RejectEther badSeller = new RejectEther();
        Escrow badEscrow = new Escrow{value: AMOUNT}(buyer, address(badSeller), arbiter);

        vm.prank(buyer);
        badEscrow.raiseDispute();

        vm.prank(arbiter);
        vm.expectRevert(Escrow.Escrow_TransferFailed.selector);
        badEscrow.resolveDispute(true);
    }
    function test_ResolveDispute_RevertsOnTransferFailure_ToBuyer() public {
        RejectEther badBuyer = new RejectEther();
        Escrow badEscrow = new Escrow{value: AMOUNT}(address(badBuyer), seller, arbiter);

        vm.prank(seller);
        badEscrow.raiseDispute();

        vm.prank(arbiter);
        vm.expectRevert(Escrow.Escrow_TransferFailed.selector);
        badEscrow.resolveDispute(false);
    }
}