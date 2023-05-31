import { WeiSource } from '@synthetixio/wei';
import { useEffect, useRef, useMemo, FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';

import useStatsData from 'hooks/useStatsData';
import { MarketKeyByAsset } from 'sdk/utils/futures';
import { formatDollars } from 'sdk/utils/number';
import { getDisplayAsset } from 'utils/futures';
import { SYNTH_ICONS } from 'utils/icons';

import { initChart } from '../initChart';
import type { EChartsOption } from '../initChart';
import { ChartContainer, ChartHeader, ChartTitle, ChartWrapper } from '../stats.styles';

type RichLabel = {
	width: number;
	height: number;
	backgroundColor: {
		image: any;
	};
};

type RichLabelMap = Record<string, RichLabel>;
type OpenInterestProps = { mobile: boolean };

export const OpenInterest: FC<OpenInterestProps> = ({ mobile }) => {
	const { t } = useTranslation();
	const theme = useTheme();

	const { openInterestData } = useStatsData();

	const ref = useRef<HTMLDivElement | null>(null);

	const { chart, defaultOptions } = useMemo(() => {
		if (chart) chart.dispose();
		return initChart(ref?.current, theme);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref?.current, theme]);

	const openInterestStats = useMemo(() => {
		const sortedData = openInterestData
			.map(({ asset, openInterest }) => ({
				asset: getDisplayAsset(asset) ?? asset,
				openInterest,
				icon: SYNTH_ICONS[MarketKeyByAsset[asset]],
				richLabel: {
					width: 40,
					height: 40,
					backgroundColor: {
						image: SYNTH_ICONS[MarketKeyByAsset[asset]],
					},
				} as RichLabel,
			}))
			.sort((a, b) => b.openInterest - a.openInterest);

		return mobile ? sortedData.slice(0, 5) : sortedData;
	}, [mobile, openInterestData]);

	useEffect(() => {
		if (!ref || !chart || !ref.current || !openInterestData || !openInterestData.length) {
			return;
		}

		const totalOI = openInterestData.reduce((acc, curr) => acc + curr.openInterest, 0);
		const subtext = formatDollars(totalOI, { maxDecimals: 0 });

		const richLabels = openInterestStats.reduce((acc, openInterestStat) => {
			acc[openInterestStat.asset] = openInterestStat.richLabel;
			return acc;
		}, {} as RichLabelMap);

		const option: EChartsOption = {
			...defaultOptions,
			title: {
				...defaultOptions.title,
				subtext,
			},
			xAxis: {
				type: 'category',
				data: openInterestStats.map(({ asset }) => asset),
				axisLabel: {
					formatter: (market: any) => {
						return [`{${market}| }`, `{syntheticAsset|${market}}`].join('\n');
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
						...richLabels,
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
					formatter: (value: WeiSource) => formatDollars(value, { truncateOver: 1e3 }),
				},
				position: 'right',
			},
			series: [
				{
					data: openInterestStats.map(({ openInterest }) => openInterest),
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
	}, [ref, chart, t, openInterestData, openInterestStats, theme, defaultOptions]);

	return (
		<StyledChartContainer width={2}>
			<ChartHeader>
				<ChartTitle>{t('stats.open-interest.title')}</ChartTitle>
			</ChartHeader>
			<ChartWrapper ref={ref} />
		</StyledChartContainer>
	);
};

const StyledChartContainer = styled(ChartContainer)`
	overflow: scroll;
`;
