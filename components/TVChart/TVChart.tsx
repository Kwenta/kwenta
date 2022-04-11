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
	interval = 'H',
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
			disabled_features: ['use_localstorage_for_settings', 'study_templates'],
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
				{ text: '1y', resolution: '1D', description: '1 Year' },
				{ text: '6m', resolution: '1D', description: '6 Months' },
				{ text: '3m', resolution: '1D', description: '3 Months' },
				{ text: '1m', resolution: '1D', description: '1 Month' },
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
