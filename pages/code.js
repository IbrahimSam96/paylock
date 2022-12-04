// React & Next.js 
import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Head from 'next/head'
// web3 imports
import { useNetwork, useAccount, useSigner } from 'wagmi';
import { ethers } from 'ethers';
// helper libraries
import debounce from 'lodash.debounce';
import axios from 'axios'
// Ui Libraries 
import { NumericFormat } from 'react-number-format';
import Avatar, { genConfig } from 'react-nice-avatar'
import { toast } from 'react-toastify';
// Components 
import Navigation from './components/Navigation';
import CodeInput from "./components/Input"

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Contract and Trusted Forwarder Addresses 
import PaylockAddressPolygon from '../polygon.json';
import PaylockAddressMumbai from '../mumbai.json';
import PaylockAddressEth from '../eth.json'
import PaylockAddressGoerli from "../goerli.json"

import MinimalForwarderPolygon from '../polygon.json';
import MinimalForwarderMumbai from '../mumbai.json';
import MinimalForwarderEth from '../eth.json'
import MinimalForwarderGoerli from "../goerli.json"

import PayFactory from '../artifacts/contracts/PayFactory.sol/PayLock.json'

const Code = () => {
    // useRefs
    const toastId = useRef(null);

    const [mumbaiRedeemablePayments, setMumbaiRedeemablePayments] = React.useState([]);
    const [goerliRedeemablePayments, setGoerliRedeemablePayments] = React.useState([]);

    const [code, setCode] = useState('');
    const [transactionLoading, setTransactionLoading] = useState(false);
    const [contractAddress, setContractAddress] = useState('');
    const [forwarder, setForwarder] = useState('');

    const [isSSR, setIsSSR] = useState(true);
    const { address, isConnecting, isDisconnected, isConnected } = useAccount();
    const connection = useNetwork();

    const { data: signer } = useSigner();

    // Avatar config at config.current;
    const config = useRef(genConfig());
    // global window check 
    useEffect(() => {
        setIsSSR(false);
    }, []);

    // Gets all redeemable payments on all chains
    useEffect(() => {

        if (!isDisconnected) {
            // gets PolygonMumbai Payments  
            const getMumbaiRedeemablePayments = async () => {
                const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`);
                const contract = new ethers.Contract(PaylockAddressMumbai.PaylockAddress, PayFactory.abi, provider);
                const data = await contract.getRedeemablePayments(address);
                setMumbaiRedeemablePayments(data);
            }
            getMumbaiRedeemablePayments();
            // Mumbai Network
            const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`);
            const contract = new ethers.Contract(PaylockAddressMumbai.PaylockAddress, PayFactory.abi, provider);
            // Event Listener
            contract.on('PaymentReedemed', () => {
                console.log("Event Triggered")
                getMumbaiRedeemablePayments();
                contract.removeListener('PaymentReedemed');
            })
            // <<<<<<<<<<>>>>>>>>>>>>>> REST OF CHAINS <<<<<<<<<<>>>>>>>>>>>>>>
            // gets Goerli Payments  
            const getGoerliRedeemablePayments = async () => {
                const provider = new ethers.providers.JsonRpcProvider(`https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID_GOERLI}`);
                const contract = new ethers.Contract(PaylockAddressGoerli.PaylockAddress, PayFactory.abi, provider);
                const data = await contract.getRedeemablePayments(address);
                console.log(data)
                setGoerliRedeemablePayments(data);
            }
            getGoerliRedeemablePayments();
            // Goerli Network
            const providerGoerli = new ethers.providers.JsonRpcProvider(`https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID_GOERLI}`);
            const contractGoerli = new ethers.Contract(PaylockAddressGoerli.PaylockAddress, PayFactory.abi, providerGoerli);
            // Event Listener
            contractGoerli.on('PaymentReedemed', () => {
                console.log("Event Triggered")
                getGoerliRedeemablePayments();
                contract.removeListener('PaymentReedemed');
            })
        }

    }, [])

    //  Switches paylock contract and forwarder adddress to connected chain
    useEffect(() => {
        if (connection.chain?.name == "Ethereum") {
            setContractAddress(PaylockAddressEth.PaylockAddressEth)
            setForwarder(MinimalForwarderEth.MinimalForwarderEth)
        }
        if (connection.chain?.name == 'Polygon') {
            setContractAddress(PaylockAddressPolygon.PaylockAddressPolygon)
            setForwarder(MinimalForwarderPolygon.MinimalForwarderPolygon)
        }
        if (connection.chain?.name == 'Polygon Mumbai') {
            setContractAddress(PaylockAddressMumbai.PaylockAddress)
            setForwarder(MinimalForwarderMumbai.MinimalForwarder)
        }
        if (connection.chain?.name == 'Goerli') {
            setContractAddress(PaylockAddressGoerli.PaylockAddress)
            setForwarder(MinimalForwarderGoerli.MinimalForwarder)
        }
    }, [connection.chain]);

    const getTokenImage = (_network, _tokenAddress) => {
        if (_network == "Mumbai") {
            if (_tokenAddress == "0xd393b1E02dA9831Ff419e22eA105aAe4c47E1253") {
                return "DAI"
            }
            else if (_tokenAddress == "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832") {
                return "USDT"
            }
            else if (_tokenAddress == "0xe11A86849d99F524cAC3E7A0Ec1241828e332C62") {
                return "USDC"
            }
            else if (_tokenAddress == "0x0d787a4a1548f673ed375445535a6c7A1EE56180") {
                return "WBTC"
            }
        }
        else if (_network == "Goerli") {
            if (_tokenAddress == "0x73967c6a0904aA032C103b4104747E88c566B1A2") {
                return "DAI"
            }
            else if (_tokenAddress == "0x509Ee0d083DdF8AC028f2a56731412edD63223B9") {
                return "USDT"
            }
            else if (_tokenAddress == "0x2f3A40A3db8a7e3D09B0adfEfbCe4f6F81927557") {
                return "USDC"
            }
            else if (_tokenAddress == "0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05") {
                return "WBTC"
            }
        }
    }
    const redeemPaymentMumbai = async (_code, _receiverId) => {
        try {
            if (connection.chain.name == "Polygon Mumbai") {

                if (_code == code) {
                    // adds spinner
                    setTransactionLoading(true);
                    const EIP712DomainType = [
                        { name: 'name', type: 'string' },
                        { name: 'version', type: 'string' },
                        { name: 'chainId', type: 'uint256' },
                        { name: 'verifyingContract', type: 'address' }
                    ]

                    const ForwardRequestType = [
                        { name: 'from', type: 'address' },
                        { name: 'to', type: 'address' },
                        { name: 'value', type: 'uint256' },
                        { name: 'gas', type: 'uint256' },
                        { name: 'nonce', type: 'uint256' },
                        { name: 'data', type: 'bytes' }
                    ]
                    const types = { ForwardRequestType };

                    // Get nonce for forwarder contract 
                    let Forwarder = require("../contracts/forwarder");

                    // const Userprovider = new ethers.providers.Web3Provider(window.ethereum);
                    // const signer = Userprovider.getSigner();
                    const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`);

                    const forwarderContract = new ethers.Contract(forwarder, Forwarder.ForwarderAbi, provider);
                    const nonce = await forwarderContract.getNonce(address).then(nonce => nonce.toString());
                    const chainId = await forwarderContract.provider.getNetwork().then(n => n.chainId);

                    console.log("nonce:", nonce)
                    console.log("chainId:", chainId)

                    // Encode meta-tx request
                    const paylockContract = new ethers.Contract(contractAddress, PayFactory.abi, provider);

                    // const boxesInterface = new ethers.utils.Interface(PayFactory.abi);
                    const data = paylockContract.interface.encodeFunctionData('RedeemPayment', [code, _receiverId]);
                    const request = {
                        from: address,
                        to: contractAddress,
                        value: 0,
                        gas: 1e6,
                        nonce,
                        data
                    };

                    const TypedData = {
                        domain: {
                            name: 'MinimalForwarder',
                            version: '0.0.1',
                            chainId: chainId,
                            verifyingContract: forwarder,
                        },
                        primaryType: 'ForwardRequest',
                        types: {
                            EIP712Domain: EIP712DomainType,
                            ForwardRequest: ForwardRequestType
                        },
                        message: {
                            request
                        }
                    };
                    const toSign = { ...TypedData, message: request };

                    const signature = await signer.provider.send('eth_signTypedData_v4',
                        [address, JSON.stringify(toSign)]);

                    let recovered = await ethers.utils.verifyTypedData(TypedData.domain, types, request, signature);

                    const valid = await forwarderContract.verify(request, signature);

                    console.log("valid:", valid)

                    console.log("recoveredAddress:", recovered)
                    if (valid) {
                        await axios.post('/api/redeem', {
                            code: code,
                            signature: signature,
                            request: request,
                            chainID: chainId,
                            contractAddress: contractAddress,
                            forwarder: forwarder
                        }).then((res) => {
                            setTransactionLoading(false);

                        }).catch((err) => {
                            console.log(err)
                            setTransactionLoading(false);
                        })
                    }
                    else {
                        console.log("Wrong recovered Addy")
                        setTransactionLoading(false);
                    }
                }
                else {
                    toastId.current = toast("Code entered is inncorect", { type: toast.TYPE.ERROR, autoClose: 5000, theme: localStorage.getItem('theme') });
                }
            }
            else {
                toastId.current = toast("Wrong Network, Please switch to the Mumbai Network", { type: toast.TYPE.ERROR, autoClose: 5000, theme: localStorage.getItem('theme') });

            }
        } catch (error) {
            console.log(error)
            setTransactionLoading(false);
        }
    }
    const redeemPaymentGoerli = async (_code, _receiverId) => {
        try {
            if (connection.chain.name == "Goerli") {

                if (_code == code) {
                    // adds spinner
                    setTransactionLoading(true);
                    const EIP712DomainType = [
                        { name: 'name', type: 'string' },
                        { name: 'version', type: 'string' },
                        { name: 'chainId', type: 'uint256' },
                        { name: 'verifyingContract', type: 'address' }
                    ]

                    const ForwardRequestType = [
                        { name: 'from', type: 'address' },
                        { name: 'to', type: 'address' },
                        { name: 'value', type: 'uint256' },
                        { name: 'gas', type: 'uint256' },
                        { name: 'nonce', type: 'uint256' },
                        { name: 'data', type: 'bytes' }
                    ]
                    const types = { ForwardRequestType };

                    // Get nonce for forwarder contract 
                    let Forwarder = require("../contracts/forwarder");

                    // const Userprovider = new ethers.providers.Web3Provider(window.ethereum);
                    // const signer = Userprovider.getSigner();
                    const provider = new ethers.providers.JsonRpcProvider(`https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID_GOERLI}`);

                    const forwarderContract = new ethers.Contract(forwarder, Forwarder.ForwarderAbi, provider);
                    const nonce = await forwarderContract.getNonce(address).then(nonce => nonce.toString());
                    const chainId = await forwarderContract.provider.getNetwork().then(n => n.chainId);

                    console.log("nonce:", nonce)
                    console.log("chainId:", chainId)

                    // Encode meta-tx request
                    const paylockContract = new ethers.Contract(contractAddress, PayFactory.abi, provider);

                    // const boxesInterface = new ethers.utils.Interface(PayFactory.abi);
                    const data = paylockContract.interface.encodeFunctionData('RedeemPayment', [code, _receiverId]);
                    const request = {
                        from: address,
                        to: contractAddress,
                        value: 0,
                        gas: 1e6,
                        nonce,
                        data
                    };

                    const TypedData = {
                        domain: {
                            name: 'MinimalForwarder',
                            version: '0.0.1',
                            chainId: chainId,
                            verifyingContract: forwarder,
                        },
                        primaryType: 'ForwardRequest',
                        types: {
                            EIP712Domain: EIP712DomainType,
                            ForwardRequest: ForwardRequestType
                        },
                        message: {
                            request
                        }
                    };
                    const toSign = { ...TypedData, message: request };

                    const signature = await signer.provider.send('eth_signTypedData_v4',
                        [address, JSON.stringify(toSign)]);

                    let recovered = await ethers.utils.verifyTypedData(TypedData.domain, types, request, signature);

                    const valid = await forwarderContract.verify(request, signature);

                    console.log("valid:", valid)

                    console.log("recoveredAddress:", recovered)
                    if (valid) {
                        await axios.post('/api/redeem', {
                            code: code,
                            signature: signature,
                            request: request,
                            chainID: chainId,
                            contractAddress: contractAddress,
                            forwarder: forwarder
                        }).then((res) => {
                            setTransactionLoading(false);

                        }).catch((err) => {
                            console.log(err)
                            setTransactionLoading(false);
                        })
                    }
                    else {
                        console.log("Wrong recovered Addy")
                        setTransactionLoading(false);
                    }
                }
                else {
                    toastId.current = toast("Code entered is inncorect", { type: toast.TYPE.ERROR, autoClose: 5000, theme: localStorage.getItem('theme') });
                }
            }
            else {
                toastId.current = toast("Wrong Network, Please switch to the Goerli Network", { type: toast.TYPE.ERROR, autoClose: 5000, theme: localStorage.getItem('theme') });
            }
        } catch (error) {
            console.log(error)
            setTransactionLoading(false);
        }
    }


    return (
        <div className={` h-full min-h-screen w-full grid grid-cols-[repeat(7,1fr)] grid-rows-[100px,25px,auto,100px] bg-[ghostwhite] dark:bg-[#131341]`}>
            <Head>
                <title>Paylock</title>
                <meta name="Send crypto like web2" content="Send crpto " />
                <link rel="icon" href="/daaps.svg" />
            </Head>

            <Navigation />

            <span className={`self-start justify-self-auto sm:justify-self-center 
                            col-start-1 col-end-8 row-start-3 row-end-4 max-h-[300px] overflow-y-auto sm:mx-4 p-4 mx-4
                            grid grid-rows-[30px,auto] grid-cols-[repeat(7,1fr)]
                            border-black border-[2px] bg-[aliceblue] dark:bg-[#100d23] rounded-2xl`}>

                <span className={`
                             col-start-1 col-end-8 row-start-1 row-end-2
                           bg-[aliceblue] dark:bg-[#1e1d45]
                             grid grid-cols-[repeat(4,1fr)] grid-rows-[30px]
                      `}>
                    <span className={`font-bold text-xs  dark:text-[#20cc9e] text-[#372963] self-center block m-2`}>
                        Redeem Payments
                    </span>
                </span>

                {!isSSR ?
                    <React.Fragment>
                        {isConnected ?
                            <>


                                <span className={`
                                     col-start-1 col-end-8 row-start-2 row-end-3
                                     bg-[aliceblue] dark:bg-[#1e1d45]
                                       grid grid-cols-[repeat(4,1fr)] grid-rows-[1]`
                                }>
                                    {mumbaiRedeemablePayments.map((transaction) => {
                                        return (
                                            <Accordion
                                                key={parseInt(transaction.receiverId._hex)}
                                                className={`dark:bg-[#100d23] bg-[aliceblue] col-start-1 col-end-8 my-2`}
                                                sx={{}}
                                                disableGutters={true}
                                                disabled={isDisconnected}
                                            >
                                                <AccordionSummary
                                                    className={`border-black border-[2px]`}
                                                    expandIcon={<ExpandMoreIcon className={`dark:text-[#20cc9e] `} />}
                                                    aria-controls="panel1a-content"
                                                    id="panel1a-header"
                                                >


                                                    <Avatar className=" ml-2 w-8 h-8 inline self-center" {...config.current} />

                                                    <span className={`self-center ml-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>{transaction.receiver.substring(0, 4) + "..." + transaction.receiver.substring(38, 42)}</span>

                                                    <span className={`self-center ml-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963] flex`}>
                                                        {transaction.tokenAddress == '0x0000000000000000000000000000000000000000' ?
                                                            <React.Fragment>
                                                                <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Network:</span>

                                                                <span className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Polygon (Mumbai)</span>

                                                                <Image
                                                                    className={``}
                                                                    alt={`Mumbai Network`}
                                                                    src={`/MATIC.svg`}
                                                                    width={20}
                                                                    height={20}
                                                                />

                                                                {transaction.state == 0 &&
                                                                    <span className={`flex`}>
                                                                        <svg className={`inline animate-pulse `} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#27AE60" />
                                                                        </svg>
                                                                        <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}> Active </p>
                                                                    </span>
                                                                }

                                                                {transaction.state == 1 &&
                                                                    <span className={`flex`}>
                                                                        <svg className={`inline`} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#E51400" />
                                                                        </svg>
                                                                        <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Withdrawn</p>
                                                                    </span>
                                                                }
                                                                {transaction.state == 2 &&
                                                                    <span className={`flex`}>
                                                                        <svg className={`inline`} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#E51400" />
                                                                        </svg>
                                                                        <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Received</p>
                                                                    </span>
                                                                }
                                                            </React.Fragment>
                                                            :
                                                            <React.Fragment>
                                                                <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Network:</span>

                                                                <span className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Polygon (Mumbai)</span>

                                                                <Image
                                                                    className={``}
                                                                    alt={`Mumbai Network`}
                                                                    src={`/MATIC.svg`}
                                                                    width={20}
                                                                    height={20}
                                                                />

                                                                {transaction.state == 0 &&
                                                                    <span className={`flex`}>
                                                                        <svg className={`inline animate-pulse `} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#27AE60" />
                                                                        </svg>
                                                                        <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}> Active </p>
                                                                    </span>
                                                                }

                                                                {transaction.state == 1 &&
                                                                    <span className={`flex`}>
                                                                        <svg className={`inline`} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#E51400" />
                                                                        </svg>
                                                                        <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Withdrawn</p>
                                                                    </span>
                                                                }
                                                                {transaction.state == 2 &&
                                                                    <span className={`flex`}>
                                                                        <svg className={`inline`} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#E51400" />
                                                                        </svg>
                                                                        <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Received</p>
                                                                    </span>
                                                                }
                                                            </React.Fragment>
                                                        }
                                                    </span>
                                                </AccordionSummary>
                                                <AccordionDetails className={`dark:bg-[#1e1d45] bg-[aliceblue]`}>
                                                    <span className={`self-center ml-2 flex`}>
                                                        {transaction.tokenAddress == '0x0000000000000000000000000000000000000000' ?
                                                            <React.Fragment>
                                                                <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Token:</span>

                                                                <span className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>MATIC</span>

                                                                <Image
                                                                    className={``}
                                                                    alt={`Matic Token`}
                                                                    src={`/MATIC.svg`}
                                                                    width={20}
                                                                    height={20}
                                                                />

                                                                <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Amount:</span>
                                                                <span className={`blur-sm hover:blur-none self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>
                                                                    {Number(transaction.value._hex) / 1e18}
                                                                </span>

                                                            </React.Fragment>
                                                            :
                                                            <React.Fragment>
                                                                <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Token:</span>
                                                                <span className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>{getTokenImage("Mumbai", `${transaction.tokenAddress}`)}</span>
                                                                <Image
                                                                    className={``}
                                                                    alt={`Mumbai Network`}
                                                                    src={"/" + getTokenImage("Mumbai", `${transaction.tokenAddress}`) + ".svg"}
                                                                    width={20}
                                                                    height={20}
                                                                />
                                                                <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Amount:</span>
                                                                <span className={`blur-sm hover:blur-none self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>
                                                                    {Number(transaction.value._hex) / 1e18}
                                                                </span>
                                                            </React.Fragment>
                                                        }
                                                    </span>
                                                    {transaction.state == 0 &&
                                                        <React.Fragment>
                                                            <span className={`self-center m-4 flex`}>
                                                                <span className={`self-center font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Enter 4 digit Code:</span>
                                                                <NumericFormat
                                                                    key={parseInt(transaction.receiverId._hex)}
                                                                    disabled={isDisconnected}
                                                                    className={`focus:outline-none font-extralight text-xs rounded ml-2 `}
                                                                    allowNegative={false}
                                                                    value={code}
                                                                    onValueChange={
                                                                        debounce((values) => {

                                                                            if (values.floatValue != 0 && values.floatValue) {
                                                                                // only if VALUE IS NOT 0 AND !undefined
                                                                                // Sets Receiving Amount and Fee and calculates usdValue 
                                                                                setCode(values.value)
                                                                            }

                                                                        }, 500)

                                                                    }
                                                                />
                                                            </span>

                                                            <button
                                                                key={parseInt(transaction.receiverId._hex)}
                                                                disabled={transactionLoading}
                                                                onClick={() => {
                                                                    redeemPaymentMumbai(transaction.code, parseInt(transaction.receiverId._hex))
                                                                }} className={`w-full  p-2 self-center  bg-[#1e1d45] dark:bg-[#100d23] text-[#c24bbe] text-sm `}>
                                                                {transactionLoading &&
                                                                    <Image
                                                                        className={`animate-spin inline`}
                                                                        src={'/loading.svg'}
                                                                        width={20}
                                                                        height={20}
                                                                    />
                                                                }
                                                                <span className={`align-super`}>
                                                                    Redeem Payment
                                                                </span>

                                                            </button>
                                                        </React.Fragment>
                                                    }

                                                </AccordionDetails>
                                            </Accordion>
                                        )
                                    })
                                    }

                                    {goerliRedeemablePayments.map((transaction) => {
                                        return (
                                            <Accordion
                                                key={parseInt(transaction.receiverId._hex)}
                                                className={`dark:bg-[#100d23] bg-[aliceblue] col-start-1 col-end-8 my-2`}
                                                sx={{}}
                                                disableGutters={true}
                                                disabled={isDisconnected}
                                            >
                                                <AccordionSummary
                                                    className={`border-black border-[2px]`}
                                                    expandIcon={<ExpandMoreIcon className={`dark:text-[#20cc9e] `} />}
                                                    aria-controls="panel1a-content"
                                                    id="panel1a-header"
                                                >


                                                    <Avatar className=" ml-2 w-8 h-8 inline self-center" {...config.current} />

                                                    <span className={`self-center ml-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>{transaction.receiver.substring(0, 4) + "..." + transaction.receiver.substring(38, 42)}</span>

                                                    <span className={`self-center ml-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963] flex`}>
                                                        {transaction.tokenAddress == '0x0000000000000000000000000000000000000000' ?
                                                            <React.Fragment>
                                                                <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Network:</span>

                                                                <span className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Ethereum (Goerli)</span>

                                                                <Image
                                                                    className={``}
                                                                    alt={`Goerli Network`}
                                                                    src={`/ETH.svg`}
                                                                    width={20}
                                                                    height={20}
                                                                />

                                                                {transaction.state == 0 &&
                                                                    <span className={`flex`}>
                                                                        <svg className={`inline animate-pulse `} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#27AE60" />
                                                                        </svg>
                                                                        <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}> Active </p>
                                                                    </span>
                                                                }

                                                                {transaction.state == 1 &&
                                                                    <span className={`flex`}>
                                                                        <svg className={`inline`} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#E51400" />
                                                                        </svg>
                                                                        <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Withdrawn</p>
                                                                    </span>
                                                                }
                                                                {transaction.state == 2 &&
                                                                    <span className={`flex`}>
                                                                        <svg className={`inline`} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#E51400" />
                                                                        </svg>
                                                                        <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Received</p>
                                                                    </span>
                                                                }
                                                            </React.Fragment>
                                                            :
                                                            <React.Fragment>
                                                                <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Network:</span>

                                                                <span className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Ethereum (Goerli)</span>

                                                                <Image
                                                                    className={``}
                                                                    alt={`Goerli Network`}
                                                                    src={`/ETH.svg`}
                                                                    width={20}
                                                                    height={20}
                                                                />

                                                                {transaction.state == 0 &&
                                                                    <span className={`flex`}>
                                                                        <svg className={`inline animate-pulse `} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#27AE60" />
                                                                        </svg>
                                                                        <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}> Active </p>
                                                                    </span>
                                                                }

                                                                {transaction.state == 1 &&
                                                                    <span className={`flex`}>
                                                                        <svg className={`inline`} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#E51400" />
                                                                        </svg>
                                                                        <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Withdrawn</p>
                                                                    </span>
                                                                }
                                                                {transaction.state == 2 &&
                                                                    <span className={`flex`}>
                                                                        <svg className={`inline`} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                            <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#E51400" />
                                                                        </svg>
                                                                        <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Received</p>
                                                                    </span>
                                                                }
                                                            </React.Fragment>
                                                        }
                                                    </span>
                                                </AccordionSummary>
                                                <AccordionDetails className={`dark:bg-[#1e1d45] bg-[aliceblue]`}>
                                                    <span className={`self-center ml-2 flex`}>
                                                        {transaction.tokenAddress == '0x0000000000000000000000000000000000000000' ?
                                                            <React.Fragment>
                                                                <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Token:</span>

                                                                <span className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>ETH</span>

                                                                <Image
                                                                    className={``}
                                                                    alt={`ETH Token`}
                                                                    src={`/ETH.svg`}
                                                                    width={20}
                                                                    height={20}
                                                                />

                                                                <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Amount:</span>
                                                                <span className={`blur-sm hover:blur-none self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>
                                                                    {Number(transaction.value._hex) / 1e18}
                                                                </span>

                                                            </React.Fragment>
                                                            :
                                                            <React.Fragment>
                                                                <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Token:</span>
                                                                <span className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>{getTokenImage("Goerli", `${transaction.tokenAddress}`)}</span>
                                                                <Image
                                                                    className={``}
                                                                    alt={`Goerli Network ERC20 token`}
                                                                    src={"/" + getTokenImage("Goerli", `${transaction.tokenAddress}`) + ".svg"}
                                                                    width={20}
                                                                    height={20}
                                                                />
                                                                <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Amount:</span>
                                                                <span className={`blur-sm hover:blur-none self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>
                                                                    {Number(transaction.value._hex) / 1e18}
                                                                </span>
                                                            </React.Fragment>
                                                        }
                                                    </span>
                                                    {transaction.state == 0 &&
                                                        <React.Fragment>

                                                            <CodeInput setCode={setCode} />

                                                            <button
                                                                key={parseInt(transaction.receiverId._hex)}
                                                                disabled={transactionLoading}
                                                                onClick={() => {
                                                                    redeemPaymentGoerli(transaction.code, parseInt(transaction.receiverId._hex))
                                                                }} className={`w-full  p-2 self-center  bg-[#1e1d45] dark:bg-[#100d23] text-[#c24bbe] text-sm `}>
                                                                {transactionLoading &&
                                                                    <Image
                                                                        className={`animate-spin inline`}
                                                                        src={'/loading.svg'}
                                                                        width={20}
                                                                        height={20}
                                                                    />
                                                                }
                                                                <span className={`align-super`}>
                                                                    Redeem Payment
                                                                </span>

                                                            </button>
                                                        </React.Fragment>
                                                    }

                                                </AccordionDetails>
                                            </Accordion>
                                        )
                                    })
                                    }
                                </span>
                                {mumbaiRedeemablePayments.length == 0 && goerliRedeemablePayments.length == 0 &&
                                    <span className={`
                                        col-start-1 col-end-8 row-start-2 row-end-3
                                       bg-[aliceblue] dark:bg-[#1e1d45]
                                       grid grid-cols-[repeat(4,1fr)] grid-rows-[1]`
                                    }>
                                        <span className={`col-start-1 col-end-5 font-bold text-xs dark:text-[#c24bbe] text-[#20cc9e] self-center justify-self-center block m-2`}>
                                            No Transactions Available
                                        </span>
                                    </span>
                                }

                            </>
                            :
                            <span className={`
                              col-start-1 col-end-8 row-start-2 row-end-3
                           bg-[aliceblue] dark:bg-[#1e1d45]
                             grid grid-cols-[repeat(4,1fr)] grid-rows-[1]`
                            }>
                                <span className={`col-start-1 col-end-5 font-bold text-xs dark:text-[#c24bbe] text-[#20cc9e] self-center justify-self-center block m-2`}>
                                    Connect your wallet
                                </span>
                            </span>
                        }
                    </React.Fragment>
                    :
                    <React.Fragment>
                        <span className={`
                            col-start-1 col-end-8 row-start-2 row-end-3
                            bg-[aliceblue] dark:bg-[#1e1d45]
                           grid grid-cols-[repeat(4,1fr)] grid-rows-[1]`
                        }>
                            <span className={`block bg-[grey] mx-2 col-start-1 col-end-5 h-[35px] rounded animate-pulse`}>
                            </span>
                        </span>
                    </React.Fragment>
                }
            </span>

        </div >
    )
}
export default Code;