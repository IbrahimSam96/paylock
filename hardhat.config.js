require("@nomiclabs/hardhat-waffle");


require('dotenv').config();

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 1337
        },
        Mumbai: {
            url: 'https://polygon-mumbai.g.alchemy.com/v2/tSpg5zjh4lrrDfRaY1FA5p1Y-h_5vRuu',
            accounts: [process.env.NEXT_PUBLIC_privateKey]
        },
    },
    solidity: {
        version: "0.8.4",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    }
};
