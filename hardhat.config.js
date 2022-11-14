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
            url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`,
            accounts: [process.env.NEXT_PUBLIC_privateKey],
            chainId: 80001
        },
        goerli: {
            url: `https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID_GOERLI}`,
            accounts: [process.env.NEXT_PUBLIC_privateKey],
            chainId: 5
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
