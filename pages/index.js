import Head from 'next/head'

import {
  ConnectButton
} from '@rainbow-me/rainbowkit';
import { useConnect, useNetwork, useBalance, useAccount, chain } from 'wagmi';
import { ethers, providers } from 'ethers';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Image from 'next/image';

import { NumericFormat } from 'react-number-format';
import Avatar, { genConfig } from 'react-nice-avatar'
import Select from 'react-select'
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


// Background #131341
// Component #100d23
// Button #1e1d45
// Light green #20cc9e 
// Light purple #376293  
// Light blue #149adc
//  Light pink #c24bbe

const Index = () => {
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

  const [addressReciever, setAddressReciever] = useState('');
  const [addressError, setAddressError] = useState(false);
  const [token, setToken] = useState(undefined);
  const [sendAmount, setSendAmount] = useState({
    floatValue: undefined,
    formattedValue: "",
    value: ""
  });

  // wagmi hooks
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
        { value: 'DAI', label: 'DAI', svg: 'DAI', address: "0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F" },
        { value: 'USDT', label: 'USDT', svg: 'USDT', address: "0xe583769738b6dd4E7CAF8451050d1948BE717679" },
        { value: 'USDC', label: 'USDC', svg: 'USDC', address: "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747" },
        { value: 'WBTC', label: 'WBTC', svg: 'WBTC', address: "0x0d787a4a1548f673ed375445535a6c7A1EE56180" },
      ];
    }
  }, [connection.chain]);

  // global window check 
  useEffect(() => {
    setIsSSR(false);
  }, []);

  // Refresh token value when connection changes
  useEffect(() => {
    if (tokenOptions) {
      setToken(tokenOptions[0])
    }
  }, [connection.chain, tokenOptions]);

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
              setToken(tokenOptions[0])
            }}
          />

          <span className="group ml-auto my-auto text-sm mt-4 ">
            <p className='cursor-pointer font-extralight group-hover:text-[#149adc] text-[white] text-sm' >Send
              <svg className={`inline`} width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className={`group-hover:fill-[#149adc]`} d="M12 15L12.3536 15.3536L12 15.7071L11.6464 15.3536L12 15ZM18.3536 9.35355L12.3536 15.3536L11.6464 14.6464L17.6464 8.64645L18.3536 9.35355ZM11.6464 15.3536L5.64645 9.35355L6.35355 8.64645L12.3536 14.6464L11.6464 15.3536Z" fill="white" />
              </svg>
            </p>
            <span className={`hidden z-50 group-hover:block p-4  bg-[aliceblue] dark:bg-[#100d23] absolute rounded-xl border-t-2 border-[#149adc] `}>
              <p className={`cursor-pointer text-[black] text-left dark:text-[#149adc] hover:text-[#149adc]`}>
                Single Payment
              </p>
            </span>
          </span>

          <span className="mr-auto my-auto ml-4 text-sm ">
            <p className='cursor-pointer font-extralight hover:text-[#149adc] text-[white] text-sm' > Receive
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

      {!isSSR &&
        <React.Fragment>
          <span className={` self-center justify-self-auto sm:justify-self-center xl:justify-self-auto xl:col-start-3 xl:col-end-6 xl:max-w-[500px] 
          col-start-1 col-end-8 row-start-3 row-end-4 sm:mx-4 p-4 mx-4
           grid grid-rows-[40px,min-content,30px,30px,40px,30px,30px,min-content,50px] grid-cols-1
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
            <span className={`text-[#20cc9e] text-sm self-center `}>Receiver Address  </span>


            <Select
              options={tokenOptions}
              value={token}
              isDisabled={isDisconnected}
              className={`self-center ${isDisconnected && `opacity-50`}  `}
              onChange={(change) => {
                console.log(change)
                setToken(change);
              }}

              formatOptionLabel={tokenOption => (
                <div className={`flex self-center `}>
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
                          {Number(nativeBalance.data?.formatted).toFixed(4)}  {token.value}
                        </span>
                        {sendAmount.value != Number(nativeBalance.data?.formatted).toFixed(4) && Number(nativeBalance.data?.formatted) > 0 &&
                          <span className={`text-[#20cc9e] text-xs sm:text-sm self-center ml-4 rounded-xl px-2 bg-[#1e1d45] hover:opacity-90  cursor-pointer `}
                            onClick={() => {
                              setSendAmount((PreviousAmount) => ({ ...PreviousAmount, value: Number(nativeBalance.data?.formatted).toFixed(4) }))
                            }}
                          > max </span>
                        }
                      </>
                    }

                    {token && token?.value != connection.chain?.nativeCurrency.symbol &&
                      <>
                        <span className={`text-[#149adc] text-text-xs sm:text-sm self-center ml-2 `}>
                          {Number(tokenBalance.data?.formatted).toFixed(4)} {token.value}
                        </span>
                        {sendAmount.value != Number(tokenBalance.data?.formatted).toFixed(4) &&
                          <span className={`text-[#20cc9e] text-xs sm:text-sm self-center ml-4 rounded-xl px-2 bg-[#1e1d45] hover:opacity-90  cursor-pointer `}
                            onClick={() => {
                              setSendAmount((PreviousAmount) => ({ ...PreviousAmount, value: Number(tokenBalance.data?.formatted).toFixed(4) }))
                            }}
                          > max </span>
                        }
                      </>

                    }

                  </>
                }
              </span>
            </span>

            <NumericFormat
              disabled={isDisconnected || !token}
              className={`focus:outline-none font-extralight text-xs rounded `}
              allowNegative={false}
              value={sendAmount.value}
              thousandSeparator
              suffix={token?.value}
              onValueChange={(values) => {
                console.log(values);
                setSendAmount(values);
              }}
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
                      Amount:
                    </span>
                    <span className={`font-extralight text-xs text-[#c24bbe] self-center block m-2 `}>
                      {sendAmount.formattedValue}
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
                      Single Payment
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

            {!isDisconnected && addressReciever != '' && token && token.value != connection.chain?.nativeCurrency.symbol && Number(sendAmount.value) > Number(tokenBalance.data?.value) &&
              < button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled >{`Insufficient ${token.value}`} </button>
            }
            {!isDisconnected && addressReciever != '' && token && token.value == connection.chain?.nativeCurrency.symbol && Number(sendAmount.value) > Number(nativeBalance.data?.value) &&
              < button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm opacity-60`} disabled > {`Insufficient ${token.value}`}</button>
            }

            {!isDisconnected && addressReciever != '' && token && token.value == connection.chain?.nativeCurrency.symbol && Number(nativeBalance.data?.value) != 0 &&
              sendAmount.floatValue != undefined && sendAmount.floatValue != 0 && Number(sendAmount.value) <= Number(nativeBalance.data?.value) &&

              <button className={`p-2 self-center bg-[#1e1d45] text-[#c24bbe] text-sm `}>
                Send
              </button>
            }
          </span>
        </React.Fragment>

      }


    </div >
  )
}
export default Index;
