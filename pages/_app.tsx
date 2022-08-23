import {
	darkTheme,
	lightTheme,
	RainbowKitProvider,
	wallet,
	connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import { NetworkId } from '@synthetixio/contracts-interface';
import { createQueryContext, SynthetixQueryContextProvider } from '@synthetixio/queries';
import WithAppContainers from 'containers';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC, ReactElement, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { ThemeProvider } from 'styled-components';
import {
	chain,
	configureChains,
	createClient,
	useNetwork,
	useProvider,
	useSigner,
	WagmiConfig,
} from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import Safe from 'components/Rainbowkit/Gnosis';
import { BLAST_NETWORK_LOOKUP } from 'constants/network';
import Connector from 'containers/Connector';
import Layout from 'sections/shared/Layout';
import SystemStatus from 'sections/shared/SystemStatus';
import { currentThemeState } from 'store/ui';
import { MediaContextProvider } from 'styles/media';
import { themes } from 'styles/theme';
import { isSupportedNetworkId } from 'utils/network';
import 'styles/main.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@reach/dialog/styles.css';
import 'tippy.js/dist/tippy.css';
import '@rainbow-me/rainbowkit/styles.css';

import '../i18n';

type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

const { chains, provider } = configureChains(
	[chain.mainnet, chain.optimism, chain.goerli, chain.kovan, chain.optimismKovan],
	[
		jsonRpcProvider({
			rpc: (chain) => ({
				http: `https://${BLAST_NETWORK_LOOKUP[chain.id]}.blastapi.io/${
					process.env.NEXT_PUBLIC_BLASTAPI_PROJECT_ID
				}`,
				webSocket: `wss://${BLAST_NETWORK_LOOKUP[chain.id]}.blastapi.io/${
					process.env.NEXT_PUBLIC_BLASTAPI_PROJECT_ID
				}`,
			}),
			priority: 0,
		}),
		infuraProvider({
			infuraId: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID,
			priority: 1,
		}),
		publicProvider({ stallTimeout: 1000, priority: 5 }),
	]
);

const connectors = connectorsForWallets([
	{
		groupName: 'Popular',
		wallets: [
			wallet.metaMask({ chains }),
			wallet.rainbow({ chains }),
			wallet.coinbase({ appName: 'Kwenta', chains }),
			wallet.walletConnect({ chains }),
		],
	},
	{
		groupName: 'More',
		wallets: [
			Safe({ chains }),
			wallet.ledger({ chains }),
			wallet.brave({ chains, shimDisconnect: true }),
			wallet.trust({ chains }),
		],
	},
]);

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
});

const InnerApp: FC<AppProps> = ({ Component, pageProps }: AppPropsWithLayout) => {
	const { synthetixjs } = Connector.useContainer();
	const provider = useProvider();
	const { data: newSigner } = useSigner();
	const { chain: activeChain } = useNetwork();
	const network = activeChain || undefined;
	const getLayout = Component.getLayout || ((page) => page);

	const isReady = useMemo(() => typeof window !== 'undefined', []);
	const currentTheme = useRecoilValue(currentThemeState);
	const theme = useMemo(() => themes[currentTheme], [currentTheme]);

	return isReady ? (
		<RainbowKitProvider
			chains={chains}
			theme={currentTheme === 'dark' ? darkTheme() : lightTheme()}
			initialChain={chain.optimism}
		>
			<ThemeProvider theme={theme}>
				<MediaContextProvider>
					<SynthetixQueryContextProvider
						value={
							provider && isSupportedNetworkId(network?.id as NetworkId) && synthetixjs
								? createQueryContext({
										provider,
										signer: newSigner || undefined,
										networkId: network!.id as NetworkId,
										synthetixjs,
								  })
								: createQueryContext({ networkId: null, synthetixjs: null })
						}
					>
						<Layout>
							<SystemStatus>{getLayout(<Component {...pageProps} />)}</SystemStatus>
						</Layout>
						<ReactQueryDevtools position="top-left" />
					</SynthetixQueryContextProvider>
				</MediaContextProvider>
			</ThemeProvider>
		</RainbowKitProvider>
	) : null;
};

const App: FC<AppProps> = (props) => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="description" content={t('meta.description')} />
				{/* open graph */}
				<meta property="og:url" content="https://kwenta.io/" />
				<meta property="og:type" content="website" />
				<meta property="og:title" content={t('meta.og.title')} />
				<meta property="og:description" content={t('meta.description')} />
				<meta property="og:image" content="/images/kwenta-facebook.jpg" />
				<meta property="og:image:alt" content={t('meta.og.title')} />
				<meta property="og:site_name" content={t('meta.og.site-name')} />
				{/* twitter */}
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@kwenta_io" />
				<meta name="twitter:creator" content="@kwenta_io" />
				<meta name="twitter:image" content="https://kwenta.io/images/kwenta-twitter.jpg" />
				<meta name="twitter:url" content="https://kwenta.io" />
				<link rel="icon" href="/images/favicon.svg" />
			</Head>
			<RecoilRoot>
				<QueryClientProvider client={new QueryClient()}>
					<WagmiConfig client={wagmiClient}>
						<WithAppContainers>
							<InnerApp {...props} />
						</WithAppContainers>
					</WagmiConfig>
				</QueryClientProvider>
			</RecoilRoot>
		</>
	);
};

export default App;
