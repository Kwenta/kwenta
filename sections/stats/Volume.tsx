import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components';

import useStatsData from 'hooks/useStatsData';

import { initChart } from './initChart';
import type { EChartsOption } from './initChart';
import { ChartContainer, ChartWrapper } from './stats.styles';
import { TimeRangeSwitcher } from './TimeRangeSwitcher';

export const Volume = () => {
	const { t } = useTranslation();
	const theme = useTheme();
	const { volumeData } = useStatsData();

	const ref = useRef<HTMLDivElement | null>(null);

	// show 24h data by default
	const [is24H, setIs24H] = useState<boolean>(true);
	const [isWeek, setIsWeek] = useState<boolean>(false);
	const [isMonth, setIsMonth] = useState<boolean>(false);
	const [isMax, setIsMax] = useState<boolean>(false);

	const { chart, defaultOptions } = useMemo(() => {
		if (chart) chart.dispose();
		return initChart(ref?.current, theme);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref?.current, theme]);

	useEffect(() => {
		if (!chart || !volumeData || !volumeData.length) {
			return;
		}

		const text = t('stats.volume.title');
		const subtext = '$40,461,472';

		const data: any = [];
		volumeData?.forEach(({ date }) => data.push(date));
		const option: EChartsOption = {
			...defaultOptions,
			title: {
				...defaultOptions.title,
				text,
				subtext,
			},
			grid: {
				...defaultOptions.grid,
				right: 100,
				left: 40,
			},
			xAxis: {
				...defaultOptions.xAxis,
				type: 'category',
				data,
			},
			yAxis: {
				...defaultOptions.yAxis,
				type: 'value',
				axisLabel: {
					color: theme.colors.common.primaryWhite,
					formatter: (value: any) => {
						return (value === 0 ? '' : '$') + value.toLocaleString();
					},
				},
			},
			series: [
				{
					data: volumeData?.map((data) => data.volumes),
					type: 'bar',
					name: 'Total Trades',
					itemStyle: {
						color: theme.colors.common.primaryGold,
					},
					tooltip: {},
				},
			],
		};
		chart.setOption(option);
	}, [chart, t, volumeData, theme, defaultOptions]);

	return (
		<ChartContainer width={2}>
			<TimeRangeSwitcher
				is24H={is24H}
				isWeek={isWeek}
				isMonth={isMonth}
				isMax={isMax}
				setIs24H={setIs24H}
				setIsWeek={setIsWeek}
				setIsMonth={setIsMonth}
				setIsMax={setIsMax}
			/>
			<ChartWrapper ref={ref} />
		</ChartContainer>
	);
};
