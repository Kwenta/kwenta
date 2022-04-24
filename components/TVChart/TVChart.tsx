import { useRef, useContext, useEffect } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { ChartBody } from 'sections/exchange/TradeCard/Charts/common/styles';

import {
	IChartingLibraryWidget,
	IPositionLineAdapter,
	widget,
} from '../../public/static/charting_library/charting_library';
import DataFeedFactory from './DataFeed';
import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';
import { formatNumber } from 'utils/formatters/number';
import { ChartPosition } from './types';

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
	activePosition?: ChartPosition;
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
	activePosition,
}: Props) {
	const _widget = useRef<IChartingLibraryWidget | null>(null);
	const _entryLine = useRef<IPositionLineAdapter | null | undefined>(null);
	const _liquidationLine = useRef<IPositionLineAdapter | null | undefined>(null);

	const { colors } = useContext(ThemeContext);
	let isL2 = useRecoilValue(isL2State);

	useEffect(() => {
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

	useEffect(() => {
		_widget.current?.onChartReady(() => {
			_entryLine.current?.remove?.();
			_liquidationLine.current?.remove?.();
			_entryLine.current = null;
			_liquidationLine.current = null;

			if (activePosition) {
				_entryLine.current = _widget.current
					?.chart()
					.createPositionLine()
					.setText('ENTRY: ' + formatNumber(activePosition.avgEntryPrice))
					.setTooltip('Average entry price')
					.setQuantity(formatNumber(activePosition.size))
					.setPrice(activePosition.avgEntryPrice.toNumber())
					.setExtendLeft(false)
					.setLineStyle(0)
					.setLineLength(25);

				if (activePosition.liquidationPrice) {
					_liquidationLine.current = _widget.current
						?.chart()
						.createPositionLine()
						.setText('LIQUIDATION: ' + formatNumber(activePosition.liquidationPrice))
						.setTooltip('Liquidation price')
						.setQuantity(formatNumber(activePosition.size))
						.setPrice(activePosition.liquidationPrice.toNumber())
						.setExtendLeft(false)
						.setLineStyle(0)
						.setLineColor(colors.common.primaryRed)
						.setBodyBorderColor(colors.common.primaryRed)
						.setQuantityBackgroundColor(colors.common.primaryRed)
						.setQuantityBorderColor(colors.common.primaryRed)
						.setLineLength(25);
				}
			}
		});
	}, [activePosition, colors.common.primaryRed]);

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
