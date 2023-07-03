import { NetworkId, ConditionalOrder, PricesListener } from '@kwenta/sdk/types'
import { formatOrderDisplayType, formatNumber } from '@kwenta/sdk/utils'
import {
	ChartingLibraryWidgetOptions,
	IChartingLibraryWidget,
	IPositionLineAdapter,
	ResolutionString,
	TimeFrameItem,
	widget,
} from 'charting_library/charting_library'
import { useRouter } from 'next/router'
import { useRef, useContext, useEffect, useCallback, useMemo } from 'react'
import { ThemeContext } from 'styled-components'

import Connector from 'containers/Connector'
import { chain } from 'containers/Connector/config'
import { ChartBody } from 'sections/exchange/TradeCard/Charts/common/styles'
import { useAppSelector } from 'state/hooks'
import { selectCurrentTheme } from 'state/preferences/selectors'
import sdk from 'state/sdk'
import darkTheme from 'styles/theme/colors/dark'

import { DEFAULT_RESOLUTION } from './constants'
import DataFeedFactory from './DataFeed'
import { ChartPosition } from './types'
import { loadChartState, saveChartState } from './utils'

export type ChartProps = {
	activePosition?: ChartPosition | null
	potentialTrade?: ChartPosition | null
	openOrders: ConditionalOrder[]
	showOrderLines: boolean
	onChartReady?: () => void
	onToggleShowOrderLines?: () => void
}

export type Props = ChartProps & {
	interval: string
	containerId: string
	libraryPath: string
	fullscreen: boolean
	autosize: boolean
	studiesOverrides: Record<string, any>
	overrides: Record<string, string>
}

export function TVChart({
	interval = DEFAULT_RESOLUTION,
	containerId = 'tv_chart_container',
	libraryPath = '/static/charting_library/',
	fullscreen = false,
	autosize = true,
	studiesOverrides = {},
	activePosition,
	potentialTrade,
	openOrders,
	showOrderLines,
	onToggleShowOrderLines,
	onChartReady = () => {
		return
	},
}: Props) {
	const currentTheme = useAppSelector(selectCurrentTheme)
	const _widget = useRef<IChartingLibraryWidget | null>(null)
	const _entryLine = useRef<IPositionLineAdapter | null | undefined>(null)
	const _liquidationLine = useRef<IPositionLineAdapter | null | undefined>(null)
	const _oderLineRefs = useRef<IPositionLineAdapter[]>([])
	const _toggleLinesButton = useRef<HTMLElement | null>(null)
	const _toggleListener = useRef<(() => void) | null>(null)
	const _priceListener = useRef<PricesListener | undefined>()

	const router = useRouter()

	const { colors } = useContext(ThemeContext)
	const { network } = Connector.useContainer()

	const DEFAULT_OVERRIDES = {
		'paneProperties.background': colors.selectedTheme.newTheme.containers.primary.background,
		'chartProperties.background': colors.selectedTheme.newTheme.containers.primary.background,
		'paneProperties.backgroundType': 'solid',
	}

	const [marketAsset, marketAssetLoaded] = useMemo(() => {
		return router.query.asset ? [router.query.asset, true] : [null, false]
	}, [router.query.asset])

	const clearOrderLines = () => {
		_oderLineRefs.current?.forEach((ref) => {
			ref?.remove()
		})
		_oderLineRefs.current = []
	}

	useEffect(() => {
		return () => {
			if (_priceListener.current) {
				sdk.prices.removePricesListener(_priceListener.current)
			}
		}
	}, [])

	const renderOrderLines = () => {
		_widget.current?.onChartReady(() => {
			_widget.current?.chart().dataReady(() => {
				clearOrderLines()
				_oderLineRefs.current = openOrders.reduce<IPositionLineAdapter[]>((acc, order) => {
					if (order.targetPrice) {
						const color = order.isSlTp
							? colors.selectedTheme.chartLine.default
							: order.side === 'long'
							? colors.selectedTheme.chartLine.long
							: colors.selectedTheme.chartLine.short

						const orderLine = _widget.current
							?.chart()
							.createPositionLine()
							.setText(formatOrderDisplayType(order.orderType, order.reduceOnly))
							.setTooltip('Average entry price')
							.setQuantity(order.isSlTp ? '100%' : formatNumber(order.size.abs()))
							.setPrice(order.targetPrice?.toNumber())
							.setExtendLeft(false)
							.setQuantityTextColor(colors.white)
							.setBodyTextColor(darkTheme.black)
							.setLineStyle(2)
							.setLineColor(color)
							.setBodyBorderColor(color)
							.setQuantityBackgroundColor(color)
							.setQuantityBorderColor(color)
							.setLineLength(25)
						if (orderLine) {
							acc.push(orderLine)
						}
					}
					return acc
				}, [])
			})
		})
	}

	const onToggleOrderLines = () => {
		if (_oderLineRefs.current.length) {
			clearOrderLines()
		} else {
			renderOrderLines()
		}
	}

	useEffect(() => {
		if (showOrderLines) {
			renderOrderLines()
		}
		// eslint-disable-next-line
	}, [openOrders])

	useEffect(() => {
		if (_toggleLinesButton.current) {
			_toggleLinesButton.current.textContent = showOrderLines ? 'Hide Orders' : 'Show Orders'
		}
		if (_widget.current) {
			onToggleOrderLines()
		}
		// eslint-disable-next-line
	}, [showOrderLines])

	useEffect(() => {
		const chartData = loadChartState()

		const widgetOptions: ChartingLibraryWidgetOptions = {
			symbol: marketAsset + ':sUSD',
			datafeed: DataFeedFactory((network?.id ?? chain.optimism.id) as NetworkId, onSubscribe),
			interval: interval as ResolutionString,
			container: containerId,
			library_path: libraryPath,
			locale: 'en',
			disabled_features: [
				'header_compare',
				'hide_left_toolbar_by_default',
				'study_templates',
				'header_symbol_search',
				'display_market_status',
				'create_volume_indicator_by_default',
			],
			fullscreen: fullscreen,
			autosize: autosize,
			studies_overrides: studiesOverrides,
			theme: 'Dark',
			custom_css_url: './theme.css',
			loading_screen: {
				backgroundColor: colors.selectedTheme.newTheme.containers.primary.background,
			},
			overrides: DEFAULT_OVERRIDES,
			toolbar_bg: colors.selectedTheme.newTheme.containers.primary.background,
			time_frames: [
				{ text: '4H', resolution: '5', description: '4 hours' },
				{ text: '12H', resolution: '5', description: '1 Day' },
				{ text: '1D', resolution: '15', description: '1 Day' },
				{ text: '5D', resolution: '15', description: '5 Days' },
				{ text: '1M', resolution: '1H', description: '1 Month' },
				{ text: '3M', resolution: '1H', description: '3 Months' },
			] as TimeFrameItem[],
			saved_data: chartData,
		}

		const clearExistingWidget = () => {
			if (_widget.current !== null) {
				clearOrderLines()
				_widget.current.remove()
				_widget.current = null
			}
			if (_priceListener.current) {
				sdk.prices.removePricesListener(_priceListener.current)
			}
		}

		clearExistingWidget()

		// @ts-ignore complains about `container` item missing
		const tvWidget = new widget(widgetOptions)
		_widget.current = tvWidget

		_widget.current?.onChartReady(() => {
			_widget.current?.applyOverrides(DEFAULT_OVERRIDES)
			onChartReady()
		})

		_widget.current?.headerReady().then(() => {
			if (!_widget.current || !onToggleShowOrderLines) return
			_toggleLinesButton.current = _widget.current.createButton()
			_toggleLinesButton.current.classList.add('custom-button')
			_toggleLinesButton.current.setAttribute('title', 'Hide / Show Orders')
			_toggleLinesButton.current.textContent = showOrderLines ? 'Hide Orders' : 'Show Orders'
			_toggleLinesButton.current.addEventListener('click', onToggleShowOrderLines)
			_toggleListener.current = onToggleShowOrderLines
		})

		return () => {
			clearExistingWidget()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network?.id as NetworkId, currentTheme, marketAssetLoaded])

	useEffect(() => {
		if (onToggleShowOrderLines) {
			_toggleListener.current &&
				_toggleLinesButton.current?.removeEventListener('click', _toggleListener.current)
			_toggleLinesButton.current?.addEventListener('click', onToggleShowOrderLines)
			_toggleListener.current = onToggleShowOrderLines
		}
	}, [onToggleShowOrderLines])

	useEffect(() => {
		_widget.current?.onChartReady(() => {
			_widget.current?.chart().dataReady(() => {
				_entryLine.current?.remove?.()
				_liquidationLine.current?.remove?.()
				_entryLine.current = null
				_liquidationLine.current = null
				const setPositionLines = (position: ChartPosition, active: boolean) => {
					_entryLine.current = _widget.current
						?.chart()
						.createPositionLine()
						.setText('Entry')
						.setTooltip('Average entry price')
						.setQuantity(formatNumber(position.size.abs()))
						.setPrice(position.price.toNumber())
						.setExtendLeft(false)
						.setBodyTextColor(darkTheme.black)
						.setLineStyle(active ? 0 : 2)
						.setLineLength(25)
					if (position.liqPrice) {
						_liquidationLine.current = _widget.current
							?.chart()
							.createPositionLine()
							.setText('Liquidation')
							.setTooltip('Liquidation price')
							.setQuantity(formatNumber(position.size.abs()))
							.setPrice(position.liqPrice.toNumber())
							.setExtendLeft(false)
							.setBodyTextColor(darkTheme.black)
							.setLineStyle(active ? 0 : 2)
							.setLineColor(colors.selectedTheme.orange)
							.setBodyBorderColor(colors.selectedTheme.orange)
							.setQuantityBackgroundColor(colors.selectedTheme.orange)
							.setQuantityBorderColor(colors.selectedTheme.orange)
							.setLineLength(25)
					}
				}
				// Always show potential over existing
				if (potentialTrade) {
					setPositionLines(potentialTrade, false)
				} else if (activePosition) {
					setPositionLines(activePosition, true)
				}
			})
		})
		// eslint-disable-next-line
	}, [activePosition, potentialTrade])

	useEffect(() => {
		_widget.current?.onChartReady(() => {
			const symbolInterval = _widget.current?.symbolInterval()
			_widget.current?.setSymbol(
				marketAsset + ':sUSD',
				symbolInterval?.interval ?? DEFAULT_RESOLUTION,
				() => {}
			)
		})
	}, [marketAsset])

	useEffect(() => {
		const handleAutoSave = () => {
			_widget.current?.save(saveChartState)
		}

		_widget.current?.subscribe('onAutoSaveNeeded', handleAutoSave)

		return () => {
			_widget.current?.unsubscribe('onAutoSaveNeeded', handleAutoSave)
		}
	}, [])

	const onSubscribe = useCallback((priceListener: PricesListener) => {
		_priceListener.current = priceListener
	}, [])

	return <ChartBody id={containerId} />
}
