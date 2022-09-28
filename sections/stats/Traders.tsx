import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetFuturesTradersStats } from 'queries/futures/useGetFuturesTradersStats';
import colors from 'styles/theme/colors/common';
import fonts from 'styles/theme/fonts';

import { initBarChart } from './initBarChart';
import type { EChartsOption } from './initBarChart';
import { TradersWrapper, Wrapper } from './stats.styles';
import { TimeRangeSwitcher } from './TimeRangeSwitcher';

let chartInstance: any;

export const Traders = () => {
	const { t } = useTranslation();

	const tradersRef = useRef<HTMLDivElement | null>(null);

	const { data: tradersData } = useGetFuturesTradersStats();

	useEffect(() => {
		if (!tradersRef || !tradersRef.current || !tradersData || !tradersData.length) {
			return;
		}

		const text = t('stats.traders.title');

		const data: any = [];
		tradersData?.forEach(({ date }) => data.push(date));
		const option: EChartsOption = {
			title: {
				text,
				left: 20,
				top: 40,
				itemGap: 10,
				textStyle: {
					color: colors.primaryWhite,
					fontFamily: fonts.regular,
					fontSize: 18,
				},
			},
			grid: {
				top: 137,
				bottom: 40,
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
			yAxis: [
				{
					type: 'value',
					splitLine: {
						lineStyle: {
							color: '#C9975B',
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
				{
					type: 'value',
					splitLine: {
						lineStyle: {
							color: '#C9975B',
						},
					},
					max: 1000,
					show: false,
				},
			],
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
					data: tradersData?.map((data) => data.totalUniqueTraders),
					type: 'bar',
					name: 'Unique Traders',
					itemStyle: {
						color: '#C9975B',
					},
				},
				{
					name: 'Traders by Period',
					type: 'line',
					data: tradersData?.map((data) => data.uniqueTradersByPeriod),
					lineStyle: {
						color: '#02E1FF',
						cap: 'square',
					},
					yAxisIndex: 1,
					symbol: 'none',
				},
			],
			legend: {
				icon: 'circle',
				top: 71,
				left: 20,
				textStyle: {
					color: colors.primaryWhite,
					fontFamily: fonts.regular,
					fontSize: 15,
				},
			},
		};

		if (chartInstance) {
			chartInstance.dispose();
		}
		chartInstance = initBarChart(tradersRef.current);
		chartInstance.setOption(option);
	}, [tradersRef, t, tradersData]);
	return (
		<Wrapper style={{ width: '100%' }}>
			<TimeRangeSwitcher />
			<TradersWrapper ref={tradersRef} />
		</Wrapper>
	);
};
