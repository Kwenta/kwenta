import { useRef, useContext, useEffect, useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ThemeContext } from 'styled-components';

import { ChartBody } from 'sections/exchange/TradeCard/Charts/common/styles';
import { currentThemeState } from 'store/ui';
import { networkState } from 'store/wallet';
import { formatNumber } from 'utils/formatters/number';

import {
	IChartingLibraryWidget,
	IPositionLineAdapter,
	widget,
} from '../../public/static/charting_library';
import DataFeedFactory from './DataFeed';
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
	interval = '15',
	containerId = 'tv_chart_container',
	libraryPath = '/static/charting_library/',
	fullscreen = false,
	autosize = true,
	studiesOverrides = {},
	overrides,
	activePosition,
	potentialTrade,
}: Props) {
	const [lastSubscription, setLastSubscription] = useState(0);
	const [intervalId, setIntervalId] = useState(0);
	const currentTheme = useRecoilValue(currentThemeState);
	const _widget = useRef<IChartingLibraryWidget | null>(null);
	const _entryLine = useRef<IPositionLineAdapter | null | undefined>(null);
	const _liquidationLine = useRef<IPositionLineAdapter | null | undefined>(null);

	const { colors } = useContext(ThemeContext);
	let network = useRecoilValue(networkState);

	useEffect(() => {
		const widgetOptions = {
			symbol: baseCurrencyKey + ':' + quoteCurrencyKey,
			datafeed: DataFeedFactory(network.id, onSubscribe),
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
	}, [baseCurrencyKey, quoteCurrencyKey, network.id, currentTheme]);

	useEffect(() => {
		_widget.current?.onChartReady(() => {
			_widget.current?.chart().dataReady(() => {
				_entryLine.current?.remove?.();
				_liquidationLine.current?.remove?.();
				_entryLine.current = null;
				_liquidationLine.current = null;

				const setPositionLines = (position: ChartPosition, active: boolean) => {
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
				};

				// Always show potential over existing
				if (potentialTrade) {
					setPositionLines(potentialTrade, false);
				} else if (activePosition) {
					setPositionLines(activePosition, true);
				}
			});
		});
	}, [activePosition, potentialTrade, colors.common.primaryRed]);

	const onSubscribe = useCallback(
		(newIntervalId: number) => {
			setLastSubscription(newIntervalId);
		},
		[setLastSubscription]
	);

	useEffect(() => {
		clearInterval(intervalId);
		setIntervalId(lastSubscription);
		const newDataFeed = DataFeedFactory(network.id, onSubscribe);
		if (_widget.current) {
			// @ts-ignore
			_widget.current._options.datafeed = newDataFeed;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lastSubscription, onSubscribe, network.id]);

	return <ChartBody id={containerId} />;
}
