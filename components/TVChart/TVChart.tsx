import * as React from 'react';
import styled, { ThemeContext } from 'styled-components';
import { ChartBody } from 'sections/exchange/TradeCard/Charts/common/styles';

import {
	IChartingLibraryWidget,
	widget,
} from '../../public/static/charting_library/charting_library';
import DataFeedFactory from './DataFeed';
import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';

type Props = {
	baseCurrencyKey: string;
	quoteCurrencyKey: string;
	interval: string;
	containerId: string;
	libraryPath: string;
	fullscreen: boolean;
	autosize: boolean;
	studiesOverrides: Record<string, any>;
	overrides: Record<string, string>;
};

export function TVChart({
	baseCurrencyKey,
	quoteCurrencyKey,
	interval = '15',
	containerId = 'tv_chart_container',
	libraryPath = '/static/charting_library/',
	fullscreen = false,
	autosize = true,
	studiesOverrides = {},
	overrides,
}: Props) {
	const _widget = React.useRef<IChartingLibraryWidget | null>(null);
	const { colors } = React.useContext(ThemeContext);
	let isL2 = useRecoilValue(isL2State);

	React.useEffect(() => {
		const widgetOptions = {
			symbol: baseCurrencyKey + ':' + quoteCurrencyKey,
			datafeed: DataFeedFactory(isL2),
			interval: interval,
			container: containerId,
			library_path: libraryPath,

			locale: 'en',
			enabled_features: ['hide_left_toolbar_by_default'],
			disabled_features: [
				'use_localstorage_for_settings',
				'header_compare',
				'study_templates',
				'header_symbol_search',
				'display_market_status',
				'create_volume_indicator_by_default',
			],
			fullscreen: fullscreen,
			autosize: autosize,
			studies_overrides: studiesOverrides,
			theme: 'dark',
			custom_css_url: './theme.css',
			loading_screen: {
				backgroundColor: colors.selectedTheme.background,
			},
			overrides: overrides ?? {
				'paneProperties.background': colors.selectedTheme.background,
				'paneProperties.backgroundType': 'solid',
			},
			toolbar_bg: colors.selectedTheme.background,
			time_frames: [
				{ text: '4H', resolution: '5', description: '4 hours' },
				{ text: '12H', resolution: '5', description: '1 Day' },
				{ text: '1D', resolution: '15', description: '1 Day' },
				{ text: '5D', resolution: '15', description: '5 Days' },
				{ text: '30D', resolution: '1H', description: '30 Days' },
				{ text: '3M', resolution: '1H', description: '3 Months' },
			],
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [baseCurrencyKey, quoteCurrencyKey]);

	return (
		<Container>
			<ChartBody id={containerId} />
		</Container>
	);
}

const Container = styled.div`
	border-radius: 4px;
	background: ${(props) => props.theme.colors.selectedTheme.background};
`;
