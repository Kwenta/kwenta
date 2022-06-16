import { CurrencyKey } from './currency';

export const PROD_HOSTNAME = 'kwenta.io';

export const EXTERNAL_LINKS = {
	Trading: {
		Legacy: 'https://legacy.kwenta.io/exchange',
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
		Mirror: 'https://mirror.xyz/kwenta.eth',
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
		HowToTrade: 'https://docs.kwenta.io/products/futures',
		Governance: 'https://docs.kwenta.io/dao/governance-framework',
		DaoRoles: 'https://docs.kwenta.io/dao/dao-roles',
		HowToUse: 'https://docs.kwenta.io/onboard/how-to-start-using-kwenta',
		Perpetuals: 'https://docs.kwenta.io/products/futures',
		Spot: 'https://docs.kwenta.io/products/swaps ',
		DevDao: 'https://docs.kwenta.io/dao/contribute/devdao-contribute',
		MarketingDao: 'https://docs.kwenta.io/dao/contribute/marketingDAO',
		Faq: 'https://docs.kwenta.io/resources/faq',
	},
	Explorer: {
		Optimism: 'https://optimistic.etherscan.io/tx',
		OptimismKovan: 'https://kovan-optimistic.etherscan.io/tx',
	},
	Optimism: {
		Home: 'https://www.optimism.io/',
	},
	Trade: {
		NextPriceBlogPost: 'https://docs.kwenta.io/products/futures/next-price',
	},
	Kips: {
		Home: 'https://kips.kwenta.io/all-kip/',
	},
};
