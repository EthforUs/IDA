import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";

/*
You can add alchemy provider and configure supported chains.

- To add Alchemy and Add networks :
import { alchemyProvider } from 'wagmi/providers/alchemy';
const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);

! Make sure not to push the Alchemy Key into Github or any source control.
*/

// Imports for Rainbowkit and Wagmi
import { getDefaultWallets, RainbowKitProvider,darkTheme, } from "@rainbow-me/rainbowkit";
import { goerli, configureChains, createClient, WagmiConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider  } from "wagmi/providers/alchemy";

// Setting Chains
const { chains, provider } = configureChains(
  [goerli],
  [
  alchemyProvider({ apiKey: '-xV-BSO0HuaCo7VShwuTD24S_Fxq-0IQ' }),
    publicProvider(),
  ]
);

// Application Configs
const { connectors } = getDefaultWallets({
  appName: "My Amazing App",
  chains,
});

// Wagmi Config
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider theme={darkTheme({
        accentColor: '#7b3fe4',
        accentColorForeground: 'white',
      })}  modalSize="compact"  chains={chains} initialChain={goerli} coolMode  >
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
