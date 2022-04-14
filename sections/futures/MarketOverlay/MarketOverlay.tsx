import React, { FC, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import StaticChart from 'assets/png/chart/static-chart.png';
import PausedIcon from 'assets/svg/futures/market-closure/paused-icon.svg';
import Img, { Svg } from 'react-optimized-image';
import {
	CurrencyKey,
	AFTER_HOURS_SYNTHS,
	TSE_SYNTHS,
	LSE_SYNTHS,
	FIAT_SYNTHS,
	COMMODITY_SYNTHS,
} from 'constants/currency';
import useMarketHoursTimer from 'sections/exchange/hooks/useMarketHoursTimer';
import { marketNextOpen } from 'utils/marketHours';
import { MarketClosureReason } from 'hooks/useMarketClosed';

const MarketOverlay: FC<{
	marketClosureReason: MarketClosureReason;
	baseCurrencyKey: CurrencyKey;
}> = ({ marketClosureReason, baseCurrencyKey }) => {
	const { t } = useTranslation();
	// const linkToAfterHoursMarket = useMemo(() => AFTER_HOURS_SYNTHS.has(baseCurrencyKey), [baseCurrencyKey]);
	const showMarketIsReopeningSoon = useMemo(
		() =>
			AFTER_HOURS_SYNTHS.has(baseCurrencyKey) ||
			TSE_SYNTHS.has(baseCurrencyKey) ||
			LSE_SYNTHS.has(baseCurrencyKey) ||
			FIAT_SYNTHS.has(baseCurrencyKey) ||
			COMMODITY_SYNTHS.has(baseCurrencyKey),
		[baseCurrencyKey]
	);

	const TimerDisplay = () => {
		const timer = useMarketHoursTimer(marketNextOpen(baseCurrencyKey) ?? null);

		// not sure if there is a better way
		return timer !== '0:00:00' ? (
			<StyledSubText>
				{t('futures.market.chart.overlay-messages.market-closure.timer-subtitle')}
				<StyledTimer>{timer}</StyledTimer>
			</StyledSubText>
		) : null;
	};

	return (
		<OverlayContainer>
			<Overlay>
				<OverlayContent>
					<StyledSvg src={PausedIcon} />
					<StyledText>
						<Trans
							i18nKey={`futures.market.chart.overlay-messages.${marketClosureReason}.title`}
							values={{ baseCurrencyKey }}
						/>
					</StyledText>
					{marketClosureReason === 'market-closure' && showMarketIsReopeningSoon ? (
						<TimerDisplay />
					) : (
						<StyledText>
							<Trans
								i18nKey={`futures.market.chart.overlay-messages.${marketClosureReason}.subtitle`}
								values={{ baseCurrencyKey }}
							/>
						</StyledText>
					)}
				</OverlayContent>
			</Overlay>
			<AssetsImage src={StaticChart} alt="" webp={true} />
		</OverlayContainer>
	);
};

export default MarketOverlay;

const OverlayContainer = styled.div`
	position: relative;
	overflow: hidden;
	background-color: ${(props) => props.theme.colors.transparentBlack};
	border-radius: 16px;
`;

const Overlay = styled.div`
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;
	height: 100%;
	width: 100%;
	transition: 0.5s ease-in-out;
	color: ${(props) => props.theme.colors.white};
`;

const OverlayContent = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	height: 100%;
	font-weight: 700;
`;

const AssetsImage = styled(Img)`
	width: 100%;
	opacity: 0.08;
`;

const StyledSvg = styled(Svg)`
	margin: 25px;
`;

const StyledText = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.white};
	font-size: 24px;
	padding-bottom: 10px;
`;

const StyledSubText = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-weight: bolder;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	line-height: 9px;
	letter-spacing: 0.1px;
	font-size: 16px;
`;

const StyledTimer = styled.span`
	font-family: ${(props) => props.theme.fonts.mono};
	font-weight: bolder;
	color: white;
`;
