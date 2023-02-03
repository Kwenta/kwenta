import { createTheme, MuiThemeProvider } from '@material-ui/core';
import { darkTheme, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import * as Sentry from '@sentry/browser';
import { BrowserTracing } from '@sentry/tracing';
import { NetworkId } from '@synthetixio/contracts-interface';
import { createQueryContext, SynthetixQueryContextProvider } from '@synthetixio/queries';
import { NextPage } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC, ReactElement, ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { WagmiConfig } from 'wagmi';

import ErrorNotifier from 'components/ErrorView/ErrorNotifier';
import Connector from 'containers/Connector';
import { chains, wagmiClient, chain } from 'containers/Connector/config';
import useMonitorTransactions from 'hooks/useMonitorTransactions';
import AcknowledgementModal from 'sections/app/AcknowledgementModal';
import Layout from 'sections/shared/Layout';
import SystemStatus from 'sections/shared/SystemStatus';
import { useAppData } from 'state/app/hooks';
import { useAppSelector } from 'state/hooks';
import { selectCurrentTheme } from 'state/preferences/selectors';
import store from 'state/store';
import { MediaContextProvider } from 'styles/media';
import { themes } from 'styles/theme';
import { IGNORE_ERRORS } from 'utils/logError';
import { getDesignTokens } from 'utils/theme';

import 'styles/main.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@reach/dialog/styles.css';
import '@rainbow-me/rainbowkit/styles.css';
import '../i18n';

type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

process.env.GIT_HASH_ID!.toString();
Sentry.init({
	dsn:
		'https://d48644bc80d04977a26132b346417210@o4504363236851712.ingest.sentry.io/4504363261362177',
	maxBreadcrumbs: 50,
	debug: process.env.NODE_ENV !== 'production',
	enabled: process.env.NODE_ENV === 'production',
	release: 'kwenta@' + process.env.GIT_HASH_ID!.toString(),
	autoSessionTracking: true,
	integrations: [new BrowserTracing()],
	tracesSampleRate: 0.3,
	ignoreErrors: IGNORE_ERRORS,
});

const InnerApp: FC<AppProps> = ({ Component, pageProps }: AppPropsWithLayout) => {
	const {
		signer,
		provider,
		l2Provider,
		network,
		providerReady,
		defaultSynthetixjs: synthetixjs,
	} = Connector.useContainer();

	useAppData(providerReady);
	useMonitorTransactions();

	const getLayout = Component.getLayout || ((page) => page);
	const currentTheme = useAppSelector(selectCurrentTheme);

	const isReady = useMemo(() => typeof window !== 'undefined', []);
	const theme = useMemo(() => themes[currentTheme], [currentTheme]);
	// @ts-ignore palette options
	const muiTheme = useMemo(() => createTheme(getDesignTokens(currentTheme)), [currentTheme]);

	return isReady ? (
		<RainbowKitProvider
			chains={chains}
			theme={currentTheme === 'dark' ? darkTheme() : lightTheme()}
		>
			<ThemeProvider theme={theme}>
				<MuiThemeProvider theme={muiTheme}>
					<MediaContextProvider>
						<SynthetixQueryContextProvider
							value={
								provider && network && synthetixjs
									? createQueryContext({
											provider,
											signer: signer || undefined,
											networkId: network.id as NetworkId,
											synthetixjs,
									  })
									: createQueryContext({
											provider: l2Provider,
											networkId: chain.optimism.id as NetworkId,
											synthetixjs,
									  })
							}
						>
							<Layout>
								<AcknowledgementModal />
								<SystemStatus>{getLayout(<Component {...pageProps} />)}</SystemStatus>
							</Layout>
							<ErrorNotifier />
							<ReactQueryDevtools position="top-left" />
						</SynthetixQueryContextProvider>
					</MediaContextProvider>
				</MuiThemeProvider>
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
				<meta property="og:url" content="https://kwenta.eth.limo/" />
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
				<meta name="twitter:image" content="https://kwenta.eth.limo/images/kwenta-twitter.jpg" />
				<meta name="twitter:url" content="https://kwenta.eth.limo" />
				<link rel="icon" href="/images/favicon.svg" />
			</Head>
			<Provider store={store}>
				<QueryClientProvider client={new QueryClient()}>
					<WagmiConfig client={wagmiClient}>
						<Connector.Provider>
							<InnerApp {...props} />
						</Connector.Provider>
					</WagmiConfig>
				</QueryClientProvider>
			</Provider>
		</>
	);
};

export default App;
