import * as React from 'react';
import styled from 'styled-components';

import { widget } from '../../public/static/charting_library/charting_library';

function getLanguageFromURL() {
	const regex = new RegExp('[\\?&]lang=([^&#]*)');
	const results = regex.exec(window.location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

const supportedResolutions = ['1', '3', '5', '15', '30', '60', '120', '240', 'D'];

const config = {
	supported_resolutions: supportedResolutions,
};

const dataFeed = {
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
		// console.log('resolveSymbol:',{symbolName})
		var split_data = symbolName.split(/[:/]/);
		// console.log({split_data})
		var symbol_stub = {
			name: symbolName,
			description: '',
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

		console.log('split', split_data);

		// if (split_data[2].match(/USD|EUR|JPY|AUD|GBP|KRW|CNY/)) {
		// 	console.log('set..');
		// 	symbol_stub.pricescale = 100;
		// }
		setTimeout(function () {
			console.log('resolve symbol callback');
			onSymbolResolvedCallback(symbol_stub);
			console.log('Resolving that symbol....', symbol_stub);
		}, 0);
		console.log('resolve symbol done');

		// onResolveErrorCallback('Not feeling it today')
	},
	getBars: function (
		symbolInfo,
		resolution,
		from,
		to,
		onHistoryCallback,
		onErrorCallback,
		firstDataRequest
	) {
		console.log('=====getBars running');
		// console.log('function args',arguments)
		// console.log(`Requesting bars between ${new Date(from * 1000).toISOString()} and ${new Date(to * 1000).toISOString()}`)
		// historyProvider
		// 	.getBars(symbolInfo, resolution, from, to, firstDataRequest)
		// 	.then((bars) => {
		// 		if (bars.length) {
		// 			onHistoryCallback(bars, { noData: false });
		// 		} else {
		// 			onHistoryCallback(bars, { noData: true });
		// 		}
		// 	})
		// 	.catch((err) => {
		// 		console.log({ err });
		// 		onErrorCallback(err);
		// 	});
		const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const bars = data.map((d, i) => ({
			time: Date.now() + 1000 * i, //TradingView requires bar time in ms
			low: 100,
			high: 120,
			open: 110,
			close: 116,
			volume: 500,
		}));
		onHistoryCallback(bars, { noData: false });
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

type Props = {
	symbol?: string;
	interval?: string;
	containerId?: string;
	datafeedUrl?: string;
	libraryPath?: string;
	chartsStorageUrl?: string;
	chartsStorageApiVersion?: string;
	clientId?: string;
	userId?: string;
	fullscreen?: boolean;
	autosize?: boolean;
	studiesOverrides?: Record<string, any>;
};

export class TVChart extends React.PureComponent<Props> {
	static defaultProps = {
		symbol: 'AAPL',
		interval: 'D',
		containerId: 'tv_chart_container',
		datafeedUrl: 'https://demo_feed.tradingview.com',
		libraryPath: '/static/charting_library/',
		chartsStorageUrl: 'https://saveload.tradingview.com',
		chartsStorageApiVersion: '1.1',
		clientId: 'tradingview.com',
		userId: 'public_user_id',
		fullscreen: false,
		autosize: true,
		studiesOverrides: {},
	};

	tvWidget = null;

	componentDidMount() {
		console.log('did mount...');
		const widgetOptions = {
			symbol: this.props.symbol,
			// BEWARE: no trailing slash is expected in feed URL
			datafeed: dataFeed,
			interval: this.props.interval,
			container_id: this.props.containerId,
			library_path: this.props.libraryPath,

			locale: getLanguageFromURL() || 'en',
			disabled_features: ['use_localstorage_for_settings'],
			enabled_features: ['study_templates'],
			charts_storage_url: this.props.chartsStorageUrl,
			charts_storage_api_version: this.props.chartsStorageApiVersion,
			client_id: this.props.clientId,
			user_id: this.props.userId,
			fullscreen: this.props.fullscreen,
			autosize: this.props.autosize,
			studies_overrides: this.props.studiesOverrides,
		};

		const tvWidget = new widget(widgetOptions);
		this.tvWidget = tvWidget;

		tvWidget.onChartReady(() => {
			tvWidget.headerReady().then(() => {
				const button = tvWidget.createButton();
				button.setAttribute('title', 'Click to show a notification popup');
				button.classList.add('apply-common-tooltip');
				button.addEventListener('click', () =>
					tvWidget.showNoticeDialog({
						title: 'Notification',
						body: 'TradingView Charting Library API works correctly',
						callback: () => {
							console.log('Noticed!');
						},
					})
				);

				button.innerHTML = 'Check API';
			});
		});
	}

	componentWillUnmount() {
		if (this.tvWidget !== null) {
			this.tvWidget.remove();
			this.tvWidget = null;
		}
	}

	render() {
		return <div id={this.props.containerId} />;
	}
}

const Container = styled.div`
	height: 500px;
`;
