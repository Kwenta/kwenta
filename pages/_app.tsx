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

import '../i18n';

type NextPageWithLayout = NextPage & {
	getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
	Component: NextPageWithLayout;
};

const InnerApp: FC<AppProps> = ({ Component, pageProps }: AppPropsWithLayout) => {
	const {
		provider,
		signer,
		network,
		synthetixjs,
		staticMainnetProvider,
	} = Connector.useContainer();
	const getLayout = Component.getLayout || ((page) => page);

	const currentTheme = useRecoilValue(currentThemeState);
	const theme = useMemo(() => themes[currentTheme], [currentTheme]);
	const isReady = useMemo(() => typeof window !== 'undefined', []);

	return isReady ? (
		<ThemeProvider theme={theme}>
			<MediaContextProvider>
				<SynthetixQueryContextProvider
					value={
						provider && isSupportedNetworkId(network.id) && synthetixjs
							? createQueryContext({
									provider,
									signer: signer || undefined,
									networkId: network.id,
									synthetixjs,
							  })
							: createQueryContext({
									networkId: null,
									synthetixjs: null,
									provider: staticMainnetProvider,
							  })
					}
				>
					<Layout>
						<SystemStatus>{getLayout(<Component {...pageProps} />)}</SystemStatus>
					</Layout>
					<ReactQueryDevtools position="top-left" />
				</SynthetixQueryContextProvider>
			</MediaContextProvider>
		</ThemeProvider>
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
					<WithAppContainers>
						<InnerApp {...props} />
					</WithAppContainers>
				</QueryClientProvider>
			</RecoilRoot>
		</>
	);
};

export default App;
