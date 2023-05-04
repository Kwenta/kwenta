import { chain } from 'containers/Connector/config';
import { CandleResult } from 'queries/futures/subgraph';
import { NetworkId } from 'sdk/types/common';

import { RATES_ENDPOINTS } from './constants';
import { Candle } from './types';

export const getRatesEndpoint = (networkId: NetworkId) => {
	return RATES_ENDPOINTS[networkId] || RATES_ENDPOINTS[chain.optimism.id];
};

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
		};
	});
};

export const mapPriceChart = (candles: CandleResult[]): Candle[] => {
	return candles.map(({ id, synth, open, high, low, close, average, timestamp }) => {
		return {
			id: id,
			synth: synth,
			open: open.toNumber(),
			high: high.toNumber(),
			low: low.toNumber(),
			close: close.toNumber(),
			average: average.toNumber(),
			timestamp: timestamp.toNumber(),
		};
	});
};
