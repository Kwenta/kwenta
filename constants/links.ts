import { CurrencyKey } from './currency';

export const PROD_HOSTNAME = 'kwenta.io';

export const EXTERNAL_LINKS = {
	Trading: {
		DexAG: 'https://dex.ag/',
		Uniswap: 'https://uniswap.exchange/',
		OneInch: `https://1inch.exchange/`,
		OneInchLink: (from: CurrencyKey, to: CurrencyKey) => `https://1inch.exchange/#/${from}/${to}`,
		OptimismTokenBridge: 'https://gateway.optimism.io',
	},
	Synthetix: {
		Home: 'https://www.synthetix.io',
		Litepaper: 'https://docs.synthetix.io/litepaper/',
	},
	Social: {
		Twitter: 'https://twitter.com/kwenta_io',
		Medium: 'https://blog.kwenta.io/',
		Discord: 'https://discord.gg/kwenta',
		GitHub: 'https://github.com/kwenta/kwenta',
	},
	TokenLists: {
		Synthetix: 'https://synths.snx.eth.link/',
		Zapper: 'https://zapper.fi/api/token-list',
		OneInch: 'https://gateway.ipfs.io/ipns/tokens.1inch.eth',
	},
	Docs: {
		DocsRoot: 'https://docs.kwenta.io/',
		FeeReclamation: 'https://docs.kwenta.io/resources/fee-reclamation',
	},
	Explorer: {
		Optimism: 'https://optimistic.etherscan.io/tx',
		OptimismKovan: 'https://kovan-optimistic.etherscan.io/tx',
	},
	Trade: {
		NextPriceBlogPost: 'https://docs.kwenta.io/products/futures/next-price',
	},
};
