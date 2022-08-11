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

type EChartsOption = echarts.ComposeOption<
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
 * @param title chart title.
 * @param textStyle title style.
 * @param subtext optional
 * @param subtextStyle optional
 * @param legend optional
 */
export const initBarChart = (
	dom: HTMLDivElement,
	title: Extract<Pick<TitleComponentOption, 'text'>, string> | undefined,
	textStyle: Record<string, any> | null,
	subtext: string | undefined,
	subtextStyle: Record<string, any> | null,
	legend: LegendComponentOption | null
) => {
	// do not use 'dark' theme here, or the external background css will not be effective.
	const chart = echarts.init(dom, 'light');

	let option: EChartsOption;

	option = {
		grid: {
			top: 137,
		},
		xAxis: {
			type: 'category',
			data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
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
					color: ' #C9975B',
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
		],
	};

	if (title) {
		option = {
			...option,
			title: {
				text: title,
				left: 20,
				top: 40,
				itemGap: 10,
			},
		};
	}

	if (textStyle) {
		option.title = { ...option.title, textStyle };
	}

	if (subtext) {
		option.title = { ...option.title, subtext };
	}

	if (subtextStyle) {
		option.title = { ...option.title, subtextStyle };
	}

	if (legend) {
		option = { ...option, legend };
	}

	option && chart.setOption(option);
};
