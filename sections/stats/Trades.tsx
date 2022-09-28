import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetFuturesTradesStats } from 'queries/futures/useGetFuturesTradesStats';
import colors from 'styles/theme/colors/common';
import fonts from 'styles/theme/fonts';

import { initBarChart } from './initBarChart';
import type { EChartsOption } from './initBarChart';
import { TradesWrapper, Wrapper } from './stats.styles';
import { TimeRangeSwitcher } from './TimeRangeSwitcher';

let chartInstance: any;

export const Trades = () => {
	const { t } = useTranslation();

	const tradesRef = useRef<HTMLDivElement | null>(null);

	const { data: tradesData } = useGetFuturesTradesStats();

	useEffect(() => {
		if (!tradesRef || !tradesRef.current || !tradesData || !tradesData.length) {
			return;
		}

		const text = t('stats.trades.title');

		const data: any = [];
		tradesData?.forEach(({ date }) => data.push(date));
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
					max: 2000,
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
					data: tradesData?.map((data) => data.totalTrades),
					type: 'bar',
					name: 'Total Trades',
					itemStyle: {
						color: '#C9975B',
					},
					tooltip: {},
				},
				{
					name: 'Trades by Period',
					type: 'line',
					data: tradesData?.map((data) => data.tradesByPeriod),
					lineStyle: {
						color: '#02E1FF',
						cap: 'square',
					},
					symbol: 'none',
					yAxisIndex: 1,
					tooltip: {},
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
		chartInstance = initBarChart(tradesRef.current);
		chartInstance.setOption(option);
	}, [tradesRef, t, tradesData]);

	return (
		<Wrapper style={{ width: '100%' }}>
			<TimeRangeSwitcher />
			<TradesWrapper ref={tradesRef} />
		</Wrapper>
	);
};
