import { FC } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { RecoilRoot } from 'recoil';
import { useTranslation } from 'react-i18next';
import { QueryClientProvider, QueryClient } from 'react-query';

import { ThemeProvider } from 'styled-components';
import { MediaContextProvider } from 'styles/media';

import WithAppContainers from 'containers';
import theme from 'styles/theme';

import { ReactQueryDevtools } from 'react-query/devtools';

import SystemStatus from 'sections/shared/SystemStatus';

import 'styles/main.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@reach/dialog/styles.css';
import '@reach/tabs/styles.css';
import '@reach/accordion/styles.css';
import '@reach/slider/styles.css';
import 'tippy.js/dist/tippy.css';

import '../i18n';

import Layout from 'sections/shared/Layout';
import { createQueryContext, SynthetixQueryContextProvider } from '@synthetixio/queries';
import Connector from 'containers/Connector';

const InnerApp: FC<AppProps> = ({ Component, pageProps }) => {
	const { provider, network } = Connector.useContainer();

	return (
		<>
			<MediaContextProvider>
				<SynthetixQueryContextProvider
					value={
						provider && network
							? createQueryContext({
									provider: provider,
									networkId: network!.id,
							  })
							: createQueryContext({ networkId: null })
					}
				>
					<Layout>
						<SystemStatus>
							<Component {...pageProps} />
						</SystemStatus>
					</Layout>
					<ReactQueryDevtools />
				</SynthetixQueryContextProvider>
			</MediaContextProvider>
		</>
	);
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
				<meta name="twitter:image" content="/images/kwenta-twitter.jpg" />
				<meta name="twitter:url" content="https://kwenta.io" />
				<link rel="icon" href="/images/favicon.svg" />
			</Head>
			<ThemeProvider theme={theme}>
				<RecoilRoot>
					<QueryClientProvider client={new QueryClient()}>
						<WithAppContainers>
							<InnerApp {...props} />
						</WithAppContainers>
					</QueryClientProvider>
				</RecoilRoot>
			</ThemeProvider>
		</>
	);
};

export default App;
