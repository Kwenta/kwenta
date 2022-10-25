import { NetworkId } from '@synthetixio/contracts-interface';
import { useRouter } from 'next/router';
import { useRef, useContext, useEffect, useCallback, useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { ThemeContext } from 'styled-components';
import { chain } from 'wagmi';

import Connector from 'containers/Connector';
import { ChartBody } from 'sections/exchange/TradeCard/Charts/common/styles';
import { currentThemeState } from 'store/ui';
import { formatNumber } from 'utils/formatters/number';

import {
	IChartingLibraryWidget,
	IPositionLineAdapter,
	widget,
} from '../../public/static/charting_library';
import { DEFAULT_RESOLUTION } from './constants';
import DataFeedFactory from './DataFeed';
import { ChartPosition } from './types';

export type ChartProps = {
	activePosition?: ChartPosition | null;
	potentialTrade?: ChartPosition | null;
	onChartReady?: () => void;
};

export type Props = ChartProps & {
	interval: string;
	containerId: string;
	libraryPath: string;
	fullscreen: boolean;
	autosize: boolean;
	studiesOverrides: Record<string, any>;
	overrides: Record<string, string>;
};

export function TVChart({
	interval = DEFAULT_RESOLUTION,
	containerId = 'tv_chart_container',
	libraryPath = '/static/charting_library/',
	fullscreen = false,
	autosize = true,
	studiesOverrides = {},
	activePosition,
	potentialTrade,
	onChartReady = () => {
		return;
	},
}: Props) {
	const currentTheme = useRecoilValue(currentThemeState);
	const _widget = useRef<IChartingLibraryWidget | null>(null);
	const _entryLine = useRef<IPositionLineAdapter | null | undefined>(null);
	const _liquidationLine = useRef<IPositionLineAdapter | null | undefined>(null);
	const _intervalId = useRef<number | null>(null);

	const router = useRouter();

	const { colors } = useContext(ThemeContext);
	const { network } = Connector.useContainer();

	const DEFAULT_OVERRIDES = {
		'paneProperties.background': colors.selectedTheme.background,
		'chartProperties.background': colors.selectedTheme.background,
		'paneProperties.backgroundType': 'solid',
	};

	const [marketAsset, marketAssetLoaded] = useMemo(() => {
		return router.query.asset ? [router.query.asset, true] : [null, false];
	}, [router.query.asset]);

	useEffect(() => {
		const widgetOptions = {
			symbol: marketAsset + ':sUSD',
			datafeed: DataFeedFactory((network?.id ?? chain.optimism.id) as NetworkId, onSubscribe),
			interval: interval,
			container: containerId,
			library_path: libraryPath,
			locale: 'en',
			enabled_features: ['hide_left_toolbar_by_default'],
			disabled_features: [
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
			overrides: DEFAULT_OVERRIDES,
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
			if (_intervalId.current) {
				clearInterval(_intervalId.current);
			}
		};

		clearExistingWidget();

		// @ts-ignore complains about `container` item missing
		const tvWidget = new widget(widgetOptions);
		_widget.current = tvWidget;

		_widget.current?.onChartReady(() => {
			_widget.current?.applyOverrides(DEFAULT_OVERRIDES);
			onChartReady();
		});

		return () => {
			clearExistingWidget();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network?.id as NetworkId, currentTheme, marketAssetLoaded]);

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

	useEffect(() => {
		_widget.current?.onChartReady(() => {
			const symbolInterval = _widget.current?.symbolInterval();
			_widget.current?.setSymbol(
				marketAsset + ':sUSD',
				symbolInterval?.interval ?? DEFAULT_RESOLUTION,
				() => {}
			);
		});
	}, [marketAsset]);

	const onSubscribe = useCallback((newIntervalId: number) => {
		_intervalId.current = newIntervalId;
	}, []);

	return <ChartBody id={containerId} />;
}
