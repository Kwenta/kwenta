import { useMemo } from 'react';
import orderBy from 'lodash/orderBy';
import BigNumber from 'bignumber.js';

import { CurrencyKey, SYNTHS_MAP } from 'constants/currency';
import { PeriodLabel } from 'constants/period';
import useCandlesticksQuery from 'queries/rates/useCandlesticksQuery';
import { Candle } from 'queries/rates/types';
import { toBigNumber, zeroBN } from 'utils/formatters/number';

export type TempCandle = {
	id: string;
	synth: string;
	open: BigNumber;
	high: BigNumber;
	low: BigNumber;
	close: BigNumber;
	timestamp: BigInt;

	isBase?: boolean;
};

const useCombinedCandleSticksChartData = ({
	baseCurrencyKey,
	quoteCurrencyKey,
	selectedChartPeriodLabel,
}: {
	baseCurrencyKey: CurrencyKey | null;
	quoteCurrencyKey: CurrencyKey | null;
	selectedChartPeriodLabel: PeriodLabel;
}) => {
	const baseCurrencyIsSUSD = baseCurrencyKey === SYNTHS_MAP.sUSD;
	const quoteCurrencyIsSUSD = quoteCurrencyKey === SYNTHS_MAP.sUSD;

	const base = useData(baseCurrencyKey, selectedChartPeriodLabel);
	const quote = useData(quoteCurrencyKey, selectedChartPeriodLabel);

	const data = useMemo(() => {
		if (baseCurrencyIsSUSD) return quote.data;
		if (quoteCurrencyIsSUSD) return base.data;

		if (!(base.data.length && quote.data.length)) return [];

		const baseCandles = base.data.map((candle: Candle) => ({
			isBase: true,
			...toTempCandle(candle),
		}));
		const quoteCandles = quote.data.map(toTempCandle);

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
	}, [base.data, quote.data, baseCurrencyIsSUSD, quoteCurrencyIsSUSD]);

	return {
		noData: (base.noData && !baseCurrencyIsSUSD) || (quote.noData && !quoteCurrencyIsSUSD),
		isLoading: (base.isLoading && !baseCurrencyIsSUSD) || (quote.isLoading && !quoteCurrencyIsSUSD),
		data,
	};
};

const useData = (currencyKey: CurrencyKey | null, selectedChartPeriodLabel: PeriodLabel) => {
	const query = useCandlesticksQuery(currencyKey, selectedChartPeriodLabel.period);
	const data = query.isSuccess && query.data ? query.data : [];
	const noData = query.isSuccess && query.data && data.length === 0;
	return { data, noData, isLoading: query.isLoading };
};

const toTempCandle = (n: Candle): TempCandle => {
	return {
		id: n.id,
		synth: n.synth,
		open: toBigNumber(n.open.toLocaleString()),
		high: toBigNumber(n.high.toLocaleString()),
		low: toBigNumber(n.low.toLocaleString()),
		close: toBigNumber(n.close.toLocaleString()),
		timestamp: n.timestamp,
	};
};

const fromTempCandle = (n: TempCandle): Candle => {
	return {
		id: n.id,
		synth: n.synth,
		open: bigNumberToBigInt(n.open),
		high: bigNumberToBigInt(n.high),
		low: bigNumberToBigInt(n.low),
		close: bigNumberToBigInt(n.close),
		timestamp: n.timestamp,
	};
};

export const bigNumberToBigInt = (n: BigNumber): BigInt => {
	return BigInt(Math.ceil(n.times(1e18).toNumber()));
};

export default useCombinedCandleSticksChartData;
