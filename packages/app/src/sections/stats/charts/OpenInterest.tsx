import { MarketKeyByAsset, getDisplayAsset, formatDollars } from '@kwenta/sdk/utils'
import { WeiSource } from '@synthetixio/wei'
import { useEffect, useRef, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useStatsData from 'hooks/useStatsData'
import useWindowSize from 'hooks/useWindowSize'
import { SYNTH_ICONS } from 'utils/icons'

import { initChart } from '../initChart'
import type { EChartsOption } from '../initChart'
import { ChartContainer, ChartHeader, ChartTitle, ChartWrapper } from '../stats.styles'

const displayAssetLimits = {
	mobile: 4,
	tablet: 14,
	desktop: 24,
}

type RichLabel = {
	width: number
	height: number
	backgroundColor: {
		image: any
	}
}

type RichLabelMap = Record<string, RichLabel>

export const OpenInterest = () => {
	const { t } = useTranslation()
	const theme = useTheme()

	const { openInterestData } = useStatsData()
	const { deviceType } = useWindowSize()

	const ref = useRef<HTMLDivElement | null>(null)

	const [chart, setChart] = useState<any>(null)
	const [defaultOptions, setDefaultOptions] = useState<any>(null)

	useEffect(() => {
		if (chart) chart.dispose()
		const result = initChart(ref?.current, theme)
		setChart(result.chart)
		setDefaultOptions(result.defaultOptions)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [theme])

	const openInterestStats = useMemo(() => {
		const limit = displayAssetLimits[deviceType] || displayAssetLimits['desktop']

		const sortedData = openInterestData
			.map(({ asset, openInterest }) => ({
				asset: getDisplayAsset(asset) ?? asset,
				openInterest,
				icon: SYNTH_ICONS[MarketKeyByAsset[asset]],
				richLabel: {
					width: 36,
					height: 36,
					backgroundColor: {
						image: SYNTH_ICONS[MarketKeyByAsset[asset]],
					},
				} as RichLabel,
			}))
			.sort((a, b) => b.openInterest - a.openInterest)

		const others = {
			asset: 'Others',
			openInterest: sortedData.slice(limit).reduce((total, item) => total + item.openInterest, 0),
			richLabel: {
				height: 36,
			} as RichLabel,
		}

		return others.openInterest > 0
			? [...sortedData.slice(0, limit), others]
			: sortedData.slice(0, limit)
	}, [deviceType, openInterestData])

	useEffect(() => {
		if (!ref || !chart || !ref.current || !openInterestData || !openInterestData.length) {
			return
		}

		const totalOI = openInterestData.reduce((acc, curr) => acc + curr.openInterest, 0)
		const subtext = formatDollars(totalOI, { maxDecimals: 0 })

		const richLabels = openInterestStats.reduce((acc, openInterestStat) => {
			acc[openInterestStat.asset] = openInterestStat.richLabel
			return acc
		}, {} as RichLabelMap)

		const option: EChartsOption = {
			...defaultOptions,
			title: {
				...defaultOptions.title,
				subtext,
			},
			xAxis: {
				type: 'category',
				data: openInterestStats.map(({ asset }) => asset),
				axisLabel: {
					formatter: (market: any) => {
						return [`{${market}| }`, `{syntheticAsset|${market}}`].join('\n')
					},
					rich: {
						syntheticAsset: {
							fontFamily: theme.fonts.regular,
							fontSize: 12,
							color: theme.colors.common.primaryWhite,
							width: 35,
							height: 23,
							padding: [9, 0, 0, 0],
						},
						...richLabels,
					},
					interval: 0,
				},
				axisTick: {
					show: false,
				},
			},
			yAxis: {
				type: 'value',
				splitLine: {
					lineStyle: {
						color: '#39332D',
					},
				},
				axisLabel: {
					formatter: (value: WeiSource) =>
						formatDollars(value, { truncateOver: 1e3, maxDecimals: 0 }),
				},
				position: 'right',
			},
			series: [
				{
					data: openInterestStats.map(({ openInterest }) => openInterest),
					type: 'bar',
					name: 'Open Interest',
					itemStyle: {
						color: '#C9975B',
					},
					label: {
						formatter: (value: WeiSource) => formatDollars(value, { maxDecimals: 0 }),
					},
				},
			],
			tooltip: {
				...defaultOptions.tooltip,
				valueFormatter: (value: WeiSource) => formatDollars(value, { maxDecimals: 0 }),
			},
			legend: undefined,
		}

		chart.setOption(option)
		chart.resize()
	}, [ref, chart, t, openInterestData, openInterestStats, theme, defaultOptions])

	return (
		<StyledChartContainer width={2}>
			<ChartHeader>
				<ChartTitle>{t('stats.open-interest.title')}</ChartTitle>
			</ChartHeader>
			<ChartWrapper ref={ref} />
		</StyledChartContainer>
	)
}

const StyledChartContainer = styled(ChartContainer)`
	overflow: scroll;
`
