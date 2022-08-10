import { BarChart, BarSeriesOption } from 'echarts/charts';
import {
	GridComponent,
	GridComponentOption,
	TitleComponent,
	LegendComponent,
	TooltipComponent,
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

type EChartsOption = echarts.ComposeOption<GridComponentOption | BarSeriesOption>;

export const initBarChart = (dom: HTMLDivElement) => {
	// do not use 'dark' theme here, or the external background css will not be effective.
	const chart = echarts.init(dom, 'light');

	let option: EChartsOption;

	option = {
		title: {
			text: 'Volumn',
			textStyle: {},
			left: 20,
			top: 20,
		},
		legend: {
			icon: 'circle',
			top: 50,
			left: 20,
		},
		grid: {
			top: 120,
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

	option && chart.setOption(option);
};
