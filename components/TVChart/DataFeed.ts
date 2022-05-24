import { Synths } from 'constants/currency';
import {
	HistoryCallback,
	IBasicDataFeed,
	LibrarySymbolInfo,
	OnReadyCallback,
	PeriodParams,
	ResolutionString,
	SearchSymbolsCallback,
	SubscribeBarsCallback,
} from 'public/static/charting_library/charting_library';

import { requestCandlesticks } from 'queries/rates/useCandlesticksQuery';
import { combineDataToPair } from 'sections/exchange/TradeCard/Charts/hooks/useCombinedCandleSticksChartData';
import { getDisplayAsset } from 'utils/futures';

const supportedResolutions = ['1', '5', '15', '60', '1D'] as ResolutionString[];

const config = {
	supports_search: false,
	supports_group_request: true,
	supported_resolutions: supportedResolutions,
};

// symbolName name split from BASE:QUOTE
const splitBaseQuote = (symbolName: string) => {
	var split_data = symbolName.split(/[:/]/);
	const base = split_data[0];
	const quote = split_data[1];
	return { base, quote };
};

const fetchCombinedCandles = async (
	base: string,
	quote: string,
	from: number,
	to: number,
	resolution: ResolutionString,
	networkId: number
) => {
	const baseCurrencyIsSUSD = base === Synths.sUSD;
	const quoteCurrencyIsSUSD = quote === Synths.sUSD;
	const baseDataPromise = requestCandlesticks(base, from, to, resolution, networkId);
	const quoteDataPromise = requestCandlesticks(quote, from, to, resolution, networkId);

	return Promise.all([baseDataPromise, quoteDataPromise]).then(([baseData, quoteData]) => {
		return combineDataToPair(baseData, quoteData, baseCurrencyIsSUSD, quoteCurrencyIsSUSD);
	});
};

const fetchLastCandle = async (
	base: string,
	quote: string,
	resolution: ResolutionString,
	networkId: number
) => {
	const baseCurrencyIsSUSD = base === Synths.sUSD;
	const quoteCurrencyIsSUSD = quote === Synths.sUSD;
	const to = Math.floor(Date.now() / 1000);
	const from = 0;

	const baseDataPromise = requestCandlesticks(base, from, to, resolution, networkId, 1, 'desc');
	const quoteDataPromise = requestCandlesticks(quote, from, to, resolution, networkId, 1, 'desc');

	return Promise.all([baseDataPromise, quoteDataPromise]).then(([baseData, quoteData]) => {
		return combineDataToPair(baseData, quoteData, baseCurrencyIsSUSD, quoteCurrencyIsSUSD);
	});
};

function subscribeLastCandle(
	base: string,
	quote: string,
	resolution: ResolutionString,
	networkId: number,
	onTick: SubscribeBarsCallback
): void {
	try {
		fetchLastCandle(base, quote, resolution, networkId).then((bars) => {
			const chartBar = bars.map((b) => {
				return {
					high: b.high,
					low: b.low,
					open: b.open,
					close: b.close,
					time: b.timestamp * 1000,
				};
			})[0];
			if (chartBar) onTick(chartBar);
		});
	} catch (err) {
		console.log(err);
	}
}

const DataFeedFactory = (
	networkId: number,
	onSubscribe: (intervalId: number) => void
): IBasicDataFeed => {
	return {
		onReady: (cb: OnReadyCallback) => {
			setTimeout(() => cb(config), 0);
		},
		resolveSymbol: (symbolName: string, onSymbolResolvedCallback: (val: any) => any) => {
			const { base, quote } = splitBaseQuote(symbolName);

			var symbol_stub = {
				name: symbolName,
				description: `${getDisplayAsset(base)} / ${getDisplayAsset(quote)} (Oracle)`,
				type: 'crypto',
				session: '24x7',
				timezone: 'Etc/UTC',
				ticker: symbolName,
				exchange: '',
				minmov: 1,
				pricescale: 10000,
				has_intraday: true,
				intraday_multipliers: supportedResolutions,
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
				fetchCombinedCandles(base, quote, from, to, _resolution, networkId).then((bars) => {
					const chartBars = bars.map((b) => {
						return {
							high: b.high,
							low: b.low,
							open: b.open,
							close: b.close,
							time: b.timestamp * 1000,
						};
					});
					onHistoryCallback(chartBars, { noData: !chartBars.length });
				});
			} catch (err) {
				onErrorCallback(err);
			}
		},
		subscribeBars: (
			symbolInfo: LibrarySymbolInfo,
			_resolution: ResolutionString,
			onTick: SubscribeBarsCallback,
			listenerGuid: string
		) => {
			const { base, quote } = splitBaseQuote(symbolInfo.name);
			const intervalId = setInterval(() => {
				subscribeLastCandle(base, quote, _resolution, networkId, onTick);
			}, 5000);

			onSubscribe(intervalId);
		},
		unsubscribeBars: (subscriberUID) => {},
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
