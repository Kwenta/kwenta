import { CurrencyKey } from './currency';

export const PROD_HOSTNAME = 'kwenta.eth.limo';

export const EXTERNAL_LINKS = {
	Trading: {
		Legacy: 'https://legacy.kwenta.io/exchange',
		DexAG: 'https://dex.ag/',
		Uniswap: 'https://uniswap.exchange/',
		OneInch: `https://1inch.exchange/`,
		OneInchApi: {
			ethereum: 'https://api.1inch.io/v4.0/1/',
			optimism: 'https://api.1inch.io/v4.0/10/',
		},
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
		Zapper: 'https://zapper.fi/api/token-list',
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
		CrossMarginFaq: 'https://docs.kwenta.io/products/futures/cross-margin-accounts',
		Staking: 'https://docs.kwenta.io/using-kwenta/staking-kwenta',
	},
	Optimism: {
		Home: 'https://optimism.io/',
	},
	Trade: {
		NextPriceBlogPost: 'https://docs.kwenta.io/products/futures/next-price',
	},
	Governance: {
		Kips: 'https://kips.kwenta.io/all-kip/',
		Vote: 'https://snapshot.org/#/kwenta.eth',
	},
	Competition: {
		LearnMore: 'https://mirror.xyz/kwenta.eth/s_PO64SxvuwDHz9fdHebsYeQAOOc73D3bL2q4nC6LvU',
	},
	Aelin: {
		Pool: 'https://app.aelin.xyz/pool/mainnet/0x21f4F88a95f656ef4ee1ea107569b3b38cf8daef',
	},
};
