import { CurrencyKey } from './currency';

export const PROD_HOSTNAME = 'kwenta.eth.limo';

export const EXTERNAL_LINKS = {
	Trading: {
		Legacy: 'https://legacy.kwenta.io/exchange',
		PerpsV1: 'https://v1.kwenta.eth.limo',
		DexAG: 'https://dex.ag/',
		Uniswap: 'https://uniswap.exchange/',
		OneInch: `https://1inch.exchange/`,
		OneInchApi: {
			ethereum: 'https://api.1inch.io/v5.0/1/',
			optimism: 'https://api.1inch.io/v5.0/10/',
		},
		OneInchLink: (from: CurrencyKey, to: CurrencyKey) => `https://1inch.exchange/#/${from}/${to}`,
		OptimismTokenBridge: 'https://gateway.optimism.io',
	},
	Options: {
		Portfolio: 'https://options.kwenta.eth.limo/#/portfolio',
	},
	Synthetix: {
		Home: 'https://www.synthetix.io',
		Litepaper: 'https://docs.synthetix.io/litepaper/',
	},
	Social: {
		Twitter: 'https://twitter.com/kwenta_io',
		Mirror: 'https://mirror.xyz/kwenta.eth',
		Discord: 'https://discord.gg/kwentaio',
		GitHub: 'https://github.com/kwenta/kwenta',
	},
	TokenLists: {
		Zapper: 'https://zapper.fi/api/token-list',
	},
	Docs: {
		DocsRoot: 'https://docs.kwenta.io/',
		FeeReclamation: 'https://docs.kwenta.io/resources/fee-reclamation',
		HowToTrade: 'https://docs.kwenta.io/products/futures',
		Governance: 'https://github.com/Kwenta/kwenta-state-log',
		DaoRoles: 'https://github.com/Kwenta/kwenta-state-log/blob/master/sections/2.md',
		HowToUse: 'https://docs.kwenta.io/onboard/how-to-start-using-kwenta',
		Perpetuals: 'https://docs.kwenta.io/products/futures',
		Spot: 'https://docs.kwenta.io/products/swaps ',
		DevDao: 'https://docs.kwenta.io/dao/contribute/devdao-contribute',
		MarketingDao:
			'https://github.com/Kwenta/kwenta-state-log/blob/master/sections/2.md#marketingdao-grants-council-trial',
		Faq: 'https://docs.kwenta.io/resources/faq',
		CrossMarginFaq: 'https://docs.kwenta.io/products/futures/cross-margin-accounts',
		Staking: 'https://docs.kwenta.io/using-kwenta/staking-kwenta',
		TradingRewardsV2: 'https://mirror.xyz/kwenta.eth/7k-5UYXXcCNJ_DRRWvYBsK5zDm5UA945My4QrInhxoI',
	},
	Optimism: {
		Home: 'https://optimism.io/',
	},
	Trade: {
		PerpsV2: 'https://kwenta.eth.limo/market/?accountType=isolated_margin&asset=sETH',
		Spot: 'https://kwenta.eth.limo/exchange/',
		V1: 'https://v1.kwenta.eth.limo/dashboard',
	},
	Governance: {
		Kips: 'https://github.com/Kwenta/kwenta-state-log',
		Vote: 'https://snapshot.org/#/kwenta.eth',
	},
	Competition: {
		LearnMore: 'https://mirror.xyz/kwenta.eth/s_PO64SxvuwDHz9fdHebsYeQAOOc73D3bL2q4nC6LvU',
	},
};
