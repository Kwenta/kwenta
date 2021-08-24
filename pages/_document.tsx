import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { mediaStyles } from 'styles/media';

export default class MyDocument extends Document {
	static async getInitialProps(ctx: any) {
		const styledComponentsSheet = new ServerStyleSheet();
		const originalRenderPage = ctx.renderPage;

		try {
			ctx.renderPage = () =>
				originalRenderPage({
					enhanceApp: (App: any) => (props: any) =>
						styledComponentsSheet.collectStyles(<App {...props} />),
				});

			const initialProps = await Document.getInitialProps(ctx);
			return {
				...initialProps,
				styles: (
					<>
						{initialProps.styles}
						{styledComponentsSheet.getStyleElement()}
					</>
				),
			};
		} finally {
			styledComponentsSheet.seal();
		}
	}

	render() {
		return (
			<Html lang="en">
				<Head>
					<style type="text/css" dangerouslySetInnerHTML={{ __html: mediaStyles }} />
					<link
						rel="preload"
						href="/fonts/AkkuratLLWeb-Regular.woff2"
						as="font"
						type="font/woff2"
						crossOrigin="anonymous"
					/>
					<link
						rel="preload"
						href="/fonts/AkkuratLLWeb-Bold.woff2"
						as="font"
						type="font/woff2"
						crossOrigin="anonymous"
					/>
					<link
						rel="preload"
						href="/fonts/AkkuratMonoLLWeb-Regular.woff2"
						as="font"
						type="font/woff2"
						crossOrigin="anonymous"
					/>
					{/* matomo */}
					<script>{`
					  var _paq = window._paq = window._paq || [];
					  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
					  _paq.push(['trackPageView']);
					  _paq.push(['enableLinkTracking']);
					  (function() {
					    var u="https://analytics.synthetix.io/";
					    _paq.push(['setTrackerUrl', u+'matomo.php']);
					    _paq.push(['setSiteId', '2']);
					    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
					    g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
					  })();
					`}</script>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
