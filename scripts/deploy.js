const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const PayFactory = await hre.ethers.getContractFactory("PayLock");
  const payFactory = await PayFactory.deploy();

  await payFactory.deployed();
  console.log("payFactory deployed to:", payFactory.address);

  fs.writeFileSync('./config.js', `
  export const marketplaceAddress = "${payFactory.address}"
  `)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });