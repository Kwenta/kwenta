// TODO: Make this dynamic

import { FuturesMarketKey } from '../types'

type valueof<T> = T[keyof T]

export const V3_SYNTH_MARKET_IDS = {
	SNXUSD: 0,
	SNXETH: 2,
	SNXBTC: 3,
}

export const V3_PERPS_MARKET_IDS = {
	SNXETH: 5,
}

export type V3MarketId = valueof<typeof V3_SYNTH_MARKET_IDS>

export const V3_PERPS_ID_TO_MARKET_KEY: Record<V3MarketId, FuturesMarketKey> = {
	[V3_PERPS_MARKET_IDS.SNXETH]: FuturesMarketKey.sETHPERP,
}
