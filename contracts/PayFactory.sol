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

// ETH Mainnet PriceFeed Contract Addresses
//  ETH / USD 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419
//  USDC / USD 	0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6
//  USDT / USD 	0x3E7d1eAB13ad0104d2750B8863b489D65364e32D
//  DAI / USD 	0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9
//  BTC / USD 0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c
// Polygon Mainnet PriceFeed Contract Addresses
//  MATIC / USD 0xAB594600376Ec9fD91F8e885dADF0CE036862dE0
//  USDC / USD 	0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7
//  USDT / USD 	0x0A6513e40db6EB1b165753AD52E80663aeA50545
//  DAI / USD   0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D
//  WBTC / USD 	0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6
// Polygon Mumbai PriceFeed Contract Addresses
//  MATIC / USD 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
//  USDC / USD 	0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0
//  USDT / USD 	0x92C09849638959196E976289418e5973CC96d645
//  DAI / USD   0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046
//  BTC / USD 	0x007A22900a3B98143368Bd5906f8E17e9867581b

// Polygon Mumbai token addrress
// USDC 0xe11A86849d99F524cAC3E7A0Ec1241828e332C62
// USDT 0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832
// DAI 0xd393b1E02dA9831Ff419e22eA105aAe4c47E1253
// WBTC 0x0d787a4a1548f673ed375445535a6c7A1EE56180

// Forawarder 0xd6b13d7f334d4a43d5b4223e6ef12d9b3280d8ee
// 0x0000000000000000000000000000000000000000
contract PayLock is ERC2771Context, Ownable {
    // Library
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

    // Contructor - Passing in & setting immutables
    // Chainlink's priceFeed Addresses
    // Supported ERC20 token Addresses
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
     * @dev Issue a payment.
     * `_receiver` Receiver address`.
     * `_code` A random 4 digit number`.
     *
     * Requirements:
     * - `msg.value` Payment needs to have value i,e not empty.
     *
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
                        _tokenAmount.getConversionRate(i_priceFeedUSDC) -
                        MAXIMUM_FEE_USD.getMaxRate(i_priceFeedUSDC);
                    s_PaySafeTokenBalances[i_USDCAddress] += MAXIMUM_FEE_USD
                        .getMaxRate(i_priceFeedUSDC);
                }
                if (
                    _tokenAmount.getConversionRate(i_priceFeedUSDC) <
                    MAXIMUM_FEE_USD
                ) {
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
                        _tokenAmount.getConversionRate(i_priceFeedUSDT) -
                        MAXIMUM_FEE_USD.getMaxRate(i_priceFeedUSDT);
                    s_PaySafeTokenBalances[i_USDTAddress] += MAXIMUM_FEE_USD
                        .getMaxRate(i_priceFeedUSDT);
                }
                if (
                    _tokenAmount.getConversionRate(i_priceFeedUSDT) <
                    MAXIMUM_FEE_USD
                ) {
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
                        _tokenAmount.getConversionRate(i_priceFeedDAI) -
                        MAXIMUM_FEE_USD.getMaxRate(i_priceFeedDAI);
                    s_PaySafeTokenBalances[i_DAIAddress] += MAXIMUM_FEE_USD
                        .getMaxRate(i_priceFeedDAI);
                }
                if (
                    _tokenAmount.getConversionRate(i_priceFeedDAI) <
                    MAXIMUM_FEE_USD
                ) {
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
                        _tokenAmount.getConversionRate(i_priceFeedBTC) -
                        MAXIMUM_FEE_USD.getMaxRate(i_priceFeedBTC);
                    s_PaySafeTokenBalances[i_WBTCAddress] += MAXIMUM_FEE_USD
                        .getMaxRate(i_priceFeedBTC);
                }
                if (
                    _tokenAmount.getConversionRate(i_priceFeedBTC) <
                    MAXIMUM_FEE_USD
                ) {
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
     * `_index` Is a parameter supplied by the frontend to the issuer of transaction`.
     *
     * Requirements:
     * - `Active` Payment needs to be active i.e Not withdrawn or Received.
     * - `notReceiver` Only issuer address wil be able to withdraw.
     *
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
     * `_code` A random 4 digit number `.
     *
     * Requirements:
     * - `Active` Payment needs to be active i.e Not withdrawn or Received.
     * - `notReceiver` sender must be recepient address in payment.
     *
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

    // Withdraw native protocol fees
    function withdrawPaySafeBalance() public payable onlyOwner {
        (bool success, ) = msg.sender.call{value: s_PaySafe}("");
        if (!success) {
            revert __TransferFailed();
        }
        s_PaySafe = 0;
    }

    // Withdraw erc20 protocol fees
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
