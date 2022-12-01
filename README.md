
<img src="https://github.com/IbrahimSam96/paylock/blob/main/public/daaps.svg" width="200">


# Paylock

Send and receive withdrawable ERC20 tokens via 4-digit code.  

## Contract Addresses
Mumbai:
[MinimalForwarder](https://polygonscan.com/address/0x219aaE373B3033Fb67686360258F729300eC5696), 
[PaylockAddress](https://polygonscan.com/address/0xB7eE72448D43844560976cEB6701FB9ebeB6626e)

Goerli: 
[MinimalForwarder](https://goerli.etherscan.io/address/0x5F46AeB8f5611E110175838Ad164b872c6Dae958),
[PaylockAddress](https://goerli.etherscan.io/address/0x86Fa62B55d88a2b0ACADE19A660C778931974f87)

## Features
- Withdraw or Redeem payments without paying gas.
- 0.5% fee (per transaction) capped at $50USD (determined on chain using Chainlink Price Feed Oracles). 
- Send payment code via SMS
- Light/dark mode toggle


## Tech Stack

**Client:** Next.js, React, TailwindCSS

**Solidity:** Hardhat, ethers.js, OpenZeppelin Defender, Chainlink Price Feeds

<img src="https://github.com/IbrahimSam96/paylock/blob/main/public/Dev-Preview.png" width="700">

<img src="https://github.com/IbrahimSam96/paylock/blob/main/public/Send Payments.PNG" width="700">

<img src="https://github.com/IbrahimSam96/paylock/blob/main/public/Issued payments.PNG" width="700">

<img src="https://github.com/IbrahimSam96/paylock/blob/main/public/Redeemable Payments.PNG" width="700">

<img src="https://github.com/IbrahimSam96/paylock/blob/main/public/Text-Message.jpg_small" width="700">


