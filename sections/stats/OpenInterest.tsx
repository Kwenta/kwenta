import { useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import useStatsData from 'hooks/useStatsData';
import colors from 'styles/theme/colors/common';
import fonts from 'styles/theme/fonts';
import { SYNTH_ICONS } from 'utils/icons';

import { initBarChart } from './initBarChart';
import type { EChartsOption } from './initBarChart';
import { ChartContainer, ChartWrapper } from './stats.styles';

let chartInstance: any;

export const OpenInterest = () => {
	const { t } = useTranslation();

	const openInterestRef = useRef<HTMLDivElement | null>(null);
	const { futuresMarkets, openInterestData } = useStatsData();

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
		if (
			!openInterestRef ||
			!openInterestRef.current ||
			!openInterestData ||
			!openInterestData.length
		) {
			return;
		}

		const text = t('stats.open-interest.title');
		const subtext = '$40,461,472';

		const data = Object.keys(marketsWithIcons);
		const option: EChartsOption = {
			title: {
				text,
				subtext,
				left: 20,
				top: 40,
				itemGap: 10,
				textStyle: {
					color: colors.primaryWhite,
					fontFamily: fonts.regular,
					fontSize: 18,
				},
				subtextStyle: {
					color: colors.primaryWhite,
					fontFamily: fonts.monoBold,
					fontSize: 28,
				},
			},
			grid: {
				top: 137,
				// right: 40,
				bottom: 100,
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
							fontFamily: fonts.regular,
							fontSize: 15,
							color: colors.primaryWhite,
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
					data: openInterestData.filter((e) => e !== undefined).sort((a, b) => b - a),
					type: 'bar',
					name: 'Total Trades',
					itemStyle: {
						color: '#C9975B',
					},
				},
			],
		};

		if (chartInstance) {
			chartInstance.dispose();
		}
		chartInstance = initBarChart(openInterestRef.current);
		chartInstance.setOption(option);
	}, [openInterestRef, t, openInterestData, marketsWithIcons, richMarketsLabel]);

	return (
		<StyledChartContainer width={2}>
			<ChartWrapper ref={openInterestRef} />
		</StyledChartContainer>
	);
};

const StyledChartContainer = styled(ChartContainer)`
	overflow: scroll;
`;
