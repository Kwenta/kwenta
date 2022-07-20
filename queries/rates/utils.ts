import { RateUpdateResult } from '@synthetixio/queries/build/node/generated/exchangesSubgraphQueries';
import Wei, { wei } from '@synthetixio/wei';
import { ethers } from 'ethers';

import { CandleResult } from 'queries/futures/subgraph';
import { SYNTHS_ENDPOINT_MAIN } from 'queries/synths/constants';
import { FuturesMarketKey } from 'utils/futures';

import { RATES_ENDPOINT_MAINNET, RATES_ENDPOINT_TESTNET } from './constants';
import { Candle } from './types';
import { RateUpdates, Candles, Prices } from './types';

export const getRatesEndpoint = (networkId: number): string => {
	return networkId === 1 || networkId === 42
		? SYNTHS_ENDPOINT_MAIN
		: networkId === 10
		? RATES_ENDPOINT_MAINNET
		: networkId === 69
		? RATES_ENDPOINT_TESTNET
		: RATES_ENDPOINT_MAINNET;
};

export const getMinAndMaxRate = (rates: RateUpdateResult[]): [Wei, Wei] => {
	if (rates.length === 0) return [wei(0), wei(0)];

	return rates.reduce(
		([minRate, maxRate], val) => {
			const { rate } = val;
			const newMax = rate.gt(maxRate) ? rate : maxRate;
			const newMin = rate.lt(minRate) ? rate : minRate;

			return [newMin, newMax];
		},
		[wei(ethers.constants.MaxUint256), wei(0)]
	);
};

export const calculateRateChange = (rates: RateUpdateResult[]): Wei => {
	if (rates.length < 2) return wei(0);

	const newPrice = rates[0].rate;
	const oldPrice = rates[rates.length - 1].rate;
	const percentageChange = newPrice.sub(oldPrice).div(oldPrice);

	return percentageChange;
};

export const mockHistoricalRates = (periodInHours: number, rate = 1, points = 100): RateUpdates => {
	let now = Date.now();

	const rates = [];

	for (let i = 0; i < points; i++) {
		rates.unshift({
			timestamp: now,
			rate,
		});
		now -= 1000 * 60 * periodInHours;
	}

	return rates;
};

export const mapLaggedDailyPrices = (prices: Candles): Prices => {
	return prices.map((candle) => {
		return {
			synth: candle.synth,
			price: Number(candle.average),
		};
	});
};

const markets = new Set<FuturesMarketKey>([
	FuturesMarketKey.sETH,
	FuturesMarketKey.sBTC,
	FuturesMarketKey.sLINK,
	FuturesMarketKey.sSOL,
	FuturesMarketKey.sAVAX,
	FuturesMarketKey.sMATIC,
	FuturesMarketKey.sAAVE,
	FuturesMarketKey.sUNI,
	FuturesMarketKey.sEUR,
	FuturesMarketKey.sXAU,
	FuturesMarketKey.sXAG,
	FuturesMarketKey.sWTI,
	FuturesMarketKey.sDYDX,
	FuturesMarketKey.sAPE,
]);

const map: Record<FuturesMarketKey, string> = {
	[FuturesMarketKey.sETH]: 'ethereum',
	[FuturesMarketKey.sBTC]: 'bitcoin',
	[FuturesMarketKey.sLINK]: 'chainlink',
	[FuturesMarketKey.sSOL]: 'solana',
	[FuturesMarketKey.sAVAX]: 'avalanche-2',
	[FuturesMarketKey.sMATIC]: 'matic-network',
	[FuturesMarketKey.sAAVE]: 'aave',
	[FuturesMarketKey.sUNI]: 'uniswap',
	[FuturesMarketKey.sEUR]: 'euro',
	[FuturesMarketKey.sXAU]: '',
	[FuturesMarketKey.sXAG]: '',
	[FuturesMarketKey.sWTI]: '',
	[FuturesMarketKey.sDYDX]: 'dydx',
	[FuturesMarketKey.sAPE]: 'apecoin',
	[FuturesMarketKey.sAXS]: '',
};

export const synthToCoingeckoPriceId = (marketKey: FuturesMarketKey) => {
	if (markets.has(marketKey)) {
		return map[marketKey];
	} else {
		return 'ethereum';
	}
};

export const mapCandles = (candles: CandleResult[]): Candle[] => {
	return candles?.map(({ id, synth, open, high, low, close, timestamp }: CandleResult) => {
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
	return candles?.map(({ id, synth, open, high, low, close, average, timestamp }: CandleResult) => {
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
