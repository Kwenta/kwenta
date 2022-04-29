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

export type ChartProps = {
	baseCurrencyKey: string;
	quoteCurrencyKey: string;
	activePosition?: ChartPosition | null;
	potentialTrade?: ChartPosition | null;
};

type Props = ChartProps & {
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
	activePosition,
	potentialTrade,
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

			const setPositionLines = (position: ChartPosition, active: boolean) => {
				_widget.current?.chart().dataReady(() => {
					_entryLine.current = _widget.current
						?.chart()
						.createPositionLine()
						.setText('ENTRY: ' + formatNumber(position.price))
						.setTooltip('Average entry price')
						.setQuantity(formatNumber(position.size.abs()))
						.setPrice(position.price.toNumber())
						.setExtendLeft(false)
						.setLineStyle(active ? 0 : 2)
						.setLineLength(25);

					if (position.liqPrice) {
						_liquidationLine.current = _widget.current
							?.chart()
							.createPositionLine()
							.setText('LIQUIDATION: ' + formatNumber(position.liqPrice))
							.setTooltip('Liquidation price')
							.setQuantity(formatNumber(position.size.abs()))
							.setPrice(position.liqPrice.toNumber())
							.setExtendLeft(false)
							.setLineStyle(active ? 0 : 2)
							.setLineColor(colors.common.primaryRed)
							.setBodyBorderColor(colors.common.primaryRed)
							.setQuantityBackgroundColor(colors.common.primaryRed)
							.setQuantityBorderColor(colors.common.primaryRed)
							.setLineLength(25);
					}
				});
			};

			if (activePosition) {
				setPositionLines(activePosition, true);
			} else if (potentialTrade) {
				setPositionLines(potentialTrade, false);
			}
		});
	}, [activePosition, potentialTrade, colors.common.primaryRed]);

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
