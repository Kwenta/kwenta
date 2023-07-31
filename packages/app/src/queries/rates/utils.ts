import { CandleResult } from '@kwenta/sdk/utils'

import { NON_CRYPTO_ASSET_TYPES } from './constants'
import { Candle, PythResponse } from './types'

export const mapCandles = (candles: CandleResult[]): Candle[] => {
	return candles.map(({ id, synth, open, high, low, close, timestamp }) => {
		return {
			id: id,
			synth: synth,
			open: open.toNumber(),
			high: high.toNumber(),
			low: low.toNumber(),
			close: close.toNumber(),
			timestamp: timestamp.toNumber(),
		}
	})
}

export const mapPythCandles = (candleData: PythResponse): Candle[] => {
	return candleData.t.map((timestamp, ind) => {
		return {
			timestamp,
			open: candleData.o[ind],
			high: candleData.h[ind],
			low: candleData.l[ind],
			close: candleData.c[ind],
		}
	})
}

export const formatPythSymbol = (asset: string): string => {
	if (asset === 'ETHBTC') return 'Crypto.ETH/BTC'
	const prefix =
		Object.keys(NON_CRYPTO_ASSET_TYPES).find((type) =>
			NON_CRYPTO_ASSET_TYPES[type].includes(asset)
		) || 'Crypto'
	return `${prefix}.${asset}/USD`
}
