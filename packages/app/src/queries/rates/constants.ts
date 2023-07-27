import { AssetTypes } from './types'

export const COMMODITIES_BASE_API_URL =
	'https://forex-data-feed.swissquote.com/public-quotes/bboquotes/instrument'

export const FOREX_BASE_API_URL = 'https://api.exchangerate.host/latest'

export const DEFAULT_PYTH_TV_ENDPOINT =
	'https://benchmarks.pyth.network/v1/shims/tradingview/history'

export const NON_CRYPTO_ASSET_TYPES: AssetTypes = {
	Metal: ['XAU', 'XAG'],
	FX: ['EUR', 'GBP', 'AUD'],
}
