const hre = require("hardhat");
const fs = require('fs');
const { DefenderRelayProvider, DefenderRelaySigner } = require('defender-relay-client/lib/ethers');
require('dotenv').config();

async function main() {


  const credentials = { apiKey: process.env.NEXT_PUBLIC_APIKey, apiSecret: process.env.NEXT_PUBLIC_APISecret };
  const provider = new DefenderRelayProvider(credentials);
  const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });

  const PayFactory = await hre.ethers.getContractFactory("PayLock");
  const payFactory = await PayFactory.connect(signer).deploy('0x25b56ddb6ffbf355ba3f5299aaac38150f469782');

  await payFactory.deployed();
  console.log("payFactory deployed to:", payFactory.address);

  fs.writeFileSync('./config.js', `
  export const contractAddress = "${payFactory.address}"
  `)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });