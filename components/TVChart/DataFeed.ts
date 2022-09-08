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
import logError from 'utils/logError';

import { resolutionToSeconds } from './utils';

const supportedResolutions = [
	'1',
	'5',
	'15',
	'30',
	'60',
	'120',
	'240',
	'480',
	'720',
	'1D',
	'3D',
	'7D',
	'30D',
] as ResolutionString[];

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
	const baseCurrencyIsSUSD = base === 'sUSD';
	const quoteCurrencyIsSUSD = quote === 'sUSD';
	const baseDataPromise = requestCandlesticks(
		base,
		from,
		to,
		resolutionToSeconds(resolution),
		networkId
	);
	const quoteDataPromise = requestCandlesticks(
		quote,
		from,
		to,
		resolutionToSeconds(resolution),
		networkId
	);

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
	const baseCurrencyIsSUSD = base === 'sUSD';
	const quoteCurrencyIsSUSD = quote === 'sUSD';
	const to = Math.floor(Date.now() / 1000);
	const from = 0;

	const baseDataPromise = requestCandlesticks(
		base,
		from,
		to,
		resolutionToSeconds(resolution),
		networkId,
		1,
		'desc'
	);
	const quoteDataPromise = requestCandlesticks(
		quote,
		from,
		to,
		resolutionToSeconds(resolution),
		networkId,
		1,
		'desc'
	);

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
			if (chartBar) {
				const resolutionMs = resolutionToSeconds(resolution) * 1000;
				if (Date.now() - chartBar.time > resolutionMs * 2.1) {
					onTick({
						high: chartBar.close,
						low: chartBar.close,
						open: chartBar.close,
						close: chartBar.close,
						time: (Math.floor(Date.now() / resolutionMs) - 1) * resolutionMs,
					});
				} else {
					onTick(chartBar);
				}
			}
		});
	} catch (err) {
		logError(err);
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
			onTick: SubscribeBarsCallback
		) => {
			const { base, quote } = splitBaseQuote(symbolInfo.name);

			// fill in gaps from last candle to now
			fetchLastCandle(base, quote, _resolution, networkId).then((bars) => {
				const chartBar = bars.map((b) => {
					return {
						high: b.high,
						low: b.low,
						open: b.open,
						close: b.close,
						time: b.timestamp * 1000,
					};
				})[0];
				if (chartBar) {
					const resolutionMs = resolutionToSeconds(_resolution) * 1000;
					if (Date.now() - chartBar.time > resolutionMs) {
						for (
							var ts = chartBar.time + resolutionMs;
							ts < Math.floor(ts / resolutionMs) * resolutionMs - resolutionMs;
							ts += resolutionMs
						) {
							onTick({
								high: chartBar.close,
								low: chartBar.close,
								open: chartBar.close,
								close: chartBar.close,
								time: Math.floor(ts / resolutionMs) * resolutionMs,
							});
						}
					} else {
						onTick(chartBar);
					}
				}
			});

			// subscribe to new candles
			const intervalId = setInterval(() => {
				subscribeLastCandle(base, quote, _resolution, networkId, onTick);
			}, 10000);

			//@ts-ignore FIXME
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
