// Local and Library css Imports 
import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import 'semantic-ui-css/semantic.min.css'

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


const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.polygonMumbai],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
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
      <RainbowKitProvider showRecentTransactions={true} chains={chains} initialChain={chain.mainnet}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>

  )
};

export default MyApp
