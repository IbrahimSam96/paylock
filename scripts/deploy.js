const hre = require("hardhat");
const fs = require('fs');

async function main() {
    const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.deployed();
    console.log("simpleStorage deployed to:", simpleStorage.address);

    fs.writeFileSync('./config.js', `
  export const marketplaceAddress = "${simpleStorage.address}"
  `)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });