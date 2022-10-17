import { BarChart, LineChart } from 'echarts/charts';
import type { BarSeriesOption, LineSeriesOption } from 'echarts/charts';
import {
	GridComponent,
	TitleComponent,
	LegendComponent,
	TooltipComponent,
} from 'echarts/components';
import type {
	GridComponentOption,
	TitleComponentOption,
	LegendComponentOption,
	TooltipComponentOption,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { ECharts } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

import { ThemeInterface } from 'styles/theme';

echarts.use([
	GridComponent,
	TitleComponent,
	LegendComponent,
	TooltipComponent,
	BarChart,
	LineChart,
	CanvasRenderer,
]);

export type EChartsOption = echarts.ComposeOption<
	| GridComponentOption
	| TitleComponentOption
	| LegendComponentOption
	| TooltipComponentOption
	| BarSeriesOption
	| LineSeriesOption
>;

type ChartSpec = { chart: ECharts | null; defaultOptions: EChartsOption };

/**
 * initialize a bar chart.
 *
 * @param dom mount point of the chart.
 * @param option options of the chart.
 */
export const initChart = (dom: HTMLElement | null, theme: ThemeInterface): ChartSpec => {
	if (!dom) return { chart: null, defaultOptions: {} };

	const defaultOptions: EChartsOption = {
		title: {
			left: 20,
			top: 20,
			itemGap: 10,
			textStyle: {
				color: theme.colors.selectedTheme.white,
				fontFamily: theme.fonts.regular,
				fontSize: 18,
			},
			subtextStyle: {
				color: theme.colors.selectedTheme.white,
				fontFamily: theme.fonts.monoBold,
				fontSize: 28,
			},
		},
		grid: {
			top: 100,
			bottom: 60,
		},
		xAxis: {
			axisLabel: {
				color: theme.colors.common.primaryWhite,
			},
			axisTick: {
				show: false,
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
		legend: {
			icon: 'circle',
			top: 50,
			left: 20,
			textStyle: {
				color: theme.colors.common.primaryWhite,
				fontFamily: theme.fonts.regular,
				fontSize: 15,
			},
		},
	};
	const chart = echarts.init(dom);
	return { chart, defaultOptions };
};
