import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';

import { MiniLoader } from 'components/Loader';
import useStatsData from 'hooks/useStatsData';

import { initChart } from '../initChart';
import type { EChartsOption } from '../initChart';
import { ChartContainer, ChartHeader, ChartTitle, ChartWrapper } from '../stats.styles';
import { TimeframeSwitcher } from '../TimeframeSwitcher';

export const Trades = () => {
	const { t } = useTranslation();
	const theme = useTheme();
	const { volumeData, volumeIsLoading } = useStatsData();

	const ref = useRef<HTMLDivElement | null>(null);

	const { chart, defaultOptions } = useMemo(() => {
		if (chart) chart.dispose();
		return initChart(ref?.current, theme);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref?.current, theme]);

	useEffect(() => {
		if (!ref || !chart || !ref.current || !volumeData || !volumeData.length) {
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
				data: volumeData?.map((data) => data.date),
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
					data: volumeData?.map((data) => data.trades),
					type: 'bar',
					name: 'Trades',
					itemStyle: {
						color: '#C9975B',
					},
				},
				{
					data: volumeData?.map((data) => data.cumulativeTrades || 0),
					type: 'line',
					name: 'Cumulative Trades',
					lineStyle: {
						color: '#02E1FF',
					},
					symbol: 'none',
					yAxisIndex: 1,
				},
			],
		};

		chart.setOption(option);
	}, [ref, chart, t, volumeData, theme, defaultOptions]);

	return (
		<ChartContainer width={1}>
			<ChartHeader>
				<ChartTitle>
					{t('stats.trades.title')} {volumeIsLoading && <MiniLoader />}
				</ChartTitle>
				<TimeframeSwitcher />
			</ChartHeader>
			<ChartWrapper ref={ref} />
		</ChartContainer>
	);
};
