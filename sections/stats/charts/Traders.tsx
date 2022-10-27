import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';

import { MiniLoader } from 'components/Loader';
import useStatsData from 'hooks/useStatsData';

import { initChart } from '../initChart';
import type { EChartsOption } from '../initChart';
import { ChartContainer, ChartHeader, ChartTitle, ChartWrapper } from '../stats.styles';
import { TimeframeSwitcher } from '../TimeframeSwitcher';

export const Traders = () => {
	const { t } = useTranslation();
	const theme = useTheme();
	const { tradersData, tradersIsLoading } = useStatsData();

	const ref = useRef<HTMLDivElement | null>(null);

	const { chart, defaultOptions } = useMemo(() => {
		if (chart) chart.dispose();
		return initChart(ref?.current, theme);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref?.current, theme]);

	useEffect(() => {
		if (!ref || !chart || !ref.current || !tradersData || !tradersData.length) {
			return;
		}

		const option: EChartsOption = {
			...defaultOptions,
			title: {
				...defaultOptions.title,
			},
			xAxis: {
				...defaultOptions.xAxis,
				type: 'category',
				data: tradersData?.map((data) => data.date),
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
					data: tradersData?.map((data) => data.uniqueTradersByPeriod),
					type: 'bar',
					name: 'Traders',
					itemStyle: {
						color: '#C9975B',
					},
				},
				{
					data: tradersData?.map((data) => data.totalUniqueTraders),
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
		};

		chart.setOption(option);
	}, [ref, chart, t, tradersData, theme, defaultOptions]);

	return (
		<ChartContainer width={1}>
			<ChartHeader>
				<ChartTitle>
					{t('stats.traders.title')} {tradersIsLoading && <MiniLoader />}
				</ChartTitle>
				<TimeframeSwitcher />
			</ChartHeader>
			<ChartWrapper ref={ref} />
		</ChartContainer>
	);
};
