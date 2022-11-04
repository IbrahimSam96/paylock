const {
    DefenderRelayProvider,
    DefenderRelaySigner,
} = require('defender-relay-client/lib/ethers')
const { ethers } = require('hardhat')
const { writeFileSync } = require('fs')

async function main() {
    require('dotenv').config()

    const chainId = hre.network.config.chainId;

    const credentials = { apiKey: process.env.NEXT_PUBLIC_APIKey, apiSecret: process.env.NEXT_PUBLIC_APISecret };
    const provider = new DefenderRelayProvider(credentials);
    const signer = new DefenderRelaySigner(credentials, provider, { speed: 'fast' });

    const Forwarder = await ethers.getContractFactory('MinimalForwarder')
    const forwarder = await Forwarder.connect(signer)
        .deploy()
        .then((f) => f.deployed()
        )

    const PaylockContract = await hre.ethers.getContractFactory("PayLock");

    let MinimalForwarder = ''
    let AggregatorNative = ''
    let AggregatorUSDC = ''

    let AggregatorUSDT = ''
    let AggregatorDAI = ''
    let AggregatordBTC = ''
    let USDCAddress = ''
    let USDTAddress = ''
    let DAIAddress = ''
    let WBTCAddress = ''

    // Polygon(Matic) Mumbai testnet <3
    if (chainId == 80001) {
        MinimalForwarder = '0x25b56ddb6ffbf355ba3f5299aaac38150f469782'
        AggregatorNative = '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada'
        AggregatorUSDC = '0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0'
        AggregatorUSDT = '0x92C09849638959196E976289418e5973CC96d645'
        AggregatorDAI = '0x0FCAa9c899EC5A91eBc3D5Dd869De833b06fB046'
        AggregatordBTC = '0x007A22900a3B98143368Bd5906f8E17e9867581b'
        USDCAddress = '0xe11A86849d99F524cAC3E7A0Ec1241828e332C62'
        USDTAddress = '0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832'
        DAIAddress = '0xd393b1E02dA9831Ff419e22eA105aAe4c47E1253'
        WBTCAddress = '0x0d787a4a1548f673ed375445535a6c7A1EE56180'
    }
    // Eth Mainnet <3
    if (chainId == 1) {
        MinimalForwarder = ''
        AggregatorNative = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419'
        AggregatorUSDC = '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6'
        AggregatorUSDT = '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D'
        AggregatorDAI = '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9'
        AggregatordBTC = '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c'
        USDCAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
        USDTAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
        DAIAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
        WBTCAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
    }
    // Polygon(Matic) Mainnet <3
    if (chainId == 137) {
        MinimalForwarder = ''
        AggregatorNative = '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0'
        AggregatorUSDC = '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7'
        AggregatorUSDT = '0x0A6513e40db6EB1b165753AD52E80663aeA50545'
        AggregatorDAI = '0x4746DeC9e833A82EC7C2C1356372CcF2cfcD2F3D'
        AggregatordBTC = '0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6'
        USDCAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
        USDTAddress = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
        DAIAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
        WBTCAddress = '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6'

    }

    const Paylock = await PaylockContract.connect(signer).deploy(
        MinimalForwarder,
        AggregatorNative, AggregatorUSDC, AggregatorUSDT,
        AggregatorDAI, AggregatordBTC, USDCAddress, USDTAddress, DAIAddress, WBTCAddress
    );

    await Paylock.deployed();

    // Polygon(Matic) Mumbai testnet <3
    if (chainId == 80001) {
        writeFileSync(
            'mumbai.json',
            JSON.stringify(
                {
                    MinimalForwarder: forwarder.address,
                    PaylockAddress: Paylock.address,
                },
                null,
                2
            )
        )
        console.log(
            ` Deployed on Mumbai: MinimalForwarder: ${forwarder.address}\n Paylock: ${Paylock.address}`
        )
    }
    // Eth Mainnet <3
    if (chainId == 1) {
        writeFileSync(
            'eth.json',
            JSON.stringify(
                {
                    MinimalForwarder: forwarder.address,
                    PaylockAddress: Paylock.address,
                },
                null,
                2
            )
        )
        console.log(
            ` Deployed on Mainnet: MinimalForwarder: ${forwarder.address}\n Paylock: ${Paylock.address}`
        )
    }
    // Polygon(Matic) Mainnet <3
    if (chainId == 137) {
        writeFileSync(
            'polygon.json',
            JSON.stringify(
                {
                    MinimalForwarder: forwarder.address,
                    PaylockAddress: Paylock.address,
                },
                null,
                2
            )
        )
        console.log(
            ` Deployed on Polygon: MinimalForwarder: ${forwarder.address}\n Paylock: ${Paylock.address}`
        )
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error)
            process.exit(1)
        })
}