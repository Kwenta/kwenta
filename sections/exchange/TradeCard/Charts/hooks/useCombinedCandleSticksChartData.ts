import Wei, { wei } from '@synthetixio/wei';
import orderBy from 'lodash/orderBy';

import { Candle } from 'queries/rates/types';
import { zeroBN } from 'utils/formatters/number';

export type TempCandle = {
	id: string;
	synth: string;
	open: Wei;
	high: Wei;
	low: Wei;
	close: Wei;
	timestamp: Wei;
	isBase?: boolean;
};

export const combineDataToPair = (
	baseData: Candle[],
	quoteData: Candle[],
	baseCurrencyIsSUSD: boolean,
	quoteCurrencyIsSUSD: boolean
) => {
	if (baseCurrencyIsSUSD) return quoteData.map(toTempCandle).map(fromTempCandle); // Double map to make sure output is still in the same format
	if (quoteCurrencyIsSUSD) return baseData.map(toTempCandle).map(fromTempCandle);

	if (!(baseData.length && quoteData.length)) return [];

	const baseCandles = baseData.map((candle: Candle) => ({
		isBase: true,
		...toTempCandle(candle),
	}));
	const quoteCandles = quoteData.map(toTempCandle);

	let allCandles: TempCandle[] = [];
	allCandles = allCandles.concat(baseCandles);
	allCandles = allCandles.concat(quoteCandles);
	allCandles = orderBy(allCandles, 'timestamp');

	let prevBaseCandle: TempCandle = baseCandles[0];
	let prevQuoteCandle: TempCandle = quoteCandles[0];

	return allCandles.reduce((candles, candle) => {
		let open = zeroBN;
		let high = zeroBN;
		let low = zeroBN;
		let close = zeroBN;
		if (candle.isBase) {
			open = candle.open.div(prevQuoteCandle.open);
			high = candle.high.div(prevQuoteCandle.high);
			low = candle.low.div(prevQuoteCandle.low);
			close = candle.close.div(prevQuoteCandle.close);
			prevBaseCandle = candle;
		} else {
			open = prevBaseCandle.open.div(candle.open);
			high = prevBaseCandle.high.div(candle.high);
			low = prevBaseCandle.low.div(candle.low);
			close = prevBaseCandle.close.div(candle.close);
			prevQuoteCandle = candle;
		}
		return candles.concat(
			fromTempCandle({
				timestamp: candle.timestamp,
				open,
				high,
				low,
				close,
			} as TempCandle)
		);
	}, [] as Candle[]);
};

const toTempCandle = (n: Candle): TempCandle => {
	return {
		id: n.id,
		synth: n.synth,
		open: wei(n.open),
		high: wei(n.high),
		low: wei(n.low),
		close: wei(n.close),
		timestamp: wei(n.timestamp),
	};
};

const fromTempCandle = (n: TempCandle): Candle => {
	return {
		id: n.id,
		synth: n.synth,
		open: n.open.toNumber(),
		high: n.high.toNumber(),
		low: n.low.toNumber(),
		close: n.close.toNumber(),
		timestamp: n.timestamp.toNumber(),
	};
};
