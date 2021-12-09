import * as React from 'react';
import styled from 'styled-components';
import colors from 'styles/theme/colors';

import {
	IChartingLibraryWidget,
	widget,
} from '../../public/static/charting_library/charting_library';
import DataFeed from './DataFeed';

type Props = {
	baseCurrencyKey: string;
	quoteCurrencyKey: string;
	interval: 'D';
	containerId: string;
	libraryPath: string;
	fullscreen: boolean;
	autosize: boolean;
	height: string;
	studiesOverrides: Record<string, any>;
	overrides: Record<string, string>;
};

export function TVChart({
	baseCurrencyKey,
	quoteCurrencyKey,
	interval = 'D',
	containerId = 'tv_chart_container',
	libraryPath = '/static/charting_library/',
	fullscreen = false,
	autosize = true,
	studiesOverrides = {},
	overrides = {
		'paneProperties.background': colors.elderberry,
		'paneProperties.backgroundType': 'solid',
	},
	height = '45vh',
}: Props) {
	const _widget = React.useRef<IChartingLibraryWidget | null>(null);

	React.useEffect(() => {
		const widgetOptions = {
			symbol: quoteCurrencyKey + ':' + baseCurrencyKey,
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
			custom_css_url: './theme.css',
			loading_screen: {
				backgroundColor: colors.vampire,
			},
			overrides: overrides,
		};

		const clearExistingWidget = () => {
			if (_widget.current !== null) {
				_widget.current.remove();
				_widget.current = null;
			}
		};

		clearExistingWidget();

		// @ts-ignore complains about `container` item missing
		const tvWidget = new widget(widgetOptions);
		_widget.current = tvWidget;

		return () => {
			clearExistingWidget();
		};
	}, [baseCurrencyKey, quoteCurrencyKey]);
	return <Container id={containerId} height={height} />;
}

const Container = styled.div<{ height: string }>`
	height: ${(props) => props.height};
`;
