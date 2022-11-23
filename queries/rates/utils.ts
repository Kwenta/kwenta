import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import { chain } from 'wagmi';

import { DEBT_RATIO_UNIT } from 'constants/network';
import { CandleResult } from 'queries/futures/subgraph';
import { FuturesMarketKey } from 'utils/futures';

import { RATES_ENDPOINTS } from './constants';
import { Candle, LatestRate } from './types';
import { Prices } from './types';

export const getRatesEndpoint = (networkId: NetworkId): string => {
	return RATES_ENDPOINTS[networkId] || RATES_ENDPOINTS[chain.optimism.id];
};

export const mapLaggedDailyPrices = (rates: LatestRate[]): Prices => {
	return rates.map((rate) => {
		return {
			synth: rate.id,
			price:
				rate.id === 'DebtRatio'
					? wei(rate.rate).div(DEBT_RATIO_UNIT).toNumber()
					: wei(rate.rate).toNumber(),
		};
	});
};

const markets = new Set<FuturesMarketKey>([
	FuturesMarketKey.pETH,
	FuturesMarketKey.pBTC,
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
	FuturesMarketKey.sDYDX,
	FuturesMarketKey.sAPE,
	FuturesMarketKey.sBNB,
	FuturesMarketKey.sDOGE,
	FuturesMarketKey.sDebtRatio,
	FuturesMarketKey.sXMR,
	FuturesMarketKey.sOP,
]);

const map: Record<FuturesMarketKey, string> = {
	[FuturesMarketKey.pETH]: 'ethereum',
	[FuturesMarketKey.pBTC]: 'bitcoin',

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
	[FuturesMarketKey.sDYDX]: 'dydx',
	[FuturesMarketKey.sAPE]: 'apecoin',
	[FuturesMarketKey.sDOGE]: 'dogecoin',
	[FuturesMarketKey.sBNB]: 'binancecoin',
	[FuturesMarketKey.sDebtRatio]: '',
	[FuturesMarketKey.sXMR]: 'monero',
	[FuturesMarketKey.sOP]: 'optimism',
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
			open: synth === 'DebtRatio' ? open.div(DEBT_RATIO_UNIT).toNumber() : open.toNumber(),
			high: synth === 'DebtRatio' ? high.div(DEBT_RATIO_UNIT).toNumber() : high.toNumber(),
			low: synth === 'DebtRatio' ? low.div(DEBT_RATIO_UNIT).toNumber() : low.toNumber(),
			close: synth === 'DebtRatio' ? close.div(DEBT_RATIO_UNIT).toNumber() : close.toNumber(),
			timestamp: timestamp.toNumber(),
		};
	});
};

export const mapPriceChart = (candles: CandleResult[]): Candle[] => {
	return candles?.map(({ id, synth, open, high, low, close, average, timestamp }: CandleResult) => {
		return {
			id: id,
			synth: synth,
			open: synth === 'DebtRatio' ? open.div(DEBT_RATIO_UNIT).toNumber() : open.toNumber(),
			high: synth === 'DebtRatio' ? high.div(DEBT_RATIO_UNIT).toNumber() : high.toNumber(),
			low: synth === 'DebtRatio' ? low.div(DEBT_RATIO_UNIT).toNumber() : low.toNumber(),
			close: synth === 'DebtRatio' ? close.div(DEBT_RATIO_UNIT).toNumber() : close.toNumber(),
			average: synth === 'DebtRatio' ? average.div(DEBT_RATIO_UNIT).toNumber() : average.toNumber(),
			timestamp: timestamp.toNumber(),
		};
	});
};
