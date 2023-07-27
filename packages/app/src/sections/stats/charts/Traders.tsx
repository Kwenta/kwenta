import { formatShortDateUTC, toJSTimestamp } from '@kwenta/sdk/utils'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import { MiniLoader } from 'components/Loader'
import useStatsData from 'hooks/useStatsData'

import { initChart } from '../initChart'
import type { EChartsOption } from '../initChart'
import { ChartContainer, ChartHeader, ChartTitle, ChartWrapper } from '../stats.styles'
import { TimeframeSwitcher } from '../TimeframeSwitcher'

export const Traders = () => {
	const { t } = useTranslation()
	const theme = useTheme()
	const { dailyStatsData, dailyStatsIsLoading } = useStatsData()

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

	useEffect(() => {
		if (!ref || !chart || !ref.current || !dailyStatsData || !dailyStatsData.length) {
			return
		}

		const option: EChartsOption = {
			...defaultOptions,
			title: {
				...defaultOptions.title,
			},
			xAxis: {
				...defaultOptions.xAxis,
				type: 'category',
				data: dailyStatsData.map(({ timestamp }) => formatShortDateUTC(toJSTimestamp(timestamp))),
			},
			yAxis: [
				{
					type: 'value',
					alignTicks: true,
					splitLine: {
						lineStyle: {
							color: '#39332D',
						},
					},
					position: 'left',
				},
				{
					type: 'value',
					alignTicks: true,
					splitLine: {
						lineStyle: {
							color: '#39332D',
						},
					},
					axisLabel: {
						formatter: (value: any) => {
							const val = Math.floor(value / 1000)
							return val + (val === 0 ? '' : 'K')
						},
					},
					position: 'right',
				},
			],
			series: [
				{
					data: dailyStatsData.map((data) => data.uniqueTraders),
					type: 'bar',
					name: 'Traders',
					itemStyle: {
						color: '#C9975B',
					},
				},
				{
					data: dailyStatsData.map((data) => data.cumulativeTraders),
					type: 'line',
					name: 'Cumulative Traders',
					lineStyle: {
						color: '#02E1FF',
						cap: 'square',
					},
					symbol: 'none',
					yAxisIndex: 1,
				},
			],
		}

		chart.setOption(option)
		chart.resize()
	}, [ref, chart, t, dailyStatsData, theme, defaultOptions])

	return (
		<ChartContainer width={1}>
			<ChartHeader>
				<ChartTitle>
					{t('stats.traders.title')} {dailyStatsIsLoading && <MiniLoader />}
				</ChartTitle>
				<TimeframeSwitcher />
			</ChartHeader>
			<ChartWrapper ref={ref} />
		</ChartContainer>
	)
}
