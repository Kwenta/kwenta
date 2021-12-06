import { formatUnits } from '@ethersproject/units';

import { requestCandlesticks } from 'queries/rates/useCandlesticksQuery';

const supportedResolutions = ['1', '3', '5', '15', '30', '60', '120', '240', 'D'];

const config = {
	supported_resolutions: supportedResolutions,
};

const DataFeed = {
	onReady: (cb) => {
		console.log('=====onReady running');
		setTimeout(() => cb(config), 0);
	},
	searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
		console.log('====Search Symbols running');
	},
	resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
		// expects a symbolInfo object in response
		console.log('======resolveSymbol running');
		var split_data = symbolName.split(/[:/]/);
		var symbol_stub = {
			name: symbolName,
			description: 'sUSD / ' + symbolName,
			type: 'crypto',
			session: '24x7',
			timezone: 'Etc/UTC',
			ticker: symbolName,
			exchange: split_data[0],
			minmov: 1,
			pricescale: 100000000,
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
		symbolInfo,
		resolution,
		{ from, to, countBack },
		onHistoryCallback,
		onErrorCallback,
		firstDataRequest
	) {
		requestCandlesticks(symbolInfo.name, from, to).then((bars) => {
			const chartBars = bars.map((b) => {
				return {
					...b,
					high: formatUnits(b.high),
					low: formatUnits(b.low),
					open: formatUnits(b.open),
					close: formatUnits(b.close),
					time: Number(b.timestamp) * 1000,
				};
			});

			onHistoryCallback(chartBars, { noData: chartBars.length ? false : true });
		});
	},
	subscribeBars: (
		symbolInfo,
		resolution,
		onRealtimeCallback,
		subscribeUID,
		onResetCacheNeededCallback
	) => {
		console.log('=====subscribeBars runnning');
	},
	unsubscribeBars: (subscriberUID) => {
		console.log('=====unsubscribeBars running');
	},
	calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
		//optional
		console.log('=====calculateHistoryDepth running');
		// while optional, this makes sure we request 24 hours of minute data at a time
		// CryptoCompare's minute data endpoint will throw an error if we request data beyond 7 days in the past, and return no data
		return resolution < 60 ? { resolutionBack: 'D', intervalBack: '1' } : undefined;
	},
	getMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
		//optional
		console.log('=====getMarks running');
	},
	getTimeScaleMarks: (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
		//optional
		console.log('=====getTimeScaleMarks running');
	},
	getServerTime: (cb) => {
		console.log('=====getServerTime running');
	},
};

export default DataFeed;
