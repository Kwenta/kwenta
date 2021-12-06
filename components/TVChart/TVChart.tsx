import * as React from 'react';
import styled from 'styled-components';

import {
	IChartingLibraryWidget,
	widget,
} from '../../public/static/charting_library/charting_library';
import DataFeed from './DataFeed';

export function TVChart({
	symbol = 'sETH',
	interval = 'D',
	containerId = 'tv_chart_container',
	libraryPath = '/static/charting_library/',
	fullscreen = false,
	autosize = true,
	studiesOverrides = {},
}) {
	const _widget = React.useRef<IChartingLibraryWidget | null>(null);

	React.useEffect(() => {
		const widgetOptions = {
			symbol: symbol,
			// BEWARE: no trailing slash is expected in feed URL
			datafeed: DataFeed,
			interval: interval,
			container_id: containerId,
			library_path: libraryPath,

			locale: 'en',
			disabled_features: ['use_localstorage_for_settings'],
			enabled_features: ['study_templates'],
			fullscreen: fullscreen,
			autosize: autosize,
			studies_overrides: studiesOverrides,
			theme: 'dark',
		};

		const tvWidget = new widget(widgetOptions);
		_widget.current = tvWidget;

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
		return () => {
			if (_widget.current !== null) {
				_widget.current.remove();
				_widget.current = null;
			}
		};
	}, []);
	return <Container id={containerId} />;
}

const Container = styled.div`
	height: 450px;
`;
