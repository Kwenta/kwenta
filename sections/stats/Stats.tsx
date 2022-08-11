import { FC, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import colors from 'styles/theme/colors/common';
import fonts from 'styles/theme/fonts';

import { initBarChart } from './initBarChart';

const Container = styled.div`
	@media only screen and (min-width: 600px) {
		// TODO: add media query for desktop
	}
	@media only screen and (min-width: 768px) {
		// TODO: add media query for tablet
	}
	@media only screen and (min-width: 992px) {
		// TODO: add media query for desktop
	}
	@media only screen and (min-width: 1200px) {
		// TODO: add media query for desktop
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
	width: 345px;
	height: 380px;

	canvas {
		background: linear-gradient(180deg, rgba(40, 39, 39, 0.5) 0%, rgba(25, 24, 24, 0.5) 100%);
		/* Highlight-Glow */

		box-shadow: inset 0px 1px 0px rgba(255, 255, 255, 0.08),
			inset 0px 0px 20px rgba(255, 255, 255, 0.03);
		border-radius: 15px;
	}

	@media only screen and (min-width: 600px) {
		// width: auto;
		// max-width: 1160px;
	}
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

const TradesWrapper = styled(ChartWrapper)`
	@media only screen and (min-width: 600px) {
		// width: 570px;
	}
`;

const TradersWrapper = styled(ChartWrapper)``;

const TvlWrapper = styled(ChartWrapper)``;

export type StatsProps = {};

export const Stats: FC<StatsProps> = () => {
	const { t } = useTranslation();

	const volumnRef = useRef<HTMLDivElement | null>(null);
	const tradesRef = useRef<HTMLDivElement | null>(null);
	const tradersRef = useRef<HTMLDivElement | null>(null);
	const tvlRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const textStyle = {
			color: colors.primaryWhite,
			fontFamily: fonts.regular,
			fontSize: 18,
		};
		const subtext = '$40,461,472';
		const subtextStyle = {
			color: colors.primaryWhite,
			fontFamily: fonts.monoBold,
			fontSize: 28,
		};

		volumnRef?.current &&
			initBarChart(
				volumnRef.current,
				t('stats.volumn.title'),
				textStyle,
				subtext,
				subtextStyle,
				null
			);
	}, [volumnRef, t]);

	useEffect(() => {
		const textStyle = {
			color: colors.primaryWhite,
			fontFamily: fonts.regular,
			fontSize: 18,
		};
		const legend = {
			icon: 'circle',
			top: 71,
			left: 20,
			textStyle: {
				color: colors.primaryWhite,
				fontFamily: fonts.regular,
				fontSize: 15,
			},
		};

		tradesRef?.current &&
			initBarChart(tradesRef.current, t('stats.trades.title'), textStyle, undefined, null, legend);
	}, [tradesRef, t]);

	useEffect(() => {
		const textStyle = {
			color: colors.primaryWhite,
			fontFamily: fonts.regular,
			fontSize: 18,
		};
		const legend = {
			icon: 'circle',
			top: 71,
			left: 20,
			textStyle: {
				color: colors.primaryWhite,
				fontFamily: fonts.regular,
				fontSize: 15,
			},
		};

		tradersRef?.current &&
			initBarChart(
				tradersRef.current,
				t('stats.traders.title'),
				textStyle,
				undefined,
				null,
				legend
			);
	}, [tradersRef, t]);

	useEffect(() => {
		const textStyle = {
			color: colors.primaryWhite,
			fontFamily: fonts.regular,
			fontSize: 18,
		};
		const subtext = '$40,461,472';
		const subtextStyle = {
			color: colors.primaryWhite,
			fontFamily: fonts.monoBold,
			fontSize: 28,
		};

		tvlRef?.current &&
			initBarChart(tvlRef.current, t('stats.tvl.title'), textStyle, subtext, subtextStyle, null);
	}, [tvlRef, t]);

	return (
		<Container>
			<StatsTitle>{t('stats.title')}</StatsTitle>
			<ChartContainer>
				<VolumnWrapper ref={volumnRef} />
				<TradeContainer>
					<TradesWrapper ref={tradesRef} />
					<TradersWrapper ref={tradersRef} />
				</TradeContainer>
				<TvlWrapper ref={tvlRef} />
			</ChartContainer>
		</Container>
	);
};
