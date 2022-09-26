import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

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

	useEffect(() => {
		const text = t('stats.traders.title');

		const data = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
				bottom: 160,
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
			},
			tooltip: {
				show: true,
				backgroundColor: '#0C0C0C',
				extraCssText:
					'box-shadow: 0px 24px 40px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.08), inset 0px 0px 20px rgba(255, 255, 255, 0.03);backdrop-filter: blur(60px);/* Note: backdrop-filter has minimal browser support */border-radius: 15px;',
			},
			series: [
				{
					data: [120, 200, 150, 80, 70, 110, 130],
					type: 'bar',
					name: 'Total Trades',
					itemStyle: {
						color: '#C9975B',
					},
				},
				{
					name: 'Traders by Period',
					type: 'line',
					data: [20, 22, 33, 45, 63, 102, 20, 234, 230, 165, 120, 62],
					lineStyle: {
						color: '#02E1FF',
						cap: 'square',
					},
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

		if (tradersRef?.current) {
			if (chartInstance) {
				chartInstance.dispose();
			}
			chartInstance = initBarChart(tradersRef.current);
			chartInstance.setOption(option);
		}
	}, [tradersRef, t]);
	return (
		<Wrapper style={{ width: '100%' }}>
			<TimeRangeSwitcher />
			<TradersWrapper ref={tradersRef} />
		</Wrapper>
	);
};
