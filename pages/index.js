import Head from 'next/head'
import { useRouter } from 'next/router'
import debounce from 'lodash.debounce';

import {
  ConnectButton
} from '@rainbow-me/rainbowkit';
import { useConnect, useNetwork, useBalance, useAccount, useSignTypedData, useSignMessage, useSigner, useContract, chain } from 'wagmi';
import { ethers, providers } from 'ethers';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';
import axios from 'axios'
import { NumericFormat } from 'react-number-format';
import Avatar, { genConfig } from 'react-nice-avatar'
import Select from 'react-select'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';



import { PolygonAddress } from '../polygon';
import { mumbaiAddress } from '../mumbai';
import { EthAddress } from '../eth'

import PayFactory from '../artifacts/contracts/PayFactory.sol/PayLock.json'

// Background #131341
// Component #100d23
// Button #1e1d45
// Light green #20cc9e 
// Light purple #376293  
// Light blue #149adc
//  Light pink #c24bbe

const Index = () => {


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
  // Avatar config at config.current;
  const config = useRef(genConfig());
  // control views
  const [screen, setScreen] = useState('SingleTransaction');

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


  const { data: signer } = useSigner();
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    onSuccess: async (sign, msg) => {
      let recovered = await ethers.utils.verifyMessage(msg.message, sign);
      if (recovered == address) {
        console.log('Calling Relayer')
      }

      // fetch('/api/hello')
      //   .then((res) => res.json())
      //   .then((data) => {
      //     console.log(data)

      //   })
    }
  })
  const { address, isConnecting, isDisconnected } = useAccount();
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

  // Refresh token value and paylock evm contract adddress when connection chain changes
  useEffect(() => {
    // changes token
    if (tokenOptions) {
      setToken(tokenOptions[0])
    }
    if (connection.chain?.name == "Ethereum") {
      setContractAddress(EthAddress)
    }
    if (connection.chain?.name == 'Polygon') {
      setContractAddress(PolygonAddress)
    }
    if (connection.chain?.name == 'Polygon Mumbai') {
      setContractAddress(mumbaiAddress)
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

  const withdrawTx = async () => {
    var message = `Sending ${addressReciever} :  ${sendAmount.formattedValue}`
    let messageHash = ethers.utils.id(message);
    let messageHashBytes = ethers.utils.arrayify(messageHash)

    signMessage({ message: message });
  }

  const createtx = async () => {
    // Estimate fee, NOTE: ERRORS on Mumbai but works on eth mainnet
    // var gasfee = (await signer.getFeeData()).gasPrice._hex
    // var contractFee = await contract.estimateGas.CreatePayement(addressReciever, '1141')
    // var estimatedGas = ethers.utils.formatUnits(Number(gasfee) * Number(contractFee._hex), "ether")
    // console.log("estimatedGas:", estimatedGas)

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

        let transaction = await paylockContract.CreatePayement(addressReciever, _code, _tokenAddress, _tokenAmount, {
          value: value,
        }
        );
        await transaction.wait().then((res) => {
          setTransactionLoading(false);
          // toast.update(toastId.current, { type: toast.TYPE.SUCCESS, autoClose: 5000, render: "Transaction Successful" });
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
            gasLimit: 21000
          });


          await createPaymentTransaction.wait().then((res) => {
            // resolves spinner and transaction state
            setTransactionLoading(false);
            console.log(res)
            // toast.update(toastId.current, { type: toast.TYPE.SUCCESS, autoClose: 5000, render: "Transaction Successful" });
          })
            .catch((err) => {
              setTransactionLoading(false);
              // toast.update(toastId.current, { type: toast.TYPE.ERROR, autoClose: 5000, render: "Transaction Failed" });
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

    <div className={` h-full min-h-screen w-full grid grid-cols-[repeat(7,1fr)] grid-rows-[100px,25px,auto,100px] ${!isSSR && connection.chain?.name == "Ethereum" && `bg-[#383843]`} bg-[#131341]`}>
      <Head>
        <title>Paylock</title>
        <meta name="Send crypto like web2" content="Send crpto " />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <span className={`col-start-1 col-end-8 mx-4 grid  `}>
        {/* Logo & Navigation */}
        <span className={`flex`} >
          <Image
            width={30}
            height={30}
            className={`inline `}
            alt={'error'}
            src={'/daaps.svg'}
            onClick={() => {
            }}
          />

          <span className="group ml-auto my-auto text-sm mt-4 ">
            <p className='cursor-pointer font-extralight group-hover:text-[#149adc] text-[white] text-sm' >Send
              <svg className={`inline`} width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className={`group-hover:fill-[#149adc]`} d="M12 15L12.3536 15.3536L12 15.7071L11.6464 15.3536L12 15ZM18.3536 9.35355L12.3536 15.3536L11.6464 14.6464L17.6464 8.64645L18.3536 9.35355ZM11.6464 15.3536L5.64645 9.35355L6.35355 8.64645L12.3536 14.6464L11.6464 15.3536Z" fill="white" />
              </svg>
            </p>
            <span className={`hidden z-50 group-hover:block p-4  bg-[aliceblue] dark:bg-[#100d23] absolute rounded-xl border-t-2 border-[#149adc] `}>

              <span className={`flex m-2 `}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="18" y="15" width="4" height="4" rx="2" transform="rotate(90 18 15)" fill="#149adc" fillOpacity="0.25" stroke="#20cc9e" strokeWidth="1.2" />
                  <rect x="6" y="8" width="4" height="4" rx="2" transform="rotate(-90 6 8)" fill="#149adc" fillOpacity="0.25" stroke="#20cc9e" strokeWidth="1.2" />
                  <path d="M8 8V13C8 14.8856 8 15.8284 8.58579 16.4142C9.17157 17 10.1144 17 12 17H14" stroke="#149adc" strokeWidth="1.2" />
                </svg>

                <p onClick={() => {
                  setScreen("SingleTransaction")
                }} className={`ml-3 cursor-pointer text-[black] text-left dark:text-[white] dark:hover:text-[#149adc] hover:text-[#149adc]`}>
                  Single Transaction
                </p>
              </span>
              <span className={`flex m-2`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="18" y="9" width="4" height="4" rx="2" transform="rotate(90 18 9)" fill="#149adc" fillOpacity="0.25" stroke="#20cc9e" strokeWidth="1.2" />
                  <rect x="18" y="17" width="4" height="4" rx="2" transform="rotate(90 18 17)" fill="#149adc" fillOpacity="0.25" stroke="#20cc9e" strokeWidth="1.2" />
                  <rect x="3" y="7" width="4" height="4" rx="2" transform="rotate(-90 3 7)" fill="#149adc" fillOpacity="0.25" stroke="#20cc9e" strokeWidth="1.2" />
                  <path d="M5 8V15C5 16.8856 5 17.8284 5.58579 18.4142C6.17157 19 7.11438 19 9 19H14" stroke="#149adc" strokeWidth="1.2" />
                  <path d="M5 7V7C5 8.88562 5 9.82843 5.58579 10.4142C6.17157 11 7.11438 11 9 11H14" stroke="#149adc" strokeWidth="1.2" />
                </svg>

                <p className={`ml-3 cursor-pointer text-[black] text-left dark:text-[white] dark:hover:text-[#149adc] hover:text-[#149adc]`}>
                  Multi-Transaction
                </p>
              </span>
              <span className={`flex mt-4 ml-3 `}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 8L3.64645 7.64645L3.29289 8L3.64645 8.35355L4 8ZM19.5 10C19.5 10.2761 19.7239 10.5 20 10.5C20.2761 10.5 20.5 10.2761 20.5 10H19.5ZM7.64645 3.64645L3.64645 7.64645L4.35355 8.35355L8.35355 4.35355L7.64645 3.64645ZM3.64645 8.35355L7.64645 12.3536L8.35355 11.6464L4.35355 7.64645L3.64645 8.35355ZM4 8.5H18V7.5H4V8.5ZM18 8.5C18.8284 8.5 19.5 9.17157 19.5 10H20.5C20.5 8.61929 19.3807 7.5 18 7.5V8.5Z"
                    fill={`#c24bbe`}
                  />
                  <path d="M20 16L20.3536 15.6464L20.7071 16L20.3536 16.3536L20 16ZM5 16L5 16.5L5 16.5L5 16ZM2.5 14C2.5 13.7239 2.72386 13.5 3 13.5C3.27614 13.5 3.5 13.7239 3.5 14L2.5 14ZM16.3536 11.6464L20.3536 15.6464L19.6464 16.3536L15.6464 12.3536L16.3536 11.6464ZM20.3536 16.3536L16.3536 20.3536L15.6464 19.6464L19.6464 15.6464L20.3536 16.3536ZM20 16.5L5 16.5L5 15.5L20 15.5L20 16.5ZM5 16.5C3.61929 16.5 2.5 15.3807 2.5 14L3.5 14C3.5 14.8284 4.17157 15.5 5 15.5L5 16.5Z"
                    fill="#c24bbe" />
                </svg>
                <p onClick={() => {
                  setScreen("ViewTransactions")
                }} className={`ml-2 cursor-pointer text-[black] text-left dark:text-[white] dark:hover:text-[#c24bbe] hover:text-[#c24bbe]`}>
                  View Transactions
                </p>
              </span>
            </span>
          </span>

          <span className="mr-auto my-auto ml-4 text-sm ">
            <p onClick={() => {
              router.push('/code')
            }}
              className='cursor-pointer font-extralight hover:text-[#149adc] text-[white] text-sm' >
              Receive
            </p>
          </span>

        </span>

        <span className={` flex self-center justify-self-end`}>
          {/* Connect Button */}
          <span className={`self-center`}>
            <ConnectButton />
          </span>
          {/* ThemeSwitch */}
          <span className={`m-2`}>
            <label
              className="container"
            // title={"Activate dark mode"}
            // aria-label={"Activate dark mode"}
            >
              <input
                type="checkbox"
                checked={toggle}
                onChange={() => {
                  if ((localStorage.getItem('theme') === 'dark')) {
                    console.log("It's dark.. switiching to light")
                    localStorage.setItem('theme', 'light');
                    document.documentElement.classList.remove('dark')
                    setToogle(true);
                  }
                  else if ((localStorage.getItem('theme') === 'light')) {
                    console.log("It's light.. switiching to dark")
                    localStorage.setItem('theme', 'dark')
                    document.documentElement.classList.add('dark')
                    setToogle(false);
                  }
                  else if ((localStorage.getItem('theme') == undefined)) {
                    console.log("No theme set.. making it dark")
                    localStorage.setItem('theme', 'dark')
                    document.documentElement.classList.add('dark');
                    setToogle(false)
                  }
                }}
              />
              <div />
            </label>
          </span>

        </span>
      </span>

      {!isSSR && screen == "SingleTransaction" &&
        <span className={`fade self-start justify-self-auto sm:justify-self-center 
           col-start-1 col-end-8 row-start-3 row-end-4 sm:mx-4 p-4 mx-4
           grid grid-rows-[40px,min-content,30px,30px,40px,30px,auto,30px,min-content,50px] grid-cols-1
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
            name="teext"
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
                      <span className={`text-[#149adc] text-xs sm:text-sm self-center ml-2 `}>
                        {Number(nativeBalance.data?.formatted).toPrecision(5)}  {token.value}
                      </span>
                    </>
                  }

                  {token && token?.value != connection.chain?.nativeCurrency.symbol &&
                    <>
                      <span className={`text-[#149adc] text-text-xs sm:text-sm self-center ml-2 `}>
                        {Number(tokenBalance.data?.formatted).toPrecision(5)} {token.value}
                      </span>
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
              </div>
            </AccordionDetails>
          </Accordion>

          {isDisconnected &&
            <span className={`justify-self-center self-center`}>
              <ConnectButton />
            </span>
          }
          {!isDisconnected && addressReciever == '' &&
            <button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled >Enter address</button>
          }
          {!isDisconnected && addressReciever != '' && !token &&
            <button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled >Select token</button>
          }
          {!isDisconnected && addressReciever != '' && token && sendAmount.floatValue == undefined &&
            < button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled >Enter Amount</button>
          }
          {!isDisconnected && addressReciever != '' && token && sendAmount.floatValue == 0 &&
            < button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled >Enter Amount</button>
          }

          {!isDisconnected && addressReciever != '' && token && token.value != connection.chain?.nativeCurrency.symbol && Number(sendAmount.value) > Number(tokenBalance.data?.formatted) &&
            < button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled >{`Insufficient ${token.value}`} </button>
          }
          {!isDisconnected && addressReciever != '' && token && token.value == connection.chain?.nativeCurrency.symbol && Number(sendAmount.value) > Number(nativeBalance.data.formatted) &&
            < button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled > {`Insufficient ${token.value}`}</button>
          }

          {!isDisconnected && addressReciever != '' && token && token.value == connection.chain?.nativeCurrency.symbol && Number(nativeBalance.data?.value) != 0 &&
            sendAmount.floatValue != undefined && sendAmount.floatValue != 0 && Number(sendAmount.value) <= Number(nativeBalance.data.formatted) &&
            <button
              disabled={transactionLoading}
              onClick={() => {
                createtx();
              }} className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm `}>

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

          {!isDisconnected && addressReciever != '' && token && token.value != connection.chain?.nativeCurrency.symbol && Number(tokenBalance.data?.value) != 0 &&
            sendAmount.floatValue != undefined && sendAmount.floatValue != 0 && Number(sendAmount.value) <= Number(tokenBalance.data.formatted) &&
            <button disabled={transactionLoading}
              onClick={() => {
                createtx();
              }} className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm `}>
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
      }

      {/* {!isSSR && screen == "ViewTransactions" &&
        <span className={`self-start justify-self-auto sm:justify-self-center 
              col-start-1 col-end-8 row-start-3 row-end-4 sm:mx-4 p-4 mx-4
              grid grid-rows-[30px,auto] grid-cols-[repeat(7,1fr)]
               border-black border-[2px] bg-[aliceblue] dark:bg-[#100d23] rounded-2xl`}>

          <span className={`
          col-start-1 col-end-8 row-start-1 row-end-2
           bg-[#1e1d45]
           grid grid-cols-[repeat(4,1fr)] grid-rows-[30px]
           `}>

            <span className={`font-bold text-xs  dark:text-[#20cc9e] text-[#372963] self-center block m-2`}>
              Address
            </span>
            <span className={`font-bold text-xs dark:text-[#20cc9e] text-[#372963] self-center  m-2 `}>
              Network
            </span>
            <span className={`font-bold text-xs dark:text-[#20cc9e] text-[#372963] self-center  m-2 `}>
              Receiving
            </span>
            <span className={`font-bold text-xs dark:text-[#20cc9e] text-[#372963] self-center  m-2 `}>
              Fee
            </span>

          </span>

          <span className={`
          col-start-1 col-end-8 row-start-2 row-end-3
           bg-[#1e1d45]
           grid grid-cols-[repeat(4,1fr)] grid-rows-[30px]
           `}>
            <span className={`font-bold text-xs  dark:text-[#20cc9e] text-[#372963] self-center block m-2`}>
              {addressReciever}
            </span>
            <span className={`font-bold text-xs dark:text-[#20cc9e] text-[#372963] self-center  m-2 `}>
              {connection.chain?.id == '80001' && "Polygon (Mum)"}
            </span>
            <span className={`font-bold text-xs dark:text-[#20cc9e] text-[#372963] self-center  m-2 `}>
              {receivingAmount}
            </span>
            <span className={`font-bold text-xs dark:text-[#20cc9e] text-[#372963] self-center  m-2 `}>
              {fee}
            </span>

          </span>
        </span>
      } */}



    </div >
  )
}
export default Index;
