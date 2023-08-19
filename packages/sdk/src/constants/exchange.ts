import keyBy from 'lodash/keyBy'

import { FuturesMarketKey } from '../types/futures'

export const CG_BASE_API_URL = `${process.env.NEXT_PUBLIC_ONE_INCH_COINGECKO_PROXY}/coingecko/api/v3`

export const PROTOCOLS =
	'OPTIMISM_UNISWAP_V3,OPTIMISM_SYNTHETIX,OPTIMISM_SYNTHETIX_WRAPPER,OPTIMISM_ONE_INCH_LIMIT_ORDER,OPTIMISM_ONE_INCH_LIMIT_ORDER_V2,OPTIMISM_CURVE,OPTIMISM_BALANCER_V2,OPTIMISM_VELODROME,OPTIMISM_KYBERSWAP_ELASTIC'

export const FILTERED_TOKENS = ['0x4922a015c4407f87432b179bb209e125432e4a2a']
export const DEFAULT_BUFFER = 0.2

export const ADDITIONAL_MARKETS = new Set<string>([
	FuturesMarketKey.sAPEPERP,
	FuturesMarketKey.sDYDXPERP,
	FuturesMarketKey.sXAUPERP,
	FuturesMarketKey.sXAGPERP,
])

export const CRYPTO_CURRENCY = [
	'KNC',
	'COMP',
	'REN',
	'LEND',
	'SNX',
	'BTC',
	'ETH',
	'XRP',
	'BCH',
	'LTC',
	'EOS',
	'BNB',
	'XTZ',
	'XMR',
	'ADA',
	'LINK',
	'TRX',
	'DASH',
	'ETC',
]

export const CRYPTO_CURRENCY_MAP = keyBy(CRYPTO_CURRENCY)

export const ATOMIC_EXCHANGES_L1 = [
	'sBTC',
	'sETH',
	'sEUR',
	'sUSD',
	'sCHF',
	'sJPY',
	'sAUD',
	'sGBP',
	'sKRW',
]

// For coingecko API
export const ETH_COINGECKO_ADDRESS = '0x4200000000000000000000000000000000000006'
export const OP_ADDRESS = '0x4200000000000000000000000000000000000042'
export const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' // For 1inch API

export const KWENTA_ADDRESS = '0x920cf626a271321c151d027030d5d08af699456b'

export const ATOMIC_EXCHANGE_SLIPPAGE = '0.01'

// for DEX aggregators like 1inch
export const DEFAULT_1INCH_SLIPPAGE = 3

export const KWENTA_REFERRAL_ADDRESS = '0x08e30BFEE9B73c18F9770288DDd13203A4887460'

export const SYNTH_SWAP_OPTIMISM_ADDRESS = '0x6d6273f52b0C8eaB388141393c1e8cfDB3311De6'
