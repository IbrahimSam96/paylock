// Local and Library specific css Imports 
import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import 'react-phone-number-input/style.css'
import 'react-toastify/dist/ReactToastify.css';


import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme, midnightTheme, lightTheme
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

// TODO: add chain.mainnet, chain.polygon,
const { chains, provider } = configureChains(
  [
    chain.polygonMumbai, chain.goerli],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_ID }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'PayLock',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
});


function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider showRecentTransactions={true} chains={chains} initialChain={chain.polygonMumbai}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>

  )
};

export default MyApp
