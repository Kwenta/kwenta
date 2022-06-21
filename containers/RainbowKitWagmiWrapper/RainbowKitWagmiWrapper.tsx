import '@rainbow-me/rainbowkit/styles.css';
import '@rainbow-me/rainbowkit/styles.css';
import { FC } from 'react';
import {
	RainbowKitProvider,
	getDefaultWallets,
	connectorsForWallets,
	wallet,
	lightTheme,
	darkTheme,
} from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
// import { InjectedConnector } from 'wagmi/connectors/injected';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

// import {
// 	getDefaultWallets,
// 	RainbowKitProvider,
// 	lightTheme,
// 	darkTheme,
// 	Theme,
// 	connectorsForWallets,
// 	wallet,
// } from '@rainbow-me/rainbowkit';

// import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
// import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
// import { infuraProvider } from 'wagmi/providers/infura';
// import { publicProvider } from 'wagmi/providers/public';

type WithRainbowKitWagmiWrapperProps = {
	children: React.ReactNode;
};

const RainbowKitWagmiWrapper: FC<WithRainbowKitWagmiWrapperProps> = ({ children }) => {
	// TODO handle light and dark theme
	// theme={darkTheme({
	//   accentColor: '#7b3fe4',
	//   accentColorForeground: 'white',
	//   borderRadius: 'small',
	//   fontStack: 'system',
	// })}

	// const myCustomTheme: Theme = {
	//   colors: {
	//     accentColor: '...',
	//     accentColorForeground: '...',
	//     actionButtonBorder: '...',
	//     actionButtonBorderMobile: '...',
	//     actionButtonSecondaryBackground: '...',
	//     closeButton: '...',
	//     closeButtonBackground: '...',
	//     connectButtonBackground: '...',
	//     connectButtonBackgroundError: '...',
	//     connectButtonInnerBackground: '...',
	//     connectButtonText: '...',
	//     connectButtonTextError: '...',
	//     connectionIndicator: '...',
	//     error: '...',
	//     generalBorder: '...',
	//     generalBorderDim: '...',
	//     menuItemBackground: '...',
	//     modalBackdrop: '...',
	//     modalBackground: '...',
	//     modalBorder: '...',
	//     modalText: '...',
	//     modalTextDim: '...',
	//     modalTextSecondary: '...',
	//     profileAction: '...',
	//     profileActionHover: '...',
	//     profileForeground: '...',
	//     selectedOptionBorder: '...',
	//     standby: '...',
	//   },
	//   fonts: {
	//     body: '...',
	//   },
	//   radii: {
	//     actionButton: '...',
	//     connectButton: '...',
	//     menuButton: '...',
	//     modal: '...',
	//     modalMobile: '...',
	//   },
	//   shadows: {
	//     connectButton: '...',
	//     dialog: '...',
	//     profileDetailsAction: '...',
	//     selectedOption: '...',
	//     selectedWallet: '...',
	//     walletLogo: '...',
	//   },
	// };

	// console.log(wagmiClient)
	// Client {
	//   config: {
	//     autoConnect: false,
	//     connectors: [Function (anonymous)],
	//     provider: [Function: provider],
	//     storage: {
	//       getItem: [Function: getItem],
	//       setItem: [Function: setItem],
	//       removeItem: [Function: removeItem]
	//     },
	//     webSocketProvider: [Function: webSocketProvider]
	//   },
	//   storage: {
	//     getItem: [Function: getItem],
	//     setItem: [Function: setItem],
	//     removeItem: [Function: removeItem]
	//   },
	//   store: {
	//     setState: [Function (anonymous)],
	//     getState: [Function: getState],
	//     subscribe: [Function (anonymous)],
	//     destroy: [Function: destroy],
	//     persist: {
	//       setOptions: [Function: setOptions],
	//       clearStorage: [Function: clearStorage],
	//       rehydrate: [Function: rehydrate],
	//       hasHydrated: [Function: hasHydrated],
	//       onHydrate: [Function: onHydrate],
	//       onFinishHydration: [Function: onFinishHydration]
	//     }
	//   },
	//   queryClient: QueryClient {
	//     queryCache: QueryCache {
	//       listeners: [],
	//       subscribe: [Function: bound subscribe],
	//       config: {},
	//       queries: [],
	//       queriesMap: {}
	//     },
	//     mutationCache: MutationCache {
	//       listeners: [],
	//       subscribe: [Function: bound subscribe],
	//       config: {},
	//       mutations: [],
	//       mutationId: 0
	//     },
	//     logger: Object [console] {
	//       log: [Function: log],
	//       warn: [Function: warn],
	//       dir: [Function: dir],
	//       time: [Function: time],
	//       timeEnd: [Function: timeEnd],
	//       timeLog: [Function: timeLog],
	//       trace: [Function: trace],
	//       assert: [Function: assert],
	//       clear: [Function: clear],
	//       count: [Function: count],
	//       countReset: [Function: countReset],
	//       group: [Function: group],
	//       groupEnd: [Function: groupEnd],
	//       table: [Function: table],
	//       debug: [Function: debug],
	//       info: [Function: info],
	//       dirxml: [Function: dirxml],
	//       error: [Function: error],
	//       groupCollapsed: [Function: groupCollapsed],
	//       Console: [Function: Console],
	//       profile: [Function: profile],
	//       profileEnd: [Function: profileEnd],
	//       timeStamp: [Function: timeStamp],
	//       context: [Function: context]
	//     },
	//     defaultOptions: { queries: [Object], mutations: [Object] },
	//     queryDefaults: [],
	//     mutationDefaults: []
	//   }
	// }

	const { chains, provider, webSocketProvider } = configureChains(
		[chain.optimism, chain.optimismKovan, chain.mainnet, chain.rinkeby],
		[infuraProvider({ infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID })]
	);

	const { wallets } = getDefaultWallets({
		appName: 'RainbowKit demo',
		chains,
	});

	const connectors = connectorsForWallets([...wallets]);

	const wagmiClient = createClient({
		autoConnect: false,
		connectors,
		provider,
		webSocketProvider,
	});

	return (
		<WagmiConfig client={wagmiClient}>
			<RainbowKitProvider
				chains={chains}
				appInfo={{
					appName: 'Kwenta',
					learnMoreUrl: 'https://kwenta.io/',
				}}
				theme={{
					lightMode: lightTheme(),
					darkMode: darkTheme(),
				}}
			>
				{children}
			</RainbowKitProvider>
		</WagmiConfig>
	);
};

export default RainbowKitWagmiWrapper;
