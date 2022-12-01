// Nextjs and React
import Image from "next/image"
import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
// UI 
import { ToastContainer } from "react-toastify"
// WEB3
import { useAccount, useNetwork } from 'wagmi';
import { ethers } from 'ethers';
import { ConnectButton } from "@rainbow-me/rainbowkit"
// Contract ABI and Addreses
import PaylockAddressMumbai from '../../mumbai.json';
import PaylockAddressGoerli from "../../goerli.json"
import PayFactory from '../../artifacts/contracts/PayFactory.sol/PayLock.json'

const Navigation = ({ }) => {
    // Hooks
    const { address, isDisconnected, isConnected } = useAccount();
    const connection = useNetwork();

    // Nextjs navigation
    const router = useRouter()
    // Theme Switch
    const [toggle, setToogle] = useState(true);
    const [theme, setTheme] = useState("")

    // Available transactions
    const [mumbaiRedeemablePayments, setMumbaiRedeemablePayments] = React.useState([]);
    const [goerliRedeemablePayments, setGoerliRedeemablePayments] = React.useState([]);

    const [txCount, settxCount] = useState(0);
    const [txCountMumbai, settxCountMumbai] = useState(0);

    // Ensure TxCount is reset
    useEffect(() => {
        settxCount(0)
        settxCountMumbai(0)
    }, [connection.chain])

    useEffect(() => {
        if ((localStorage.getItem('theme') === 'dark')) {
            setTheme("dark")
            console.log("It's dark..");
            document.documentElement.classList.add('dark');
            setToogle(false);
        }
        else if ((localStorage.getItem('theme') === 'light')) {
            console.log("It's light..");
            document.documentElement.classList.remove('dark');
            setToogle(true);
            setTheme("light")

        }
        else if ((localStorage.getItem('theme') == undefined)) {
            console.log("No theme set.. making it dark");
        }
    }, [toggle])

    // Gets all redeemable payments on all chains
    useEffect(() => {

        if (!isDisconnected) {
            // gets PolygonMumbai Payments  
            const getMumbaiRedeemablePayments = async () => {
                const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`);
                const contract = new ethers.Contract(PaylockAddressMumbai.PaylockAddress, PayFactory.abi, provider);
                const data = await contract.getRedeemablePayments(address);
                setMumbaiRedeemablePayments(data);

                if (data.length > 0) {
                    let count = 0;
                    data.map((tx) => {
                        if (tx.state == 0) {
                            count++
                        }
                    })
                    // settxCount((prevCount) => {
                    //     console.log("Mumbai PrevTx's:", prevCount)
                    //     prevCount + count
                    // })
                    settxCountMumbai(count)
                }
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
            contract.on('PaymentIssued', () => {
                getMumbaiRedeemablePayments();
                contract.removeListener('PaymentIssued');
            })
            contract.on('PaymentWithdrawn', () => {
                getMumbaiRedeemablePayments();
                contract.removeListener('PaymentWithdrawn');
            })
            // <<<<<<<<<<>>>>>>>>>>>>>> REST OF CHAINS <<<<<<<<<<>>>>>>>>>>>>>>
            // gets Goerli Payments  
            const getGoerliRedeemablePayments = async () => {
                const provider = new ethers.providers.JsonRpcProvider(`https://eth-goerli.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID_GOERLI}`);
                const contract = new ethers.Contract(PaylockAddressGoerli.PaylockAddress, PayFactory.abi, provider);
                const data = await contract.getRedeemablePayments(address);
                console.log(data)
                if (data.length > 0) {
                    let count = 0;
                    data.map((tx) => {
                        if (tx.state == 0) {
                            count++
                        }
                    })
                    // settxCount((prevCount) => {
                    //     console.log("Goerli PrevTx's:", prevCount)
                    //     prevCount + count
                    // })
                    settxCount(count)
                }
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

            contractGoerli.on('PaymentIssued', () => {
                getGoerliRedeemablePayments();
                contract.removeListener('PaymentIssued');
            })
            contractGoerli.on('PaymentWithdrawn', () => {
                getGoerliRedeemablePayments();
                contract.removeListener('PaymentWithdrawn');
            })
        }

    }, [])

    return (
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
                <ToastContainer theme={theme} />
                <span className="group ml-auto my-auto text-sm mt-5 ">
                    <p className='cursor-pointer font-bold group-hover:text-[#149adc] text-[#149adc] dark:text-[white] text-sm' >Send
                        <svg className={`inline`} width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path className={`group-hover:fill-[#149adc] dark:fill-[white] fill-[#149adc]`} d="M12 15L12.3536 15.3536L12 15.7071L11.6464 15.3536L12 15ZM18.3536 9.35355L12.3536 15.3536L11.6464 14.6464L17.6464 8.64645L18.3536 9.35355ZM11.6464 15.3536L5.64645 9.35355L6.35355 8.64645L12.3536 14.6464L11.6464 15.3536Z" fill="white" />
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
                                router.push('/')

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
                                router.push('/transactions')
                            }} className={`ml-2 cursor-pointer text-[black] text-left dark:text-[white] dark:hover:text-[#c24bbe] hover:text-[#c24bbe]`}>
                                View Transactions
                            </p>
                        </span>
                    </span>
                </span>

                <span onClick={() => {
                    router.push('/code')
                }}
                    className="flex mr-auto mt-[15px] ml-4 text-sm cursor-pointer ">
                    <p className='m-auto font-bold hover:text-[#149adc] text-[#149adc] dark:text-[white] text-sm'
                    >
                        Receive
                    </p>
                    <p className={`${txCount !== 0 && `bg-[#F22F46] rounded-full border-gray-50 border-[1px]`} px-3 ml-2 my-2 font-bold inline text-white  `}>
                        {isConnected && txCount !== 0 && txCount + txCountMumbai}
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

    )
}

export default Navigation;