// Nextjs /React Imports 
import Head from 'next/head'
import Image from 'next/image';
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState, useMemo } from 'react';
// Components
import Navigation from './components/Navigation';
// Utils
import axios from 'axios'
import debounce from 'lodash.debounce';
// Web3 Libraries
import {
  ConnectButton
} from '@rainbow-me/rainbowkit';
import { useNetwork, useBalance, useAccount, useSigner } from 'wagmi';
import { ethers } from 'ethers';
// UI Libraries 
import { NumericFormat } from 'react-number-format';
import PhoneInput from 'react-phone-number-input'
import Avatar, { genConfig } from 'react-nice-avatar'
import Select from 'react-select'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { toast } from 'react-toastify';
// Contract ABI and Addresses 
import PayFactory from '../artifacts/contracts/PayFactory.sol/PayLock.json'
import PaylockAddressPolygon from '../polygon.json';
import PaylockAddressMumbai from '../mumbai.json';
import PaylockAddressEth from '../eth.json'
// Colors
// Background #131341
// Component #100d23
// Button #1e1d45
// Light green #20cc9e 
// Light purple #376293  
// Light blue #149adc
//  Light pink #c24bbe

const Index = () => {
  // useRefs
  const toastId = useRef(null);
  // Avatar config 
  const config = useRef(genConfig());
  // Nextjs navigation
  const router = useRouter()
  // Theme Switch
  const [toggle, setToogle] = useState(true);
  useEffect(() => {
    if ((localStorage.getItem('theme') === 'dark')) {
      console.log("It's dark..");
      document.documentElement.classList.add('dark');
      setToogle(false);
    }
    else if ((localStorage.getItem('theme') === 'light')) {
      console.log("It's light..");
      document.documentElement.classList.remove('dark');
      setToogle(true);
    }
    else if ((localStorage.getItem('theme') == undefined)) {
      console.log("No theme set.. making it dark");
    }
  }, [])
  // Checking for window object to avoid errors using wagmi hooks .
  const [isSSR, setIsSSR] = useState(true);
  // Twillo Phone Message
  const [phone, setPhone] = useState();
  const [message, setMessage] = useState("");
  const [sendMessage, setSendMessage] = useState(false);
  // Send variables
  const [addressReciever, setAddressReciever] = useState('');
  const [addressError, setAddressError] = useState(false);
  const [token, setToken] = useState(undefined);
  const [sendAmount, setSendAmount] = useState({
    floatValue: undefined,
    formattedValue: "",
    value: ""
  });
  const [fee, setFee] = useState("");
  const [feeUSD, setFeeUSD] = useState("");
  const [receivingAmount, setReceivingAmount] = useState("");
  const [receivingAmountUSD, setReceivingAmountUSD] = useState("");
  const [USDValue, setUSDValue] = useState(undefined);

  const [tokenAllowance, setTokenAllowance] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [contractAddress, setContractAddress] = useState('');
  // Hooks
  const { data: signer } = useSigner();
  const { address, isDisconnected, isConnected } = useAccount();
  const connection = useNetwork();
  const nativeBalance = useBalance({
    addressOrName: address,
  });
  const tokenBalance = useBalance({
    addressOrName: address,
    token: token?.address
  });
  // Available Token Options
  const tokenOptions = useMemo(() => {
    if (connection.chain?.name == "Ethereum") {
      return [
        {
          value: connection.chain?.nativeCurrency.symbol,
          label: connection.chain?.nativeCurrency.symbol,
          svg: connection.chain?.nativeCurrency.symbol,
          address: undefined
        },
        { value: 'DAI', label: 'DAI', svg: 'DAI', address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
        { value: 'USDT', label: 'USDT', svg: 'USDT', address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
        { value: 'USDC', label: 'USDC', svg: 'USDC', address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
        { value: 'WBTC', label: 'WBTC', svg: 'WBTC', address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599" },
      ];
    }
    else if (connection.chain?.name == 'Polygon') {
      return [
        {
          value: connection.chain?.nativeCurrency.symbol,
          label: connection.chain?.nativeCurrency.symbol,
          svg: connection.chain?.nativeCurrency.symbol,
          address: undefined

        },
        { value: 'DAI', label: 'DAI', svg: 'DAI', address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063" },
        { value: 'USDT', label: 'USDT', svg: 'USDT', address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" },
        { value: 'USDC', label: 'USDC', svg: 'USDC', address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174" },
        { value: 'WBTC', label: 'WBTC', svg: 'WBTC', address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6" },
      ];
    }
    else if (connection.chain?.name == 'Polygon Mumbai') {
      return [
        {
          value: connection.chain?.nativeCurrency.symbol,
          label: connection.chain?.nativeCurrency.symbol,
          svg: connection.chain?.nativeCurrency.symbol,
          address: undefined
        },
        { value: 'DAI', label: 'DAI', svg: 'DAI', address: "0xd393b1E02dA9831Ff419e22eA105aAe4c47E1253" },
        { value: 'USDT', label: 'USDT', svg: 'USDT', address: "0xA02f6adc7926efeBBd59Fd43A84f4E0c0c91e832" },
        { value: 'USDC', label: 'USDC', svg: 'USDC', address: "0xe11A86849d99F524cAC3E7A0Ec1241828e332C62" },
        { value: 'WBTC', label: 'WBTC', svg: 'WBTC', address: "0x0d787a4a1548f673ed375445535a6c7A1EE56180" },
      ];
    }
  }, [connection.chain]);

  // global window check 
  useEffect(() => {
    setIsSSR(false);
  }, []);

  // Refresh token value and paylock evm contract and forwarder adddresses when connection chain changes
  useEffect(() => {
    // changes token
    if (tokenOptions) {
      setToken(tokenOptions[0])
    }
    if (connection.chain?.name == "Ethereum") {
      setContractAddress(PaylockAddressEth.PaylockAddressEth)
    }
    if (connection.chain?.name == 'Polygon') {
      setContractAddress(PaylockAddressPolygon.PaylockAddressPolygon)
    }
    if (connection.chain?.name == 'Polygon Mumbai') {
      setContractAddress(PaylockAddressMumbai.PaylockAddress)
    }
  }, [connection.chain, tokenOptions]);

  // gets token price from coingeko API
  useEffect(() => {
    if (token) {

      if (token.value == 'MATIC') {

        let network = "matic-network";

        axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${network}&vs_currencies=usd`).then((res) => {
          setUSDValue(res.data[`${network}`].usd)
        })
      }
      else if (token.value == 'ETH') {
        let network = "ethereum";
        axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${network}&vs_currencies=usd`).then((res) => {
          setUSDValue(res.data[`${network}`].usd)
        })
      }
      else {
        let network = "ethereum"
        let tokenAddress = '';
        switch (token.value) {
          case 'DAI':
            tokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F".toLocaleLowerCase()
            break;
          case 'USDT':
            tokenAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7'.toLocaleLowerCase()
            break;
          case 'USDC':
            tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'.toLocaleLowerCase()
            break;
          case 'WBTC':
            tokenAddress = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'.toLocaleLowerCase()
            break;
          default:
            // code block
            console.log('token not detected')
        }

        axios.get(`https://api.coingecko.com/api/v3/simple/token_price/${network}?contract_addresses=${tokenAddress}&vs_currencies=usd`).then((res) => {
          if (res.data) {
            setUSDValue(res.data[`${tokenAddress}`].usd)
          }
        })
      }
    }
  }, [token, connection.chain])
  // Checks allowance 
  useEffect(() => {
    if (token?.address && sendAmount.value) {
      console.log('Checking allowance')
      const checkAllowance = async () => {
        const IERC20ABI = require("../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json");
        let erc20Contract = new ethers.Contract(token.address, IERC20ABI.abi, signer);

        let data = await erc20Contract.allowance(address, contractAddress);
        console.log(parseInt(data._hex) / 1e18)
        // If allowance is smaller 
        if (parseInt(data._hex) < (sendAmount.floatValue * 1e18)) {
          setTokenAllowance(true);
        }
        else {
          setTokenAllowance(false);
        }
      }
      checkAllowance();

    }

  }, [token, connection.chain, sendAmount])

  // Send native or ERC20 transaction 
  const createtx = async () => {
    // Transaction Variables
    // Generates random code number 
    let min = 1000;
    let max = 9999;
    var _code = Math.round(Math.random() * (max - min) + min);
    // If no token address we do a native token interaction
    if (!token.address) {
      try {
        // adds spinner
        setTransactionLoading(true);
        let paylockContract = new ethers.Contract(contractAddress, PayFactory.abi, signer);

        let value = ethers.utils.parseEther((sendAmount.value).toString());
        let _tokenAddress = '0x0000000000000000000000000000000000000000'
        let _tokenAmount = ethers.utils.parseEther('0');
        console.log(_code)
        console.log(_tokenAddress)
        console.log(parseInt(_tokenAmount._hex))
        console.log(parseInt(value._hex))
        console.log(contractAddress)

        let transaction = await paylockContract.CreatePayement(addressReciever, _code, _tokenAddress, _tokenAmount, {
          value: value,
        }
        );
        await transaction.wait().then((res) => {
          setTransactionLoading(false);
          if (sendMessage) {
            axios.post('/api/text', {
              to: phone,
              message: message,
              code: _code,
              network: connection.chain?.name

            }).then((res) => {
              toastId.current = toast("Text message sent", { type: toast.TYPE.SUCCESS, autoClose: 5000, theme: localStorage.getItem('theme') });

            }).catch((err) => {
              console.log(err)
              toastId.current = toast("Failed to send text message", { type: toast.TYPE.ERROR, autoClose: 5000, theme: localStorage.getItem('theme') });

            })
          }
          toastId.current = toast("Transaction Successful", { type: toast.TYPE.SUCCESS, autoClose: 5000, theme: localStorage.getItem('theme') });
        })
          .catch((err) => {
            setTransactionLoading(false);
            // toast.update(toastId.current, { type: toast.TYPE.ERROR, autoClose: 5000, render: "Transaction Failed" });
            console.log(err)
          })

      } catch (error) {
        setTransactionLoading(false);
      }
    }
    // If token address exists we do a erc20 token interaction
    if (token.address) {
      // Check for token allowance 
      if (tokenAllowance) {
        try {
          // Adds spinner 
          setTransactionLoading(true);

          const IERC20ABI = require("../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json");
          let contract = new ethers.Contract(token.address, IERC20ABI.abi, signer);
          // Approves current chain contract address to move sendAmount.value amount of selected token
          let transaction = await contract.approve(contractAddress, ethers.utils.parseEther((sendAmount.value).toString()));

          //  Block of code to try
          await transaction.wait().then((res) => {
            // resolves spinner and allows to createPayment
            setTransactionLoading(false);
            setTokenAllowance(false);

            console.log(res)

          }).catch((err) => {
            // resolves spinner 
            setTransactionLoading(false);
            console.log(err)
          })
        }
        //  Block of code to handle errors
        catch (err) {
          console.log(err)
          setTransactionLoading(false);
        }

      }
      else {
        try {
          // adds spinner
          setTransactionLoading(true);
          // Create Payment  //  token allowance is OK. 
          let paylockContract = new ethers.Contract(contractAddress, PayFactory.abi, signer);
          let _tokenAddress = token.address;
          let _tokenAmount = ethers.utils.parseEther((sendAmount.value).toString());

          let createPaymentTransaction = await paylockContract.CreatePayement(addressReciever, _code, _tokenAddress, _tokenAmount, {
          });


          await createPaymentTransaction.wait().then((res) => {
            // resolves spinner and transaction state
            setTransactionLoading(false);
            console.log(res)
            if (sendMessage) {
              axios.post('/api/text', {
                to: phone,
                message: message,
                code: _code,
                network: connection.chain?.name
              }).then((res) => {
                console.log("ASDasnasdas")
                toastId.current = toast("Text message sent", { type: toast.TYPE.SUCCESS, autoClose: 5000, theme: localStorage.getItem('theme') });

              }).catch((err) => {
                console.log(err)
                toastId.current = toast("Failed to send text message", { type: toast.TYPE.ERROR, autoClose: 5000, theme: localStorage.getItem('theme') });
              })
            }
            toastId.current = toast("Transaction Successful", { type: toast.TYPE.SUCCESS, autoClose: 5000, theme: localStorage.getItem('theme') });
          })
            .catch((err) => {
              setTransactionLoading(false);
              console.log(err)
            })
        }
        catch (err) {
          console.log(err);
          setTransactionLoading(false);
        }
      }
    }
  }

  return (

    <div className={` h-full min-h-screen w-full grid grid-cols-[repeat(7,1fr)] grid-rows-[100px,25px,auto,100px] bg-[#131341]`}>
      <Head>
        <title>Paylock</title>
        <meta name="Send crypto like web2" content="Send crpto " />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation />

      {!isSSR ?
        <span className={`self-start justify-self-auto sm:justify-self-center 
           col-start-1 col-end-8 row-start-3 row-end-4 sm:mx-4 p-4 mx-4
           grid grid-rows-[40px,min-content,30px,30px,40px,30px,auto,30px,min-content,70px] grid-cols-1
            border-black border-[2px] bg-[aliceblue] dark:bg-[#100d23] rounded-2xl  `}>

          <span className={`grid grid-col-1 grid-rows-1 p-3`} >

            <span className={`text-[#149adc] font-bold text-base justify-self-start align-super`}>Send  </span>
          </span>

          <span className={`flex ml-2 `}>
            {addressError &&
              <>
                <Image
                  width={20}
                  height={20}
                  className={`inline `}
                  alt={'error'}
                  src={'/alert_diamond.svg'}
                />
                <span className={`text-[#c24bbe] text-sm self-center ml-2 font-semibold`}>Please insert a valid address.</span>
              </>
            }
          </span>

          <input
            name="text"
            type="text"
            disabled={isDisconnected}
            className={`self-end py-2 focus:outline-none font-extralight text-xs rounded`}
            onChange={(change) => {
              const isAddress = ethers.utils.isAddress(change.target.value);
              if (!isAddress) {
                setAddressError(true);
                setAddressReciever('');

              }
              else {
                setAddressError(false);
                setAddressReciever(change.target.value);
              }

            }}
          />
          <span className={`text-[#20cc9e] text-sm self-center `}>Receiver Address</span>


          <Select
            options={tokenOptions}
            value={token}
            isDisabled={isDisconnected}
            className={`self-center ${isDisconnected && `opacity-50`}`}
            onChange={(change) => {
              console.log(change)
              setToken(change);
            }}

            formatOptionLabel={tokenOption => (
              <div className={`flex self-center z-50`}>
                <Image
                  className={``}
                  alt={`${tokenOption.value} token`}
                  src={`/${tokenOption.svg}.svg`}
                  width={20}
                  height={20}
                />
                <span className={` font-extralight text-sm self-center ml-2 `}>{tokenOption.value}</span>
              </div>
            )}

          />
          <span className={`flex`} >
            <span className={`text-[#20cc9e] text-xs sm:text-sm self-center `}>Select token  </span>

            <span className={`flex ml-4  `}>
              {!isDisconnected && token &&
                <>
                  <span className={`text-[#20cc9e] text-xs sm:text-sm self-center `}>Balance:  </span>
                  {token && token?.value == connection.chain?.nativeCurrency.symbol &&
                    <>
                      {nativeBalance.data ?
                        <span className={`text-[#149adc] text-xs sm:text-sm self-center ml-2 `}>
                          {Number(nativeBalance.data?.formatted).toPrecision(5)}  {token.value}
                        </span>
                        :
                        <Image
                          className={`animate-spin`}
                          src={'/loading.svg'}
                          width={20}
                          height={20}
                        />

                      }

                    </>
                  }

                  {token && token?.value != connection.chain?.nativeCurrency.symbol &&
                    <>
                      {tokenBalance.data ?
                        <span className={`text-[#149adc] text-text-xs sm:text-sm self-center ml-2 `}>
                          {Number(tokenBalance.data?.formatted).toPrecision(5)} {token.value}
                        </span>
                        :
                        <Image
                          className={`animate-spin`}
                          src={'/loading.svg'}
                          width={20}
                          height={20}
                        />
                      }

                    </>
                  }
                </>
              }
            </span>
          </span>
          <span className={`flex m-2 justify-self-end  `} >
            {!isDisconnected && token &&
              <>
                {token.value == connection.chain?.nativeCurrency.symbol &&
                  <>
                    {sendAmount.value != Number(nativeBalance.data?.formatted).toPrecision(5) * 0.25 &&
                      <span className={`text-[#20cc9e] text-xs sm:text-sm self-center ml-4 rounded-xl px-2 bg-[#1e1d45] hover:opacity-90  cursor-pointer `}
                        onClick={() => {
                          setSendAmount((PreviousAmount) => ({
                            ...PreviousAmount,
                            value: (Number(nativeBalance.data?.formatted).toPrecision(5) * 0.25),
                            formattedValue: (Number(nativeBalance.data?.formatted).toPrecision(5) * 0.25).toString() + token.value,
                            floatValue: Number(nativeBalance.data?.formatted).toPrecision(5) * 0.25
                          }))

                          var fee = ((Number(nativeBalance.data?.formatted) * 0.25) * 0.005).toPrecision(5) + token.value;
                          setFee(fee)
                          var feeUSD = "( $" + Intl.NumberFormat('en-US').format(((Number(nativeBalance.data?.formatted) * 0.25) * 0.005) * USDValue) + ` USD)`
                          setFeeUSD(feeUSD)

                          var receivingAmount = ((Number(nativeBalance.data?.formatted) * 0.25) - ((Number(nativeBalance.data?.formatted) * 0.25) * 0.005)).toPrecision(5) + token.value
                          setReceivingAmount(receivingAmount);
                          var receivingUSD = '( $' + Intl.NumberFormat('en-US').format(((Number(nativeBalance.data?.formatted) * 0.25) - (Number(nativeBalance.data?.formatted) * 0.25) * 0.005) * USDValue) + ' USD)'
                          setReceivingAmountUSD(receivingUSD)
                        }}
                      > 25% </span>
                    }
                    {sendAmount.value != Number(nativeBalance.data?.formatted).toPrecision(5) * 0.50 &&
                      <span className={`text-[#20cc9e] text-xs sm:text-sm self-center ml-4 rounded-xl px-2 bg-[#1e1d45] hover:opacity-90  cursor-pointer `}
                        onClick={() => {
                          setSendAmount((PreviousAmount) => ({
                            ...PreviousAmount,
                            value: (Number(nativeBalance.data?.formatted).toPrecision(5) * 0.50),
                            formattedValue: (Number(nativeBalance.data?.formatted).toPrecision(5) * 0.50).toString() + token.value,
                            floatValue: Number(nativeBalance.data?.formatted).toPrecision(5) * 0.50
                          }))

                          var fee = ((Number(nativeBalance.data?.formatted) * 0.50) * 0.005).toPrecision(5) + token.value;
                          setFee(fee)
                          var feeUSD = "( $" + Intl.NumberFormat('en-US').format(((Number(nativeBalance.data?.formatted) * 0.50) * 0.005) * USDValue) + ` USD)`
                          setFeeUSD(feeUSD)

                          var receivingAmount = ((Number(nativeBalance.data?.formatted) * 0.50) - ((Number(nativeBalance.data?.formatted) * 0.50) * 0.005)).toPrecision(5) + token.value
                          setReceivingAmount(receivingAmount);
                          var receivingUSD = '( $' + Intl.NumberFormat('en-US').format(((Number(nativeBalance.data?.formatted) * 0.50) - (Number(nativeBalance.data?.formatted) * 0.50) * 0.005) * USDValue) + ' USD)'
                          setReceivingAmountUSD(receivingUSD)
                        }}
                      > 50% </span>
                    }

                    {sendAmount.value != Number(nativeBalance.data?.formatted).toPrecision(5) * 0.75 &&
                      <span className={`text-[#20cc9e] text-xs sm:text-sm self-center ml-4 rounded-xl px-2 bg-[#1e1d45] hover:opacity-90  cursor-pointer `}
                        onClick={() => {
                          setSendAmount((PreviousAmount) => ({
                            ...PreviousAmount,
                            value: (Number(nativeBalance.data?.formatted).toPrecision(5) * 0.75),
                            formattedValue: (Number(nativeBalance.data?.formatted).toPrecision(5) * 0.75).toString() + token.value,
                            floatValue: Number(nativeBalance.data?.formatted).toPrecision(5) * 0.75
                          }))
                          var fee = ((Number(nativeBalance.data?.formatted) * 0.75) * 0.005).toPrecision(5) + token.value;
                          setFee(fee)
                          var feeUSD = "( $" + Intl.NumberFormat('en-US').format(((Number(nativeBalance.data?.formatted) * 0.75) * 0.005) * USDValue) + ` USD)`
                          setFeeUSD(feeUSD)

                          var receivingAmount = ((Number(nativeBalance.data?.formatted) * 0.75) - ((Number(nativeBalance.data?.formatted) * 0.75) * 0.005)).toPrecision(5) + token.value
                          setReceivingAmount(receivingAmount);
                          var receivingUSD = '( $' + Intl.NumberFormat('en-US').format(((Number(nativeBalance.data?.formatted) * 0.75) - (Number(nativeBalance.data?.formatted) * 0.75) * 0.005) * USDValue) + ' USD)'
                          setReceivingAmountUSD(receivingUSD)

                        }}
                      > 75% </span>
                    }
                  </>
                }

                {token.value != connection.chain?.nativeCurrency.symbol &&
                  <>
                    {sendAmount.value != Number(tokenBalance.data?.formatted).toPrecision(5) * 0.25 &&
                      <span className={`text-[#20cc9e] text-xs sm:text-sm self-center ml-4 rounded-xl px-2 bg-[#1e1d45] hover:opacity-90  cursor-pointer `}
                        onClick={() => {
                          setSendAmount((PreviousAmount) => ({
                            ...PreviousAmount,
                            value: (Number(tokenBalance.data?.formatted).toPrecision(5) * 0.25),
                            formattedValue: (Number(tokenBalance.data?.formatted).toPrecision(5) * 0.25).toString() + token.value,
                            floatValue: Number(tokenBalance.data?.formatted).toPrecision(5) * 0.25
                          }))

                          var fee = ((Number(tokenBalance.data?.formatted) * 0.25) * 0.005).toPrecision(5) + token.value;
                          setFee(fee)
                          var feeUSD = "( $" + Intl.NumberFormat('en-US').format(((Number(tokenBalance.data?.formatted) * 0.25) * 0.005) * USDValue) + ` USD)`
                          setFeeUSD(feeUSD)

                          var receivingAmount = ((Number(tokenBalance.data?.formatted) * 0.25) - ((Number(tokenBalance.data?.formatted) * 0.25) * 0.005)).toPrecision(5) + token.value
                          setReceivingAmount(receivingAmount);
                          var receivingUSD = '( $' + Intl.NumberFormat('en-US').format(((Number(tokenBalance.data?.formatted) * 0.25) - (Number(tokenBalance.data?.formatted) * 0.25) * 0.005) * USDValue) + ' USD)'
                          setReceivingAmountUSD(receivingUSD)
                        }}
                      > 25% </span>
                    }
                    {sendAmount.value != Number(tokenBalance.data?.formatted).toPrecision(5) * 0.50 &&
                      <span className={`text-[#20cc9e] text-xs sm:text-sm self-center ml-4 rounded-xl px-2 bg-[#1e1d45] hover:opacity-90  cursor-pointer `}
                        onClick={() => {
                          setSendAmount((PreviousAmount) => ({
                            ...PreviousAmount,
                            value: (Number(tokenBalance.data?.formatted).toPrecision(5) * 0.50),
                            formattedValue: (Number(tokenBalance.data?.formatted).toPrecision(5) * 0.50).toString() + token.value,
                            floatValue: Number(tokenBalance.data?.formatted).toPrecision(5) * 0.50
                          }))

                          var fee = ((Number(tokenBalance.data?.formatted) * 0.50) * 0.005).toPrecision(5) + token.value;
                          setFee(fee)
                          var feeUSD = "( $" + Intl.NumberFormat('en-US').format(((Number(tokenBalance.data?.formatted) * 0.50) * 0.005) * USDValue) + ` USD)`
                          setFeeUSD(feeUSD)

                          var receivingAmount = ((Number(tokenBalance.data?.formatted) * 0.50) - ((Number(tokenBalance.data?.formatted) * 0.50) * 0.005)).toPrecision(5) + token.value
                          setReceivingAmount(receivingAmount);
                          var receivingUSD = '( $' + Intl.NumberFormat('en-US').format(((Number(tokenBalance.data?.formatted) * 0.50) - (Number(tokenBalance.data?.formatted) * 0.50) * 0.005) * USDValue) + ' USD)'
                          setReceivingAmountUSD(receivingUSD)
                        }}
                      > 50% </span>
                    }
                    {sendAmount.value != Number(tokenBalance.data?.formatted).toPrecision(5) * 0.75 &&
                      <span className={`text-[#20cc9e] text-xs sm:text-sm self-center ml-4 rounded-xl px-2 bg-[#1e1d45] hover:opacity-90  cursor-pointer `}
                        onClick={() => {
                          setSendAmount((PreviousAmount) => ({
                            ...PreviousAmount,
                            value: (Number(tokenBalance.data?.formatted).toPrecision(5) * 0.75),
                            formattedValue: (Number(tokenBalance.data?.formatted).toPrecision(5) * 0.75).toString() + token.value,
                            floatValue: Number(tokenBalance.data?.formatted).toPrecision(5) * 0.75
                          }))

                          var fee = ((Number(tokenBalance.data?.formatted) * 0.75) * 0.005).toPrecision(5) + token.value;
                          setFee(fee)
                          var feeUSD = "( $" + Intl.NumberFormat('en-US').format(((Number(tokenBalance.data?.formatted) * 0.75) * 0.005) * USDValue) + ` USD)`
                          setFeeUSD(feeUSD)

                          var receivingAmount = ((Number(tokenBalance.data?.formatted) * 0.75) - ((Number(tokenBalance.data?.formatted) * 0.75) * 0.005)).toPrecision(5) + token.value
                          setReceivingAmount(receivingAmount);
                          var receivingUSD = '( $' + Intl.NumberFormat('en-US').format(((Number(tokenBalance.data?.formatted) * 0.75) - (Number(tokenBalance.data?.formatted) * 0.75) * 0.005) * USDValue) + ' USD)'
                          setReceivingAmountUSD(receivingUSD)
                        }}
                      > 75% </span>
                    }
                    {sendAmount.value != Number(tokenBalance.data?.formatted).toPrecision(5) &&
                      <span className={`text-[#20cc9e] text-xs sm:text-sm self-center ml-4 rounded-xl px-2 bg-[#1e1d45] hover:opacity-90  cursor-pointer `}
                        onClick={() => {
                          // Sets sendAmount & fee,feeUSD, receivingAmount,receivingAmountUSD
                          setSendAmount((PreviousAmount) => ({
                            ...PreviousAmount,
                            value: (Number(tokenBalance.data?.formatted).toPrecision(5)),
                            formattedValue: (Number(tokenBalance.data?.formatted).toPrecision(5)).toString() + token.value,
                            floatValue: Number(tokenBalance.data?.formatted).toPrecision(5)
                          }))

                          var fee = (Number(tokenBalance.data?.formatted) * 0.005).toPrecision(5) + token.value;
                          setFee(fee)
                          var feeUSD = "( $" + Intl.NumberFormat('en-US').format((Number(tokenBalance.data?.formatted) * 0.005) * USDValue) + ` USD)`
                          setFeeUSD(feeUSD)

                          var receivingAmount = (Number(tokenBalance.data?.formatted) - (Number(tokenBalance.data?.formatted) * 0.005)).toPrecision(5) + token.value
                          setReceivingAmount(receivingAmount);
                          var receivingUSD = '( $' + Intl.NumberFormat('en-US').format((Number(tokenBalance.data?.formatted) - Number(tokenBalance.data?.formatted) * 0.005) * USDValue) + ' USD)'
                          setReceivingAmountUSD(receivingUSD)
                        }}
                      > max </span>
                    }
                  </>
                }
              </>
            }
          </span>
          <NumericFormat
            disabled={isDisconnected || !token}
            className={`focus:outline-none font-extralight text-xs rounded `}
            allowNegative={false}
            value={sendAmount.value}
            thousandSeparator
            suffix={token?.value}
            onValueChange={
              debounce((values) => {
                setSendAmount(values);
                console.log(values.value)
                console.log(values.value * 1e18)
                if (values.floatValue != 0 && values.floatValue) {
                  // only if VALUE IS NOT 0 AND !undefined
                  // Sets Receiving Amount and Fee and calculates usdValue 
                  var fee = (Number(values.value) * 0.005) + token.value;
                  setFee(fee)
                  var feeUSD = "( $" + Intl.NumberFormat('en-US').format((Number(values.value) * 0.005) * USDValue) + ` USD)`
                  setFeeUSD(feeUSD)

                  var receivingAmount = (values.value * 1e18 - ((values.value * 0.005) * 1e18)) / 1e18 + token.value
                  setReceivingAmount(receivingAmount);
                  var receivingUSD = '( $' + Intl.NumberFormat('en-US').format((Number(values.value) - Number(values.value) * 0.005) * USDValue) + ' USD)'
                  setReceivingAmountUSD(receivingUSD)
                }

              }, 500)

            }
          />

          <Accordion
            className={`dark:bg-[#100d23]`}
            sx={{ borderRadius: "10px", marginTop: "15px" }}
            disableGutters={true}
            disabled={isDisconnected || !addressReciever || !token}
          >
            <AccordionSummary
              className={`border-black border-[2px]`}
              expandIcon={<ExpandMoreIcon className={`dark:text-[#20cc9e]`} />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <span className={`font-bold text-xs text-[#20cc9e]`}
              >Payment Details</span>
            </AccordionSummary>
            <AccordionDetails className={`dark:bg-[#1e1d45]`}>
              <div className={`  rounded `}>
                <span className={`flex  `}>
                  <span className={`font-bold text-xs dark:text-[#20cc9e] text-[#372963] self-center m-2`}
                  >Sending:
                  </span>
                  <span className={`flex border-[1px] cursor-pointer border-[#372963] rounded  `}>

                    <Avatar className="w-8 h-8 inline self-center ml-2" {...config.current} />
                    <input
                      name="name"
                      type="text"
                      className={`ml-2 self-center justify-self-start text-[#c24bbe] `}
                      value={addressReciever.substring(0, 4) + "..." + addressReciever.substring(38, 42)}
                      disabled={true}
                    />
                  </span>
                </span>

                <span className={`flex`}>
                  <span className={`font-bold text-xs dark:text-[#20cc9e] text-[#372963] self-center block m-2`}>
                    Fee:
                  </span>
                  <span className={`font-extralight text-xs text-[#c24bbe] self-center block m-2 ml-[35px] `}>
                    {sendAmount.floatValue != 0 && sendAmount.floatValue && fee}
                  </span>
                  <span className={`font-extralight text-xs text-[#149adc] self-center  `}>
                    {sendAmount.floatValue != 0 && sendAmount.floatValue && feeUSD}
                  </span>


                </span>
                <span className={`flex`}>
                  <span className={`font-bold text-xs dark:text-[#20cc9e] text-[#372963] self-center block m-2`}>
                    Receiving:
                  </span>
                  <span className={`font-extralight text-xs text-[#c24bbe] self-center block m-2 `}>
                    {sendAmount.floatValue != 0 && sendAmount.floatValue && receivingAmount}
                  </span>
                  <span className={`font-extralight text-xs text-[#149adc] self-center block `}>
                    {sendAmount.floatValue != 0 && sendAmount.floatValue && receivingAmountUSD}
                  </span>
                </span>
                <span className={`flex`}>
                  <span className={`font-bold text-xs dark:text-[#20cc9e] text-[#372963] self-center block m-2`}>
                    Network:
                  </span>
                  <span className={`font-extralight text-xs text-[#c24bbe] self-center block m-2`}>
                    {connection.chain?.name}
                  </span>
                </span>
                <span className={`flex`}>
                  <span className={`font-bold text-xs dark:text-[#20cc9e] text-[#372963] self-center block m-2`}>
                    Method:
                  </span>
                  <span className={`font-extralight text-xs text-[#c24bbe] self-center block m-2`}>
                    Single Payment (Withdrawable)
                  </span>
                </span>

                <span className={`mt-2 flex border-t-[1px] dark:border-[#20cc9e] border-[#372963]`}>
                  <input
                    type="checkbox"
                    onChange={(value) => {
                      console.log(value.target.checked)
                      setSendMessage(value.target.checked)
                    }}
                  />

                  <span className={`font-bold text-xs dark:text-[#20cc9e] text-[#372963] self-center block m-2`}>
                    Notify Recepient via Text Message
                  </span>
                  <span className={`font-extralight text-xs text-[#c24bbe] self-center block m-2`}>

                  </span>
                </span>
                {sendMessage &&
                  <React.Fragment>
                    <span className={`bg-slate-300`}>
                      <PhoneInput
                        defaultCountry='CA'
                        className={`m-2`}
                        placeholder="Enter reciever phone number"
                        value={phone}
                        onChange={(number) => {
                          console.log(number)
                          setPhone(number)
                        }} />
                    </span>

                    <input
                      maxLength={150}
                      name="Message"
                      placeholder='Enter Message Max (150 characters)'
                      type="text"
                      disabled={isDisconnected}
                      className={`py-4 m-2 focus:outline-none font-extralight text-xs rounded w-full`}
                      onChange={(change) => {
                        setMessage(change.target.value);
                      }}
                    />
                  </React.Fragment>
                }


              </div>
            </AccordionDetails>
          </Accordion>

          {isDisconnected &&
            <span className={`mt-2 justify-self-center self-center`}>
              <ConnectButton />
            </span>
          }
          {isConnected && addressReciever == '' &&
            <button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled >Enter address</button>
          }
          {isConnected && addressReciever != '' && !token &&
            <button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled >Select token</button>
          }
          {isConnected && addressReciever != '' && token && sendAmount.floatValue == undefined &&
            < button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled >Enter Amount</button>
          }
          {isConnected && addressReciever != '' && token && sendAmount.floatValue == 0 &&
            < button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled >Enter Amount</button>
          }

          {isConnected && addressReciever != '' && token && token.value != connection.chain?.nativeCurrency.symbol && Number(sendAmount.value) > Number(tokenBalance.data?.formatted) &&
            < button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled >{`Insufficient ${token.value}`} </button>
          }
          {isConnected && addressReciever != '' && token && token.value == connection.chain?.nativeCurrency.symbol && Number(sendAmount.value) > Number(nativeBalance.data.formatted) &&
            < button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled > {`Insufficient ${token.value}`}</button>
          }

          {isConnected && addressReciever != '' && token && token.value == connection.chain?.nativeCurrency.symbol && Number(nativeBalance.data?.value) != 0 &&
            sendAmount.floatValue != undefined && sendAmount.floatValue != 0 && Number(sendAmount.value) <= Number(nativeBalance.data.formatted) &&
            <button
              disabled={transactionLoading}
              onClick={() => {
                createtx();
              }} className={`p-2 max-h-[32px] self-center bg-[#1e1d45] text-[#c24bbe] text-sm `}>

              <span className={`inline-flex self-center `}>
                {transactionLoading &&
                  <Image
                    className={`animate-spin`}
                    src={'/loading.svg'}
                    width={20}
                    height={20}
                  />
                }
                <span className={`flex self-center ml-2`} >
                  Send
                </span>
              </span>

            </button>
          }

          {isConnected && addressReciever != '' && token && token.value != connection.chain?.nativeCurrency.symbol && Number(tokenBalance.data?.value) != 0 &&
            sendAmount.floatValue != undefined && sendAmount.floatValue != 0 && Number(sendAmount.value) <= Number(tokenBalance.data.formatted) &&
            <button disabled={transactionLoading}
              onClick={() => {
                createtx();
              }} className={`p-2 max-h-[32px] self-center bg-[#1e1d45] text-[#c24bbe] text-sm `}>
              {tokenAllowance ?

                <span className={`inline-flex self-center `}>
                  {transactionLoading &&
                    <Image
                      className={`animate-spin`}
                      src={'/loading.svg'}
                      width={20}
                      height={20}

                    />
                  }
                  <span className={`flex self-center ml-2`} >
                    Approve {token.value}
                  </span>
                </span>
                :
                <span className={`inline-flex self-center `}>
                  {transactionLoading &&
                    <Image
                      className={`animate-spin`}
                      src={'/loading.svg'}
                      width={20}
                      height={20}
                    />
                  }
                  <span className={`flex self-center ml-2`} >
                    Create Payment
                  </span>
                </span>
              }
            </button>
          }
        </span>
        :
        <span className={`self-start justify-self-auto sm:justify-self-center 
        col-start-1 col-end-8 row-start-3 row-end-4 sm:mx-4 p-4 mx-4
        grid grid-rows-[40px,min-content,30px,30px,40px,30px,auto,30px,min-content,70px] grid-cols-1
         border-black border-[2px] bg-[aliceblue] dark:bg-[#100d23] rounded-2xl  `}>
          <span className={`block bg-[grey] mx-2 w-[300px] h-[35px] rounded animate-pulse  `}>  </span>
          <span className={`block bg-[grey] mx-2 w-[300px] h-[35px] rounded animate-pulse mt-8`}>  </span>

          <span className={`block bg-[grey] mx-2 w-[300px] h-[35px] rounded animate-pulse mt-8 `}>  </span>
          <span className={``}>  </span>
          <span className={``}>  </span>
          <span className={`block bg-[grey] mx-2 w-[300px] h-[35px] rounded animate-pulse mt-8 `}>  </span>

        </span>
      }
    </div >
  )
}
export default Index;
