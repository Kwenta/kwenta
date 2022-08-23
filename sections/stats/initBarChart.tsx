import { BarChart, BarSeriesOption } from 'echarts/charts';
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
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
	GridComponent,
	TitleComponent,
	LegendComponent,
	TooltipComponent,
	BarChart,
	CanvasRenderer,
]);

export type EChartsOption = echarts.ComposeOption<
	| GridComponentOption
	| TitleComponentOption
	| LegendComponentOption
	| TooltipComponentOption
	| BarSeriesOption
>;

/**
 * initialize a bar chart.
 *
 * @param dom mount point of the chart.
 * @param option options of the chart.
 */
export const initBarChart = (dom: HTMLDivElement, option: EChartsOption) => {
	// do not use 'dark' theme here, or the external background css will not be effective.
	echarts.init(dom, 'light').setOption(option);
};
