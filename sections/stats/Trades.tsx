import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';

import useStatsData from 'hooks/useStatsData';

import { initChart } from './initChart';
import type { EChartsOption } from './initChart';
import { ChartContainer, ChartWrapper } from './stats.styles';
import { TimeframeSwitcher } from './TimeframeSwitcher';

export const Trades = () => {
	const { t } = useTranslation();
	const theme = useTheme();
	const { tradesData } = useStatsData();

	const ref = useRef<HTMLDivElement | null>(null);

	const { chart, defaultOptions } = useMemo(() => {
		if (chart) chart.dispose();
		return initChart(ref?.current, theme);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref?.current, theme]);

	useEffect(() => {
		if (!ref || !chart || !ref.current || !tradesData || !tradesData.length) {
			return;
		}

		const text = t('stats.trades.title');

		const data: any = [];
		tradesData?.forEach(({ date }) => data.push(date));
		const option: EChartsOption = {
			...defaultOptions,
			title: {
				...defaultOptions.title,
				text,
			},
			xAxis: {
				...defaultOptions.xAxis,
				type: 'category',
				data,
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
							const val = Math.floor(value / 1000);
							return val + (val === 0 ? '' : 'K');
						},
					},
					position: 'right',
				},
			],
			series: [
				{
					data: tradesData?.map((data) => data.tradesByPeriod),
					type: 'bar',
					name: 'Trades by Period',
					itemStyle: {
						color: '#C9975B',
					},
				},
				{
					data: tradesData?.map((data) => data.totalTrades),
					type: 'line',
					name: 'Total Trades',
					lineStyle: {
						color: '#02E1FF',
						cap: 'square',
					},
					symbol: 'none',
					yAxisIndex: 1,
				},
			],
		};

		chart.setOption(option);
	}, [ref, chart, t, tradesData, theme, defaultOptions]);

	return (
		<ChartContainer width={1}>
			<TimeframeSwitcher />
			<ChartWrapper ref={ref} />
		</ChartContainer>
	);
};
