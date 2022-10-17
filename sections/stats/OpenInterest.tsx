import { WeiSource } from '@synthetixio/wei';
import { useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import useStatsData from 'hooks/useStatsData';
import { formatDollars } from 'utils/formatters/number';
import { SYNTH_ICONS } from 'utils/icons';

import { initChart } from './initChart';
import type { EChartsOption } from './initChart';
import { ChartContainer, ChartWrapper } from './stats.styles';

export const OpenInterest = () => {
	const { t } = useTranslation();
	const theme = useTheme();

	const { futuresMarkets, openInterestData } = useStatsData();

	const ref = useRef<HTMLDivElement | null>(null);

	const { chart, defaultOptions } = useMemo(() => {
		if (chart) chart.dispose();
		return initChart(ref?.current, theme);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref?.current, theme]);

	const marketsWithIcons = useMemo(() => {
		const temp: Record<string, { icon: any }> = {};
		futuresMarkets.forEach(({ asset }) => {
			temp[asset] = {
				icon: SYNTH_ICONS[asset.startsWith('s') ? asset : `s${asset}`],
			};
		});
		return temp;
	}, [futuresMarkets]);

	const richMarketsLabel = useMemo(() => {
		const temp: Record<
			string,
			{
				width: number;
				height: number;
				backgroundColor: { image: any };
			}
		> = {};
		futuresMarkets.forEach(({ asset }) => {
			temp[asset] = {
				width: 40,
				height: 40,
				backgroundColor: {
					image: SYNTH_ICONS[asset.startsWith('s') ? asset : `s${asset}`],
				},
			};
		});
		return temp;
	}, [futuresMarkets]);

	useEffect(() => {
		if (!ref || !chart || !ref.current || !openInterestData || !openInterestData.length) {
			return;
		}

		const totalOI = openInterestData.reduce((acc, curr) => acc + curr, 0);

		const text = t('stats.open-interest.title');
		const subtext = formatDollars(totalOI, { maxDecimals: 0 });

		const data = Object.keys(marketsWithIcons);
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
				type: 'category',
				data,
				axisLabel: {
					formatter: (sAsset: any) => {
						return [`{${sAsset}| }`, `{syntheticAsset|${sAsset}}`].join('\n');
					},
					rich: {
						syntheticAsset: {
							fontFamily: theme.fonts.regular,
							fontSize: 15,
							color: theme.colors.common.primaryWhite,
							width: 35,
							height: 23,
							padding: [9, 0, 0, 0],
						},
						...richMarketsLabel,
					},
					interval: 0,
				},
				axisTick: {
					show: false,
				},
			},
			yAxis: {
				type: 'value',
				splitLine: {
					lineStyle: {
						color: '#39332D',
					},
				},
				axisLabel: {
					formatter: (value: WeiSource) =>
						formatDollars(value, { truncation: { divisor: 1e6, unit: 'M' }, maxDecimals: 1 }),
				},
				position: 'right',
			},
			series: [
				{
					data: openInterestData.sort((a, b) => b - a),
					type: 'bar',
					name: 'Open Interest',
					itemStyle: {
						color: '#C9975B',
					},
					label: {
						formatter: (value: WeiSource) => formatDollars(value, { maxDecimals: 0 }),
					},
				},
			],
			tooltip: {
				...defaultOptions.tooltip,
				valueFormatter: (value: WeiSource) => formatDollars(value, { maxDecimals: 0 }),
			},
			legend: undefined,
		};

		chart.setOption(option);
	}, [ref, chart, t, openInterestData, marketsWithIcons, richMarketsLabel, theme, defaultOptions]);

	return (
		<StyledChartContainer width={2}>
			<ChartWrapper ref={ref} />
		</StyledChartContainer>
	);
};

const StyledChartContainer = styled(ChartContainer)`
	overflow: scroll;
`;
