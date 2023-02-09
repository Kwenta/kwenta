import { WeiSource } from '@synthetixio/wei';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';

import { MiniLoader } from 'components/Loader';
import useStatsData from 'hooks/useStatsData';
import { formatDollars } from 'utils/formatters/number';

import { initChart } from '../initChart';
import type { EChartsOption } from '../initChart';
import { ChartContainer, ChartHeader, ChartTitle, ChartWrapper } from '../stats.styles';
import { TimeframeSwitcher } from '../TimeframeSwitcher';

export const Volume = () => {
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
		if (!chart || !volumeData || !volumeData.length) {
			return;
		}

		const totalVolume = volumeData.reduce((acc, curr) => acc + curr.volume, 0);

		const subtext = formatDollars(totalVolume, { maxDecimals: 0 });

		const data: any = [];
		volumeData?.forEach(({ date }) => data.push(date));
		const option: EChartsOption = {
			...defaultOptions,
			title: {
				...defaultOptions.title,
				subtext,
			},
			xAxis: {
				...defaultOptions.xAxis,
				type: 'category',
				data,
			},
			yAxis: [
				{
					type: 'value',
					splitLine: {
						lineStyle: {
							color: '#39332D',
						},
					},
					position: 'right',
					axisLabel: {
						formatter: (value: WeiSource) =>
							formatDollars(value, { truncate: true, maxDecimals: 0 }),
					},
				},
			],
			series: [
				{
					data: volumeData?.map((data) => data.volume),
					type: 'bar',
					name: 'Total Volume',
					itemStyle: {
						color: theme.colors.common.primaryGold,
					},
				},
			],
			tooltip: {
				...defaultOptions.tooltip,
				valueFormatter: (value: WeiSource) => formatDollars(value, { maxDecimals: 0 }),
			},
			legend: undefined,
		};
		chart.setOption(option);
	}, [chart, t, volumeData, theme, defaultOptions]);

	return (
		<ChartContainer width={2}>
			<ChartHeader>
				<ChartTitle>
					{t('stats.volume.title')} {volumeIsLoading && <MiniLoader />}
				</ChartTitle>
				<TimeframeSwitcher />
			</ChartHeader>
			<ChartWrapper ref={ref} />
		</ChartContainer>
	);
};
