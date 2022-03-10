import { formatEther } from '@ethersproject/units';
import { Synths } from 'constants/currency';
import {
	HistoryCallback,
	IBasicDataFeed,
	LibrarySymbolInfo,
	OnReadyCallback,
	PeriodParams,
	ResolutionString,
	SearchSymbolsCallback,
} from 'public/static/charting_library/charting_library';

import { requestCandlesticks } from 'queries/rates/useCandlesticksQuery';
import { combineDataToPair } from 'sections/exchange/TradeCard/Charts/hooks/useCombinedCandleSticksChartData';

const supportedResolutions = ['D', 'W'] as ResolutionString[];

const config = {
	supported_resolutions: supportedResolutions,
};

const formatWei = (weiValue: BigInt) => {
	const rounded = Number(formatEther(String(weiValue)));
	return Number(rounded.toFixed(4));
};

// symbolName name split from BASE:QUOTE
const splitBaseQuote = (symbolName: string) => {
	var split_data = symbolName.split(/[:/]/);
	const base = split_data[0];
	const quote = split_data[1];
	return { base, quote };
};

const fetchCombinedCandleSticks = async (
	base: string,
	quote: string,
	from: number,
	to: number,
	isL2: boolean
) => {
	const baseCurrencyIsSUSD = base === Synths.sUSD;
	const quoteCurrencyIsSUSD = quote === Synths.sUSD;
	const baseData = await requestCandlesticks(base, from, to, isL2);
	const quoteData = await requestCandlesticks(quote, from, to, isL2);
	return combineDataToPair(baseData, quoteData, baseCurrencyIsSUSD, quoteCurrencyIsSUSD);
};

const DataFeedFactory = (isL2: boolean = false): IBasicDataFeed => {
	return {
		onReady: (cb: OnReadyCallback) => {
			setTimeout(() => cb(config), 0);
		},
		resolveSymbol: (symbolName: string, onSymbolResolvedCallback: (val: any) => any) => {
			const { base, quote } = splitBaseQuote(symbolName);

			var symbol_stub = {
				name: symbolName,
				description: base + ' / ' + quote,
				type: 'crypto',
				session: '24x7',
				timezone: 'Etc/UTC',
				ticker: symbolName,
				exchange: '',
				minmov: 1,
				pricescale: 10000,
				has_intraday: true,
				intraday_multipliers: ['1', '60'],
				supported_resolution: supportedResolutions,
				volume_precision: 8,
				data_status: 'streaming',
			};

			setTimeout(function () {
				onSymbolResolvedCallback(symbol_stub);
			}, 0);
		},
		getBars: function (
			symbolInfo: LibrarySymbolInfo,
			_resolution: ResolutionString,
			{ from, to, countBack }: PeriodParams,
			onHistoryCallback: HistoryCallback,
			onErrorCallback: (error: any) => any
		) {
			const { base, quote } = splitBaseQuote(symbolInfo.name);

			try {
				fetchCombinedCandleSticks(base, quote, from, to, isL2).then((bars) => {
					const chartBars = bars.map((b) => {
						return {
							...b,
							high: formatWei(b.high),
							low: formatWei(b.low),
							open: formatWei(b.open),
							close: formatWei(b.close),
							time: Number(b.timestamp) * 1000,
						};
					});
					onHistoryCallback(chartBars, { noData: !chartBars.length });
				});
			} catch (err) {
				onErrorCallback(err);
			}
		},
		subscribeBars: () => {
			console.log('=====subscribeBars runnning');
		},
		unsubscribeBars: (subscriberUID) => {
			console.log('=====unsubscribeBars running');
		},
		searchSymbols: (
			userInput: string,
			exchange: string,
			symbolType: string,
			onResult: SearchSymbolsCallback
		) => {
			onResult([]);
		},
	};
};

export default DataFeedFactory;
