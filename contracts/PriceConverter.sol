// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        // ABI
        // Address passed on from constructor in Paylock.sol

        (, int256 price, , , ) = priceFeed.latestRoundData();
        //    typecaseting & ETH/USD rate in 18 digit
        return uint256(price * 1e10);
    }

    function getConversionRate(
        uint256 tokenAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 tokenPrice = getPrice(priceFeed);
        uint256 tokenAmountInUsd = (tokenAmount * tokenPrice) / 1e18;
        return tokenAmountInUsd;
    }

    function getMaxRate(
        uint256 MAXIMUM_FEE_USD,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 tokenPrice = getPrice(priceFeed);
        uint256 MaxFee = (MAXIMUM_FEE_USD / tokenPrice);
        return MaxFee;
    }
}
