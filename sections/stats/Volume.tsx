import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetFuturesVolumesStats } from 'queries/futures/useGetFuturesVolumesStats';
import colors from 'styles/theme/colors/common';
import fonts from 'styles/theme/fonts';

import { initBarChart } from './initBarChart';
import type { EChartsOption } from './initBarChart';
import { VolumeWrapper, Wrapper } from './stats.styles';
import { TimeRangeSwitcher } from './TimeRangeSwitcher';

let chartInstance: any;

export const Volume = () => {
	const { t } = useTranslation();

	const volumeRef = useRef<HTMLDivElement | null>(null);

	// show 24h data by default
	const [is24H, setIs24H] = useState<boolean>(true);
	const [isWeek, setIsWeek] = useState<boolean>(false);
	const [isMonth, setIsMonth] = useState<boolean>(false);
	const [isMax, setIsMax] = useState<boolean>(false);

	const { data: volumeData } = useGetFuturesVolumesStats();

	useEffect(() => {
		if (!volumeRef || !volumeRef.current || !volumeData || !volumeData.length) {
			return;
		}

		const text = t('stats.volume.title');
		const subtext = '$40,461,472';

		const data: any = [];
		volumeData?.forEach(({ date }) => data.push(date));
		const option: EChartsOption = {
			title: {
				text,
				subtext,
				left: 20,
				top: 40,
				itemGap: 10,
				textStyle: {
					color: colors.primaryWhite,
					fontFamily: fonts.regular,
					fontSize: 18,
				},
				subtextStyle: {
					color: colors.primaryWhite,
					fontFamily: fonts.monoBold,
					fontSize: 28,
				},
			},
			grid: {
				top: 137,
				right: 100,
				bottom: 60,
				left: 40,
			},
			xAxis: {
				type: 'category',
				data,
				axisLabel: {
					color: '#ECE8E3',
				},
				axisTick: {
					show: false,
				},
			},
			yAxis: {
				type: 'value',
				splitLine: {
					lineStyle: {
						color: '#C9975B',
					},
				},
				position: 'right',
				axisLabel: {
					formatter: (value: any) => {
						return (value === 0 ? '' : '$') + value.toLocaleString();
					},
				},
			},
			tooltip: {
				show: true,
				backgroundColor: '#0C0C0C',
				extraCssText:
					'box-shadow: 0px 24px 40px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.08), inset 0px 0px 20px rgba(255, 255, 255, 0.03);backdrop-filter: blur(60px);/* Note: backdrop-filter has minimal browser support */border-radius: 15px;',
				trigger: 'axis',
				axisPointer: {
					type: 'cross',
				},
			},
			series: [
				{
					data: volumeData?.map((data) => data.volumes),
					type: 'bar',
					name: 'Total Trades',
					itemStyle: {
						color: '#C9975B',
					},
					tooltip: {},
				},
			],
		};

		if (chartInstance) {
			chartInstance.dispose();
		}
		chartInstance = initBarChart(volumeRef.current);
		chartInstance.setOption(option);
	}, [volumeRef, t, volumeData]);

	return (
		<Wrapper>
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
			<VolumeWrapper ref={volumeRef} />
		</Wrapper>
	);
};
