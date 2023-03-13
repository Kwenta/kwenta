import { chain } from 'containers/Connector/config';
import { CandleResult } from 'queries/futures/subgraph';
import { NetworkId } from 'sdk/types/common';
import { FuturesMarketKey } from 'sdk/types/futures';

import { RATES_ENDPOINTS } from './constants';
import { Candle, PythResponse } from './types';

export const getRatesEndpoint = (networkId: NetworkId) => {
	return RATES_ENDPOINTS[networkId] || RATES_ENDPOINTS[chain.optimism.id];
};

const markets = new Set<FuturesMarketKey>([
	FuturesMarketKey.sETHPERP,
	FuturesMarketKey.sBTCPERP,
	FuturesMarketKey.sLINKPERP,
	FuturesMarketKey.sSOLPERP,
	FuturesMarketKey.sAVAXPERP,
	FuturesMarketKey.sMATICPERP,
	FuturesMarketKey.sAAVEPERP,
	FuturesMarketKey.sUNIPERP,
	FuturesMarketKey.sEURPERP,
	FuturesMarketKey.sXAUPERP,
	FuturesMarketKey.sXAGPERP,
	FuturesMarketKey.sDYDXPERP,
	FuturesMarketKey.sAPEPERP,
	FuturesMarketKey.sBNBPERP,
	FuturesMarketKey.sDOGEPERP,
	FuturesMarketKey.sOPPERP,
	FuturesMarketKey.sATOMPERP,
	FuturesMarketKey.sFTMPERP,
	FuturesMarketKey.sNEARPERP,
	FuturesMarketKey.sFLOWPERP,
	FuturesMarketKey.sAXSPERP,
	FuturesMarketKey.sAUDPERP,
	FuturesMarketKey.sGBPPERP,
]);

const map: Record<FuturesMarketKey, string> = {
	[FuturesMarketKey.sETHPERP]: 'ethereum',
	[FuturesMarketKey.sBTCPERP]: 'bitcoin',
	[FuturesMarketKey.sLINKPERP]: 'chainlink',
	[FuturesMarketKey.sSOLPERP]: 'solana',
	[FuturesMarketKey.sAVAXPERP]: 'avalanche-2',
	[FuturesMarketKey.sMATICPERP]: 'matic-network',
	[FuturesMarketKey.sAAVEPERP]: 'aave',
	[FuturesMarketKey.sUNIPERP]: 'uniswap',
	[FuturesMarketKey.sEURPERP]: 'euro',
	[FuturesMarketKey.sXAUPERP]: '',
	[FuturesMarketKey.sXAGPERP]: '',
	[FuturesMarketKey.sDYDXPERP]: 'dydx',
	[FuturesMarketKey.sAPEPERP]: 'apecoin',
	[FuturesMarketKey.sDOGEPERP]: 'dogecoin',
	[FuturesMarketKey.sBNBPERP]: 'binancecoin',
	[FuturesMarketKey.sOPPERP]: 'optimism',
	[FuturesMarketKey.sATOMPERP]: '',
	[FuturesMarketKey.sFTMPERP]: '',
	[FuturesMarketKey.sNEARPERP]: '',
	[FuturesMarketKey.sFLOWPERP]: '',
	[FuturesMarketKey.sAXSPERP]: '',
	[FuturesMarketKey.sAUDPERP]: '',
	[FuturesMarketKey.sGBPPERP]: '',
};

export const synthToCoingeckoPriceId = (marketKey: FuturesMarketKey) => {
	if (markets.has(marketKey)) {
		return map[marketKey];
	} else {
		return 'ethereum';
	}
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

export const mapPythCandles = (candleData: PythResponse): Candle[] => {
	return candleData.t.map((timestamp, ind) => {
		return {
			timestamp,
			open: candleData.o[ind],
			high: candleData.h[ind],
			low: candleData.l[ind],
			close: candleData.c[ind],
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
