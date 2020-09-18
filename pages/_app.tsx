import { FC } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { RecoilRoot } from 'recoil';

import { ThemeProvider } from 'styled-components';
import { MediaContextProvider } from 'styles/media';

import WithStateContainers from 'containers';
import theme from 'styles/theme';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@reach/dialog/styles.css';
import 'tippy.js/dist/tippy.css';

import '../i18n';

import Layout from 'sections/shared/Layout';

const App: FC<AppProps> = ({ Component, pageProps }) => {
	return (
		<>
			<Head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
				/>
				<meta name="description" content="Kwenta description" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@kwenta_io" />
				<meta name="twitter:creator" content="@kwenta_io" />
				{/* open graph */}
				<meta property="og:url" content="https://kwenta.io/" />
				<meta property="og:type" content="website" />
				<meta property="og:title" content="Kwenta" />
				<meta property="og:description" content="Kwenta description" />
				<meta property="og:image" content="/images/kwenta.png" />
				<meta property="og:image:alt" content="Kwenta" />
				<meta property="og:site_name" content="Kwenta" />
				{/* twitter */}
				<meta name="twitter:image" content="/images/kwenta.png" />
				<meta name="twitter:url" content="https://kwenta.io" />
				<link rel="icon" href="/images/favicon.svg" />
			</Head>
			<ThemeProvider theme={theme}>
				<RecoilRoot>
					<WithStateContainers>
						<MediaContextProvider>
							<Layout>
								<Component {...pageProps} />
							</Layout>
						</MediaContextProvider>
					</WithStateContainers>
				</RecoilRoot>
			</ThemeProvider>
		</>
	);
};

export default App;
