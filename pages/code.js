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
import { useRouter } from 'next/router'
import Head from 'next/head'

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


import { PolygonAddress } from '../polygon';
import { mumbaiAddress } from '../mumbai';
import { EthAddress } from '../eth'
import PayFactory from '../artifacts/contracts/PayFactory.sol/PayLock.json'

const Code = () => {

    const [mumbaiRedeemablePayments, setMumbaiRedeemablePayments] = React.useState([]);
    const [isSSR, setIsSSR] = useState(true);
    const { address, isConnecting, isDisconnected } = useAccount();
    const connection = useNetwork();
    const router = useRouter()
    const [toggle, setToogle] = useState(true);

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
                const contract = new ethers.Contract(mumbaiAddress, PayFactory.abi, provider);
                const data = await contract.getRedeemablePayments(address);
                console.log(data)
                setMumbaiRedeemablePayments(data);
            }

            getMumbaiRedeemablePayments();

        }
    }, [])


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
                        <p className='cursor-pointer font-extralight hover:text-[#149adc] text-[white] text-sm' >
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


            <React.Fragment>
                {!isSSR && !isDisconnected &&
                    <span className={`self-start justify-self-auto sm:justify-self-center 
        col-start-1 col-end-8 row-start-3 row-end-4 sm:mx-4 p-4 mx-4
        grid grid-rows-[30px,auto] grid-cols-[repeat(7,1fr)]
         border-black border-[2px] bg-[aliceblue] dark:bg-[#100d23] rounded-2xl`}>

                        <span className={`
                                 col-start-1 col-end-8 row-start-1 row-end-2
                               bg-[aliceblue] dark:bg-[#1e1d45]
                                 grid grid-cols-[repeat(4,1fr)] grid-rows-[30px]
                          `}>
                            <span className={`font-bold text-xs  dark:text-[#20cc9e] text-[#372963] self-center block m-2`}>
                                Payments
                            </span>
                        </span>

                        <span className={`
                                         col-start-1 col-end-8 row-start-2 row-end-3
                                         bg-[aliceblue] dark:bg-[#1e1d45]
                                        grid grid-cols-[repeat(4,1fr)] grid-rows-[1]`
                        }>
                            {mumbaiRedeemablePayments.map((transaction) => {
                                return (
                                    <Accordion
                                        id={parseInt(transaction.receiverId._hex)}
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
                                            <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Address:</span>


                                            <Avatar className=" ml-2 w-8 h-8 inline self-center" {...config.current} />

                                            <span className={`self-center ml-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>{transaction.issuer.substring(0, 4) + "..." + transaction.issuer.substring(38, 42)}</span>

                                            <span className={`self-center ml-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963] flex`}>
                                                {transaction.tokenAddress == '0x0000000000000000000000000000000000000000' ?
                                                    <React.Fragment>
                                                        <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Network:</span>

                                                        <span className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Polygon (Mumbai)</span>

                                                        <Image
                                                            className={``}
                                                            alt={`${connection.chain.nativeCurrency.symbol} Network`}
                                                            src={`/${connection.chain.nativeCurrency.symbol}.svg`}
                                                            width={20}
                                                            height={20}
                                                        />
                                                    </React.Fragment>
                                                    :
                                                    <React.Fragment>

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
                                                            alt={`${connection.chain.nativeCurrency.symbol} Network`}
                                                            src={`/${connection.chain.nativeCurrency.symbol}.svg`}
                                                            width={20}
                                                            height={20}
                                                        />

                                                        <span className={`self-center ml-2 font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Amount:</span>

                                                        <span className={`blur-sm hover:blur-none self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>
                                                            {Number(transaction.value._hex) / 1e18}
                                                        </span>


                                                        {transaction.state == 0 &&
                                                            <span className={`flex`}>
                                                                <svg className={`inline`} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#6F6EC6" />
                                                                </svg>
                                                                <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}> Active </p>
                                                            </span>
                                                        }
                                                        {transaction.state == 1 &&
                                                            <span className={`flex`}>
                                                                <svg className={`inline animate-pulse `} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#27AE60" />
                                                                </svg>
                                                                <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Withdrawn</p>
                                                            </span>
                                                        }

                                                        {transaction.state == 2 &&
                                                            <span className={`flex`}>
                                                                <svg className={`inline animate-pulse animate-spin`} width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9.25968 4.35211C9.64783 4.35211 10.0222 4.40304 10.3828 4.50489C10.7435 4.604 11.0793 4.74577 11.3904 4.93021C11.7042 5.11464 11.9891 5.33625 12.2451 5.59501C12.5039 5.85103 12.7255 6.13594 12.9099 6.44977C13.0944 6.76084 13.2361 7.09668 13.3352 7.4573C13.4371 7.81792 13.488 8.19231 13.488 8.58045C13.488 8.9686 13.4371 9.34299 13.3352 9.70361C13.2361 10.0642 13.0944 10.4014 12.9099 10.7153C12.7255 11.0263 12.5039 11.3113 12.2451 11.57C11.9891 11.826 11.7042 12.0463 11.3904 12.2307C11.0793 12.4151 10.7435 12.5583 10.3828 12.6601C10.0222 12.7592 9.64783 12.8088 9.25968 12.8088C8.87153 12.8088 8.49715 12.7592 8.13653 12.6601C7.77591 12.5583 7.43869 12.4151 7.12487 12.2307C6.8138 12.0463 6.52888 11.826 6.27011 11.57C6.0141 11.3113 5.79387 11.0263 5.60944 10.7153C5.425 10.4014 5.28185 10.0642 5.17999 9.70361C5.08089 9.34299 5.03134 8.9686 5.03134 8.58045C5.03134 8.19231 5.08089 7.81792 5.17999 7.4573C5.28185 7.09668 5.425 6.76084 5.60944 6.44977C5.79387 6.13594 6.0141 5.85103 6.27011 5.59501C6.52888 5.33625 6.8138 5.11464 7.12487 4.93021C7.43869 4.74577 7.77591 4.604 8.13653 4.50489C8.49715 4.40304 8.87153 4.35211 9.25968 4.35211Z" fill="#E51400" />
                                                                </svg>
                                                                <p className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>Received</p>
                                                            </span>
                                                        }


                                                        <span className={`self-center ml-2 mr-2 font-bold text-xs dark:text-[#20cc9e] text-[#372963]`}>{ }</span>
                                                    </React.Fragment>
                                                    :
                                                    <React.Fragment>
                                                    </React.Fragment>
                                                }
                                            </span>
                                            {transaction.state == 0 &&
                                                <React.Fragment>

                                                    <span className={`self-center m-4 flex`}>
                                                        <span className={`self-center font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Enter 4 digit Code:</span>
                                                        <NumericFormat
                                                            disabled={isDisconnected}
                                                            className={`focus:outline-none font-extralight text-xs rounded ml-2 `}
                                                            allowNegative={false}

                                                            onValueChange={
                                                                debounce((values) => {

                                                                    if (values.floatValue != 0 && values.floatValue) {
                                                                        // only if VALUE IS NOT 0 AND !undefined
                                                                        // Sets Receiving Amount and Fee and calculates usdValue 

                                                                    }

                                                                }, 500)

                                                            }
                                                        />
                                                    </span>

                                                    <button className={`w-full p-2 self-center  bg-[#1e1d45] dark:bg-[#100d23] text-[#c24bbe] text-sm `}>
                                                        Withdraw Payment
                                                    </button>
                                                </React.Fragment>

                                            }

                                        </AccordionDetails>
                                    </Accordion>
                                )
                            })}

                        </span>
                    </span>
                }
            </React.Fragment>

        </div >
    )
}
export default Code;