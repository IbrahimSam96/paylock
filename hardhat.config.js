require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");


require('dotenv').config();

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 1337
        },
        polygonMumbai: {
            url: 'https://polygon-mumbai.g.alchemy.com/v2/PBc5D3vjrWJvIJSZdVxU6AbM8rnnT57v',
            accounts: [process.env.NEXT_PUBLIC_privateKey],
            chainId: 80001
        },
    },
    etherscan: {
        apiKey: process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY,
    },
    solidity: {
        version: "0.8.9",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    }
};
