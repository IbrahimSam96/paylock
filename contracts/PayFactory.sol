// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

error Ammount__Empty();
error __NotSenderOrNotActive();
error __NoReedemablePayments();
error __InvalidCode();
error __TransferFailed();
error __TransferWithdrawn();

contract PayLock is Ownable, ERC721 {
    // Incrementer for tokenId
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Initializes openzeppelin ERC721.sol for minting NFT'S to grant USERS  VIP access and avoid fees.
    constructor() ERC721("PayLock", "LOCK") {}

    // Enums
    enum PaymentState {
        ACTIVE,
        WITHDRAWN,
        RECEIVED
    }
    // Structs
    struct payment {
        uint256 value;
        address payable issuer;
        address payable receiver;
        uint256 issuerId;
        uint256 receiverId;
        uint256 code;
        PaymentState state;
    }
    // Deployer Withdrawable Fee Collection*
    struct PaySafe {
        uint256 balance;
    }
    // State
    PaySafe public s_PaySafe;
    // A user has 2 arrays of issued & redeemable payments
    mapping(address => payment[]) public s_issuedPayments;
    mapping(address => payment[]) public s_redeemablePayments;
    // Events
    event PaymentIssued(address indexed sender, uint256 indexed value);
    event PaymentReedemed(address indexed receiver, uint256 indexed value);
    event PaymentWithdrawn(address indexed sender, uint256 indexed issuerIndex);

    /**
     * @dev Issue a payment.
     * `_receiver` Is a parameter supplied by the frontend to the issuer of transaction`.
     * `_code` Is a parameter supplied by the frontend to the issuer of transaction`.
     *
     * Requirements:
     * - `msg.value` Payment needs to have a value and connot be empty.
     *
     * Emits a {PaymentWithdrawn} event.
     */
    function CreatePayement(address payable _receiver, uint256 _code)
        public
        payable
    {
        // If payment is empty revert transaction
        bool AmountEmpty = msg.value == 0;
        if (AmountEmpty) {
            revert Ammount__Empty();
        }
        // prepare new memory payment struct
        payment memory newPayment;
        //IF user has a LOCK token, full value transaction fees = 0.0%
        if (balanceOf(msg.sender) > 0) {
            newPayment.value = msg.value;
        }
        //IF user has no LOCK token, value - 0.5% transaction fees = 0.5%
        if (balanceOf(msg.sender) == 0) {
            newPayment.value = msg.value - msg.value / 200;
            s_PaySafe.balance += msg.value / 200;
        }
        // Issue payment
        newPayment.issuer = payable(msg.sender);
        newPayment.receiver = payable(_receiver);
        newPayment.issuerId = s_issuedPayments[msg.sender].length;
        newPayment.receiverId = s_redeemablePayments[_receiver].length;
        newPayment.code = _code;
        newPayment.state = PaymentState.ACTIVE;
        // ADD payment to boths arrays of issuer and reedemable transactions
        s_issuedPayments[msg.sender].push(newPayment);
        s_redeemablePayments[_receiver].push(newPayment);
        // Emit PaymentIssued event
        emit PaymentIssued(msg.sender, newPayment.value);
    }

    /**
     * @dev Withdraw issued payment.
     * `_index` Is a parameter supplied by the frontend to the issuer of transaction`.
     *
     * Requirements:
     * - `notActive` Payment needs to be active i.e Not withdrawn or Received.
     * - `notReceiver` cannot be diffrent address than recepient.
     *
     * Emits a {PaymentWithdrawn} event.
     */
    function withdrawIssuerPayment(uint256 index) public payable {
        // get memory payment struct in issuer mapping
        payment memory issuedPayment = s_issuedPayments[msg.sender][index];

        bool notActive = issuedPayment.state != PaymentState.ACTIVE;
        bool notSender = issuedPayment.issuer != msg.sender;
        bool conditions = (notActive || notSender);
        if (conditions) {
            revert __NotSenderOrNotActive();
        }
        //Change state to Withdrawn.
        s_issuedPayments[msg.sender][index].state = PaymentState.WITHDRAWN;
        s_redeemablePayments[issuedPayment.receiver][issuedPayment.receiverId]
            .state = PaymentState.WITHDRAWN;
        // Emit PaymentWithdrawn event
        emit PaymentWithdrawn(msg.sender, index);
        (bool success, ) = msg.sender.call{value: issuedPayment.value}("");
        if (!success) {
            revert __TransferFailed();
        }
    }

    /**
     * @dev Redeem _code to receive Payment.
     * `_code` IS A UID supplied by the frontend to the issuer of transaction`.
     *
     * Requirements:
     * - `notActive` Payment needs to be active i.e Not withdrawn or Received.
     * - `notReceiver` cannot be diffrent address than recepient.
     *
     * Emits a {PaymentReedemed} event.
     */
    function RedeemPayment(uint256 _code) public payable {
        payment[] memory reedemablePayments = s_redeemablePayments[msg.sender];
        // No reedemable payments
        if (reedemablePayments.length == 0) {
            revert __NoReedemablePayments();
        }
        // Loop for reedemable payments with the code entered for the caller.
        for (uint256 i = 0; i < reedemablePayments.length; i++) {
            // If code is valid and Requirements are met transfer payment.
            if (reedemablePayments[i].code == _code) {
                bool notActive = reedemablePayments[i].state !=
                    PaymentState.ACTIVE;
                bool notReceiver = reedemablePayments[i].receiver != msg.sender;
                bool conditions = (notActive || notReceiver);

                if (conditions) {
                    revert __NotSenderOrNotActive();
                }
                // Change payment state in both issuer and reedemable maps.
                s_issuedPayments[reedemablePayments[i].issuer][
                    reedemablePayments[i].issuerId
                ].state = PaymentState.RECEIVED;
                s_redeemablePayments[msg.sender][i].state = PaymentState
                    .RECEIVED;
                emit PaymentReedemed(msg.sender, reedemablePayments[i].value);

                (bool success, ) = msg.sender.call{
                    value: reedemablePayments[i].value
                }("");
                if (!success) {
                    revert __TransferFailed();
                }
            } else {
                revert __InvalidCode();
            }
        }
    }

    // Withdraw  fees collected
    function withdrawPaySafeBalance() public payable onlyOwner {
        (bool success, ) = msg.sender.call{value: s_PaySafe.balance}("");
        if (!success) {
            revert __TransferFailed();
        }
    }

    // Mints a ERC721 token to remove 0.5% fees
    function BuyLockToken() public payable {
        if (msg.value != 1 ether) {
            revert __TransferFailed();
        }

        s_PaySafe.balance += msg.value;
        // mint ERC721 LOCK token to grant No Fee Transactions for ever. .
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
    }
}
