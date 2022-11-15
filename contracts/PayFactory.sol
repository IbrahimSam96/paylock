// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
// ERC2771Context and Forwarder for relaying issued transactions ( Withdraw OR Redeem)
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";
// IERC20 - ERC20 Interface for transfering ERC20 tokens
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Chainlink Aggregator for PriceFeedS
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
// Imports token price conversioner library
import "./PriceConverter.sol";

// Reverting Errors
error __AmountEmpty();
error __NotSenderOrNotActive();
error __NoReedemablePayments();
error __InvalidCode();
error __TransferFailed();
error __TransferWithdrawn();

contract PayLock is ERC2771Context, Ownable {
    // Libraries
    // ./PriceConverter gets token price conversions for detrmining max transaction fee
    using PriceConverter for uint256;
    // Immutables
    address private immutable i_forwarder;
    // Chainlink PriceFeeds - (token / USD)
    AggregatorV3Interface private immutable i_priceFeedNative;
    AggregatorV3Interface private immutable i_priceFeedUSDC;
    AggregatorV3Interface private immutable i_priceFeedUSDT;
    AggregatorV3Interface private immutable i_priceFeedDAI;
    AggregatorV3Interface private immutable i_priceFeedBTC;
    // Token Addresses
    address private immutable i_USDCAddress;
    address private immutable i_USDTAddress;
    address private immutable i_DAIAddress;
    address private immutable i_WBTCAddress;
    // constants
    uint256 public constant MAXIMUM_FEE_USD = 50 * 1e18;

    /**
     * @dev Constructor (Initializor).
     * Chainlink's priceFeed Addresses
     * Supported ERC20 token Addresses
     * `_MinimalForwarder` Trusted Fowarder address `.
     * `_AggregatorNative` Native token Chainlink aggregator address `.
     * `_AggregatorUSDC` USDC Chainlink aggregator address `.
     * `_AggregatorUSDT` USDT token Chainlink aggregator address `.
     * `_AggregatorDAI` DAI token Chainlink aggregator address `.
     * `_AggregatordBTC` WBTC token Chainlink aggregator address `.
     *
     * `_USDCAddress`  ERC20 token Address`.
     * `_USDTAddress`  ERC20 token Address`.
     * `_DAIAddress`  ERC20 token Address`.
     * `_WBTCAddress`  ERC20 token Address`.
     */

    constructor(
        MinimalForwarder forwarder,
        address AggregatorNative,
        address AggregatorUSDC,
        address AggregatorUSDT,
        address AggregatorDAI,
        address AggregatordBTC,
        address USDCAddress,
        address USDTAddress,
        address DAIAddress,
        address WBTCAddress
    ) ERC2771Context(address(forwarder)) {
        i_forwarder = address(forwarder);
        i_priceFeedNative = AggregatorV3Interface(AggregatorNative);
        i_priceFeedUSDC = AggregatorV3Interface(AggregatorUSDC);
        i_priceFeedUSDT = AggregatorV3Interface(AggregatorUSDT);
        i_priceFeedDAI = AggregatorV3Interface(AggregatorDAI);
        i_priceFeedBTC = AggregatorV3Interface(AggregatordBTC);

        i_USDCAddress = USDCAddress;
        i_USDTAddress = USDTAddress;
        i_DAIAddress = DAIAddress;
        i_WBTCAddress = WBTCAddress;
    }

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
        address tokenAddress;
        PaymentState state;
    }
    // State
    // Paylock fee collection
    uint256 public s_PaySafe;
    mapping(address => uint256) public s_PaySafeTokenBalances;
    // A user has 2 arrays of issued & redeemable payments
    mapping(address => payment[]) public s_issuedPayments;
    mapping(address => payment[]) public s_redeemablePayments;
    // Events
    event PaymentIssued(address indexed sender, payment indexed receipt);
    event PaymentReedemed(address indexed receiver, payment indexed receipt);
    event PaymentWithdrawn(address indexed sender, payment indexed receipt);

    /**
     * @dev CreatePayement Issues a payment.
     * `_receiver` Receiver address`.
     * `_code` A random 4 digit number`.
     * _tokenAddress if native token value should be 0x0000.. if approved ERC20 address
     * _tokenAmount Amount to transfer if native token 0.. or approved ERC20 address
     * Requirements:
     * if sending a native token `msg.value` needs to have value i,e not empty.
     * if sending a ERC20 token `_tokenAmount` needs to have value i,e not empty.
     * Emits a {PaymentIssued} event.
     */
    function CreatePayement(
        address payable _receiver,
        uint256 _code,
        address _tokenAddress,
        uint256 _tokenAmount
    ) public payable {
        if (_tokenAddress == address(0)) {
            // If payment is empty revert transaction
            bool AmountEmpty = msg.value == 0;
            if (AmountEmpty) {
                revert __AmountEmpty();
            }
            // prepare new memory payment struct
            payment memory newPayment;
            //If USD fee value equals more than 50USD, cap fee at 50 USD
            if (
                (msg.value / 200).getConversionRate(i_priceFeedNative) >
                MAXIMUM_FEE_USD
            ) {
                newPayment.value =
                    msg.value -
                    MAXIMUM_FEE_USD.getMaxRate(i_priceFeedNative);
                s_PaySafe += MAXIMUM_FEE_USD.getMaxRate(i_priceFeedNative);
            } else {
                newPayment.value = msg.value - msg.value / 200;
                s_PaySafe += msg.value / 200;
            }

            // Issue payment
            newPayment.issuer = payable(msg.sender);
            newPayment.receiver = payable(_receiver);
            newPayment.issuerId = s_issuedPayments[msg.sender].length;
            newPayment.receiverId = s_redeemablePayments[_receiver].length;
            newPayment.code = _code;
            newPayment.tokenAddress = _tokenAddress;
            newPayment.state = PaymentState.ACTIVE;
            // ADD payment to both arrays of issuer and reedemable transactions
            s_issuedPayments[msg.sender].push(newPayment);
            s_redeemablePayments[_receiver].push(newPayment);
            // Emit PaymentIssued event
            emit PaymentIssued(msg.sender, newPayment);
        } else {
            // If _tokenAmount is empty revert transaction
            bool AmountEmpty = _tokenAmount == 0;
            if (AmountEmpty) {
                revert __AmountEmpty();
            }
            // prepare new memory payment struct
            payment memory newPayment;
            // Determines which price feed and ERC20 contract to interact with
            if (_tokenAddress == i_USDCAddress) {
                // Transfer tokens
                bool success = IERC20(i_USDCAddress).transferFrom(
                    msg.sender,
                    address(this),
                    _tokenAmount
                );
                if (!success) {
                    revert __TransferFailed();
                }
                // IF USD value (0.5%) a of transaction  equals more than 50USD, cap fee at 50 USD
                if (
                    (_tokenAmount / 200).getConversionRate(i_priceFeedUSDC) >=
                    MAXIMUM_FEE_USD
                ) {
                    newPayment.value =
                        _tokenAmount -
                        MAXIMUM_FEE_USD.getMaxRate(i_priceFeedUSDC);
                    s_PaySafeTokenBalances[i_USDCAddress] += MAXIMUM_FEE_USD
                        .getMaxRate(i_priceFeedUSDC);
                } else {
                    newPayment.value = _tokenAmount - _tokenAmount / 200;
                    s_PaySafeTokenBalances[i_USDCAddress] += _tokenAmount / 200;
                }
            } else if (_tokenAddress == i_USDTAddress) {
                // Transfer tokens
                bool success = IERC20(i_USDTAddress).transferFrom(
                    msg.sender,
                    address(this),
                    _tokenAmount
                );
                if (!success) {
                    revert __TransferFailed();
                }
                // If the fee USD value (0.5%) a of transaction amount equals more than 50USD, cap fee at 50 USD else use (0.5%) of _tokenAmount
                if (
                    (_tokenAmount / 200).getConversionRate(i_priceFeedUSDT) >=
                    MAXIMUM_FEE_USD
                ) {
                    newPayment.value =
                        _tokenAmount -
                        MAXIMUM_FEE_USD.getMaxRate(i_priceFeedUSDT);
                    s_PaySafeTokenBalances[i_USDTAddress] += MAXIMUM_FEE_USD
                        .getMaxRate(i_priceFeedUSDT);
                } else {
                    newPayment.value = _tokenAmount - _tokenAmount / 200;
                    s_PaySafeTokenBalances[i_USDTAddress] += _tokenAmount / 200;
                }
            } else if (_tokenAddress == i_DAIAddress) {
                // Transfer tokens
                bool success = IERC20(i_DAIAddress).transferFrom(
                    msg.sender,
                    address(this),
                    _tokenAmount
                );
                if (!success) {
                    revert __TransferFailed();
                }
                // If the fee USD value (0.5%) a of transaction amount equals more than 50USD, cap fee at 50 USD else use (0.5%) of _tokenAmount
                if (
                    (_tokenAmount / 200).getConversionRate(i_priceFeedDAI) >=
                    MAXIMUM_FEE_USD
                ) {
                    newPayment.value =
                        _tokenAmount -
                        MAXIMUM_FEE_USD.getMaxRate(i_priceFeedDAI);
                    s_PaySafeTokenBalances[i_DAIAddress] += MAXIMUM_FEE_USD
                        .getMaxRate(i_priceFeedDAI);
                } else {
                    newPayment.value = _tokenAmount - _tokenAmount / 200;
                    s_PaySafeTokenBalances[i_DAIAddress] += _tokenAmount / 200;
                }
            } else if (_tokenAddress == i_WBTCAddress) {
                // Transfer tokens
                bool success = IERC20(i_WBTCAddress).transferFrom(
                    msg.sender,
                    address(this),
                    _tokenAmount
                );
                if (!success) {
                    revert __TransferFailed();
                }
                // If the fee USD value (0.5%) a of transaction amount equals more than 50USD, cap fee at 50 USD else use (0.5%) of _tokenAmount
                if (
                    (_tokenAmount / 200).getConversionRate(i_priceFeedBTC) >=
                    MAXIMUM_FEE_USD
                ) {
                    newPayment.value =
                        _tokenAmount -
                        MAXIMUM_FEE_USD.getMaxRate(i_priceFeedBTC);
                    s_PaySafeTokenBalances[i_WBTCAddress] += MAXIMUM_FEE_USD
                        .getMaxRate(i_priceFeedBTC);
                } else {
                    newPayment.value = _tokenAmount - _tokenAmount / 200;
                    s_PaySafeTokenBalances[i_WBTCAddress] += _tokenAmount / 200;
                }
            }
            // Issue payment
            newPayment.issuer = payable(msg.sender);
            newPayment.receiver = payable(_receiver);
            newPayment.issuerId = s_issuedPayments[msg.sender].length;
            newPayment.receiverId = s_redeemablePayments[_receiver].length;
            newPayment.code = _code;
            newPayment.tokenAddress = _tokenAddress;
            newPayment.state = PaymentState.ACTIVE;
            // ADD payment to both arrays of issuer and reedemable transactions
            s_issuedPayments[msg.sender].push(newPayment);
            s_redeemablePayments[_receiver].push(newPayment);
            // Emit PaymentIssued event
            emit PaymentIssued(msg.sender, newPayment);
        }
    }

    /**
     * @dev Withdraw issued payment.
     *  _code 4 digit number entered by the user
     * _receiverId Sent by the front-end automatically when correct code is entered by the user `.
     *
     * Requirements:
     * - `Active` Payment state needs to be active i.e Not withdrawn or Received.
     * - `notReceiver` Only issuer address (_msgSender) will be able to withdraw.
     * - _code must match same number used to issue payment
     * Emits a {PaymentWithdrawn} event.
     */

    function withdrawIssuerPayment(uint256 _code, uint256 _receiverId)
        public
        payable
    {
        // Lookup issued payment in issuer's issued transactions
        payment[] memory issuedPayments = s_issuedPayments[_msgSender()];
        // No reedemable payments
        if (issuedPayments.length == 0) {
            revert __NoReedemablePayments();
        }
        // Loop for reedemable payments with the code entered for the caller.
        for (uint256 i = 0; i < issuedPayments.length; i++) {
            // If code is valid and Requirements are met transfer payment.
            if (
                issuedPayments[i].code == _code &&
                issuedPayments[i].receiverId == _receiverId
            ) {
                // Payment must be active and sender must be the payment issuer.
                bool notActive = issuedPayments[i].state != PaymentState.ACTIVE;
                bool notSender = issuedPayments[i].issuer != _msgSender();
                bool conditions = (notActive || notSender);
                if (conditions) {
                    revert __NotSenderOrNotActive();
                }
                //Change payment state to Withdrawn.
                s_redeemablePayments[issuedPayments[i].receiver][
                    issuedPayments[i].receiverId
                ].state = PaymentState.WITHDRAWN;

                s_issuedPayments[_msgSender()][i].state = PaymentState
                    .WITHDRAWN;
                // Emit PaymentWithdrawn event
                emit PaymentWithdrawn(_msgSender(), issuedPayments[i]);
                // Value transfer either native or erc20 transfer.
                if (issuedPayments[i].tokenAddress == address(0)) {
                    (bool success, ) = _msgSender().call{
                        value: issuedPayments[i].value
                    }("");
                    if (!success) {
                        revert __TransferFailed();
                    }
                } else if (issuedPayments[i].tokenAddress == i_USDCAddress) {
                    // Transfer tokens
                    bool success = IERC20(i_USDCAddress).transfer(
                        _msgSender(),
                        issuedPayments[i].value
                    );
                    if (!success) {
                        revert __TransferFailed();
                    }
                } else if (issuedPayments[i].tokenAddress == i_USDTAddress) {
                    // Transfer tokens
                    bool success = IERC20(i_USDTAddress).transfer(
                        _msgSender(),
                        issuedPayments[i].value
                    );
                    if (!success) {
                        revert __TransferFailed();
                    }
                } else if (issuedPayments[i].tokenAddress == i_DAIAddress) {
                    // Transfer tokens
                    bool success = IERC20(i_DAIAddress).transfer(
                        _msgSender(),
                        issuedPayments[i].value
                    );
                    if (!success) {
                        revert __TransferFailed();
                    }
                } else if (issuedPayments[i].tokenAddress == i_WBTCAddress) {
                    // Transfer tokens
                    bool success = IERC20(i_WBTCAddress).transfer(
                        _msgSender(),
                        issuedPayments[i].value
                    );
                    if (!success) {
                        revert __TransferFailed();
                    }
                }
            } else {}
        }
    }

    /**
     * @dev Redeem _code to receive Payment.
     * `_code` 4 digit number entered by the user `.
     * _receiverId Sent by the front-end automatically when correct code is entered by the user `.
     *
     * Requirements:
     * - `Active` Payment needs to be active i.e Not withdrawn or Received.
     * - `notReceiver` sender must be recepient address in payment.
     * - _code must match same number used to issue payment
     * Emits a {PaymentReedemed} event.
     */
    function RedeemPayment(uint256 _code, uint256 _receiverId) public payable {
        payment[] memory reedemablePayments = s_redeemablePayments[
            _msgSender()
        ];
        // No reedemable payments
        if (reedemablePayments.length == 0) {
            revert __NoReedemablePayments();
        }
        // Loop for reedemable payments with the code entered for the caller.
        for (uint256 i = 0; i < reedemablePayments.length; i++) {
            // If code is valid and Requirements are met transfer payment.
            if (
                reedemablePayments[i].code == _code &&
                reedemablePayments[i].receiverId == _receiverId
            ) {
                bool notActive = reedemablePayments[i].state !=
                    PaymentState.ACTIVE;
                bool notReceiver = reedemablePayments[i].receiver !=
                    _msgSender();

                bool conditions = (notActive || notReceiver);

                if (conditions) {
                    revert __NotSenderOrNotActive();
                }
                // Change payment state in both issuer and reedemable maps.
                s_issuedPayments[reedemablePayments[i].issuer][
                    reedemablePayments[i].issuerId
                ].state = PaymentState.RECEIVED;
                s_redeemablePayments[_msgSender()][i].state = PaymentState
                    .RECEIVED;
                emit PaymentReedemed(_msgSender(), reedemablePayments[i]);

                // Value transfer either native or erc20 transfer.
                if (reedemablePayments[i].tokenAddress == address(0)) {
                    (bool success, ) = _msgSender().call{
                        value: reedemablePayments[i].value
                    }("");
                    if (!success) {
                        revert __TransferFailed();
                    }
                } else if (
                    reedemablePayments[i].tokenAddress == i_USDCAddress
                ) {
                    // Transfer tokens
                    bool success = IERC20(i_USDCAddress).transfer(
                        _msgSender(),
                        reedemablePayments[i].value
                    );
                    if (!success) {
                        revert __TransferFailed();
                    }
                } else if (
                    reedemablePayments[i].tokenAddress == i_USDTAddress
                ) {
                    // Transfer tokens
                    bool success = IERC20(i_USDTAddress).transfer(
                        _msgSender(),
                        reedemablePayments[i].value
                    );
                    if (!success) {
                        revert __TransferFailed();
                    }
                } else if (reedemablePayments[i].tokenAddress == i_DAIAddress) {
                    // Transfer tokens
                    bool success = IERC20(i_DAIAddress).transfer(
                        _msgSender(),
                        reedemablePayments[i].value
                    );
                    if (!success) {
                        revert __TransferFailed();
                    }
                } else if (
                    reedemablePayments[i].tokenAddress == i_WBTCAddress
                ) {
                    // Transfer tokens
                    bool success = IERC20(i_WBTCAddress).transfer(
                        _msgSender(),
                        reedemablePayments[i].value
                    );
                    if (!success) {
                        revert __TransferFailed();
                    }
                }
            } else {
                // revert __InvalidCode();
            }
        }
    }

    // onlyOwner function - Withdraws native protocol fees
    function withdrawPaySafeBalance() public payable onlyOwner {
        (bool success, ) = msg.sender.call{value: s_PaySafe}("");
        if (!success) {
            revert __TransferFailed();
        }
        s_PaySafe = 0;
    }

    // onlyOwner function -  Withdraws ERC20 protocol fees
    function withdrawPaySafeBalance(address _tokenAddress)
        public
        payable
        onlyOwner
    {
        if (_tokenAddress == i_USDCAddress) {
            bool success = IERC20(i_USDCAddress).transfer(
                msg.sender,
                s_PaySafeTokenBalances[i_USDCAddress]
            );
            if (!success) {
                revert __TransferFailed();
            }
            s_PaySafeTokenBalances[i_USDCAddress] = 0;
        } else if (_tokenAddress == i_USDTAddress) {
            // Transfer tokens
            bool success = IERC20(i_USDTAddress).transfer(
                msg.sender,
                s_PaySafeTokenBalances[i_USDTAddress]
            );
            if (!success) {
                revert __TransferFailed();
            }
            s_PaySafeTokenBalances[i_USDTAddress] = 0;
        } else if (_tokenAddress == i_DAIAddress) {
            // Transfer tokens
            bool success = IERC20(i_DAIAddress).transfer(
                msg.sender,
                s_PaySafeTokenBalances[i_DAIAddress]
            );
            if (!success) {
                revert __TransferFailed();
            }
            s_PaySafeTokenBalances[i_DAIAddress] = 0;
        } else if (_tokenAddress == i_WBTCAddress) {
            // Transfer tokens
            bool success = IERC20(i_WBTCAddress).transfer(
                msg.sender,
                s_PaySafeTokenBalances[i_WBTCAddress]
            );
            if (!success) {
                revert __TransferFailed();
            }
            s_PaySafeTokenBalances[i_WBTCAddress] = 0;
        }
    }

    // gets all issued payments
    function getIssuedPayments(address user)
        public
        view
        returns (payment[] memory)
    {
        return s_issuedPayments[user];
    }

    // gets all redeemable payments
    function getRedeemablePayments(address user)
        public
        view
        returns (payment[] memory)
    {
        return s_redeemablePayments[user];
    }

    // Overiders for ERC2711Context
    function _msgSender()
        internal
        view
        override(Context, ERC2771Context)
        returns (address sender)
    {
        sender = ERC2771Context._msgSender();
    }

    function _msgData()
        internal
        view
        override(Context, ERC2771Context)
        returns (bytes calldata)
    {
        return ERC2771Context._msgData();
    }
}
