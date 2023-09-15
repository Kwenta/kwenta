import { CurrencyKey } from './currency'

export const PROD_HOSTNAME = 'kwenta.eth.limo'
export const PROD_REFFERAL_URL = 'kwenta.eth.limo/market'

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
		Trade: 'https://options.kwenta.eth.limo/#/trade',
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
		Governance: 'https://gov.kwenta.eth.limo',
		DaoRoles: 'https://gov.kwenta.eth.limo/sections/2',
		HowToUse: 'https://docs.kwenta.io/onboard/how-to-start-using-kwenta',
		Perpetuals: 'https://docs.kwenta.io/products/futures',
		Spot: 'https://docs.kwenta.io/products/swaps ',
		DevDao: 'https://docs.kwenta.io/dao/contribute/devdao-contribute',
		MarketingDao: 'https://gov.kwenta.eth.limo/sections/2/#marketingdao-grants-council-trial',
		Faq: 'https://docs.kwenta.io/resources/faq',
		CrossMarginFaq: 'https://docs.kwenta.io/using-kwenta/smart-margin/trading-on-kwenta/faq',
		Staking: 'https://docs.kwenta.io/using-kwenta/staking-kwenta',
		TradingRewardsV2: 'https://mirror.xyz/kwenta.eth/7k-5UYXXcCNJ_DRRWvYBsK5zDm5UA945My4QrInhxoI',
		RewardsGuide: 'https://mirror.xyz/kwenta.eth/8KyrISnjOcuAX_VW-GxVqxpcbWukB_RlP5XWWMz-UGk',
		StakingV2Migration: 'https://docs.kwenta.io/kwenta-token/v2-migration',
		Referrals: 'https://docs.kwenta.io/using-kwenta/referral',
	},
	Optimism: {
		Home: 'https://optimism.io/',
	},
	Trade: {
		PerpsV2: 'https://kwenta.eth.limo/market/?accountType=smart_margin&asset=sETH',
		Spot: 'https://kwenta.eth.limo/exchange/',
		V1: 'https://v1.kwenta.eth.limo/dashboard',
	},
	Governance: {
		Kips: 'https://gov.kwenta.eth.limo/all-kips',
		Vote: 'https://snapshot.org/#/kwenta.eth',
	},
	Competition: {
		LearnMore: 'https://mirror.xyz/kwenta.eth/s_PO64SxvuwDHz9fdHebsYeQAOOc73D3bL2q4nC6LvU',
	},
	Referrals: {
		BoostNFT: 'https://opensea.io/assets/optimism/0xD3B8876073949D790AB718CAD21d9326a3adA60f',
	},
}
