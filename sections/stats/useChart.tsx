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
import { useTheme } from 'styled-components';

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

/**
 * initialize a bar chart.
 *
 * @param dom mount point of the chart.
 * @param option options of the chart.
 */
export const useChart = (dom: HTMLElement | null): ECharts | null => {
	const { colors } = useTheme();
	if (!dom) return null;

	const defaultOptions: EChartsOption = {
		grid: {
			top: 137,
			right: 100,
			bottom: 60,
			left: 40,
		},
		xAxis: {
			axisLabel: {
				color: colors.common.primaryWhite,
			},
			axisTick: {
				show: false,
			},
		},
		yAxis: {
			splitLine: {
				lineStyle: {
					color: '#39332D',
				},
			},
			position: 'right',
			axisLabel: {
				color: colors.common.primaryWhite,
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
	};
	const chart = echarts.init(dom, { ...defaultOptions });
	return chart;
};
