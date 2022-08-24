import { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import AAVEIcon from 'assets/png/currencies/sAAVE.png';
import APEIcon from 'assets/png/currencies/sAPECOIN.png';
import AVAXIcon from 'assets/png/currencies/sAVAX.png';
import BTCIcon from 'assets/png/currencies/sBTC.png';
import DYDXIcon from 'assets/png/currencies/sDYDX.png';
import ETHIcon from 'assets/png/currencies/sETH.png';
import EURIcon from 'assets/png/currencies/sEUR.png';
import LINKIcon from 'assets/png/currencies/sLINK.png';
import MATICIcon from 'assets/png/currencies/sMATIC.png';
import SOLIcon from 'assets/png/currencies/sSOL.png';
import UNIIcon from 'assets/png/currencies/sUNI.png';
import XAGIcon from 'assets/png/currencies/sXAG.png';
import XAUIcon from 'assets/png/currencies/sXAU.png';
import colors from 'styles/theme/colors/common';
import fonts from 'styles/theme/fonts';

import { EChartsOption, initBarChart } from './initBarChart';
import { TimeRangeSwitcher } from './TimeRangeSwitcher';

const Container = styled.div`
	@media only screen and (min-width: 600px) {
	}
	@media only screen and (min-width: 768px) {
	}
	@media only screen and (min-width: 992px) {
		max-width: 1040px;
		margin-left: calc((100vw - 1040px) / 2);
	}
	@media only screen and (min-width: 1200px) {
		max-width: 1400px;
		margin-left: calc((100vw - 1400px - 50px) / 2);
	}
`;

const StatsTitle = styled.h3`
	font-family: ${(props) => props.theme.fonts.compressedBlack};
	font-size: 24px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	text-transform: uppercase;

	@media only screen and (min-width: 600px) {
		text-align: center;
	}
`;

const ChartContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;

	@media only screen and (min-width: 600px) {
		gap: 20px;
	}
`;

const ChartWrapper = styled.div`
	width: 100%;
	height: 380px;

	canvas {
		background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
		/* Highlight-Glow */

		box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.08),
			inset 0px 0px 20px rgba(255, 255, 255, 0.03);
		border-radius: 15px;
	}
`;

const Wrapper = styled.div`
	position: relative;
`;

const VolumnWrapper = styled(ChartWrapper)``;

const TradeContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 15px;

	@media only screen and (min-width: 600px) {
		flex-direction: row;
		gap: 20px;
	}
`;

const TradesWrapper = styled(ChartWrapper)``;

const TradersWrapper = styled(ChartWrapper)``;

const TvlWrapper = styled(ChartWrapper)`
	overflow: scroll;
`;

const ScrollableWrapper = styled.div`
	width: 1160px;
	height: 380px;

	@media only screen and (min-width: 992px) {
		width: 100%;
	}
`;

export type StatsProps = {};

export const Stats: FC<StatsProps> = () => {
	const { t } = useTranslation();

	const volumnRef = useRef<HTMLDivElement | null>(null);
	const tradesRef = useRef<HTMLDivElement | null>(null);
	const tradersRef = useRef<HTMLDivElement | null>(null);
	const tvlRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const text = t('stats.volumn.title');
		const subtext = '$40,461,472';

		const data = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
			],
		};

		volumnRef?.current && initBarChart(volumnRef.current, option);
	}, [volumnRef, t]);

	useEffect(() => {
		const text = t('stats.trades.title');

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
					name: 'Trades by Period',
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

		tradesRef?.current && initBarChart(tradesRef.current, option);
	}, [tradesRef, t]);

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

		tradersRef?.current && initBarChart(tradersRef.current, option);
	}, [tradersRef, t]);

	useEffect(() => {
		const text = t('stats.tvl.title');
		const subtext = '$40,461,472';
		const ASSETS: any = {
			sETH: {
				underlying: 'Ether',
				icon: ETHIcon,
			},
			sBTC: {
				underlying: 'Bitcoin',
				icon: BTCIcon,
			},
			sSOL: {
				underlying: 'Solana',
				icon: SOLIcon,
			},
			sEUR: {
				underlying: 'Euros',
				icon: EURIcon,
			},
			sXAG: {
				underlying: 'Silver',
				icon: XAGIcon,
			},
			sMATIC: {
				underlying: 'Matic',
				icon: MATICIcon,
			},
			sXAU: {
				underlying: 'Gold',
				icon: XAUIcon,
			},
			sAPE: {
				underlying: 'APE',
				icon: APEIcon,
			},
			sLINK: {
				underlying: 'Chainlink',
				icon: LINKIcon,
			},
			sDYDX: {
				underlying: 'DYDX',
				icon: DYDXIcon,
			},
			sUNI: {
				underlying: 'Uniswap',
				icon: UNIIcon,
			},
			sAVAX: {
				underlying: 'Avalanche',
				icon: AVAXIcon,
			},
			sAAVE: {
				underlying: 'Aave',
				icon: AAVEIcon,
			},
		};

		const data = Object.keys(ASSETS);
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
				bottom: 160,
			},
			xAxis: {
				type: 'category',
				data,
				axisLabel: {
					margin: 20,
					formatter: (sAsset: any) => {
						return [
							`{${sAsset}| }`,
							`{syntheticAsset|${sAsset}}`,
							`{underlyingAsset|${ASSETS[sAsset].underlying}}`,
						].join('\n');
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
						underlyingAsset: {
							fontFamily: fonts.regular,
							fontSize: 12,
						},
						sETH: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sETH.icon,
							},
						},
						sBTC: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sBTC.icon,
							},
						},
						sSOL: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sSOL.icon,
							},
						},
						sEUR: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sEUR.icon,
							},
						},
						sXAG: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sXAG.icon,
							},
						},
						sMATIC: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sMATIC.icon,
							},
						},
						sXAU: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sXAU.icon,
							},
						},
						sAPE: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sAPE.icon,
							},
						},
						sLINK: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sLINK.icon,
							},
						},
						sDYDX: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sDYDX.icon,
							},
						},
						sUNI: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sUNI.icon,
							},
						},
						sAVAX: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sAVAX.icon,
							},
						},
						sAAVE: {
							width: 40,
							height: 40,
							backgroundColor: {
								image: ASSETS.sAAVE.icon,
							},
						},
					},
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
			],
		};

		tvlRef?.current && initBarChart(tvlRef.current, option);
	}, [tvlRef, t]);

	return (
		<Container>
			<StatsTitle>{t('stats.title')}</StatsTitle>
			<ChartContainer>
				<Wrapper>
					<TimeRangeSwitcher />
					<VolumnWrapper ref={volumnRef} />
				</Wrapper>
				<TradeContainer>
					<Wrapper style={{ width: '100%' }}>
						<TimeRangeSwitcher />
						<TradesWrapper ref={tradesRef} />
					</Wrapper>
					<Wrapper style={{ width: '100%' }}>
						<TimeRangeSwitcher />
						<TradersWrapper ref={tradersRef} />
					</Wrapper>
				</TradeContainer>
				<TvlWrapper>
					<ScrollableWrapper ref={tvlRef} />
				</TvlWrapper>
			</ChartContainer>
		</Container>
	);
};
