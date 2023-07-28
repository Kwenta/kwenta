// TODO: Make this dynamic

import { FuturesMarketKey } from '../types'

export const V3_SYNTH_MARKET_IDS = {
	SNXUSD: 0,
	SNXETH: 2,
	SNXBTC: 3,
} as const

export const V3_PERPS_MARKET_IDS = {
	SNXETH: 5,
}

export type V3SynthMarketKey = keyof typeof V3_SYNTH_MARKET_IDS
export type V3SynthMarketId = (typeof V3_SYNTH_MARKET_IDS)[V3SynthMarketKey]

export type V3PerpsMarketKey = keyof typeof V3_PERPS_MARKET_IDS
export type V3PerpsMarketId = (typeof V3_PERPS_MARKET_IDS)[V3PerpsMarketKey]

export const V3_PERPS_ID_TO_V2_MARKET_KEY: Record<V3PerpsMarketId, FuturesMarketKey> = {
	[V3_PERPS_MARKET_IDS.SNXETH]: FuturesMarketKey.sETHPERP,
}

export const V3_PERPS_ID_TO_SYNTH_ID: Record<V3PerpsMarketId, V3SynthMarketId> = {
	[V3_PERPS_MARKET_IDS.SNXETH]: V3_SYNTH_MARKET_IDS.SNXETH,
}
