import StaticChart from 'assets/png/chart/static-chart.png';
import PausedIcon from 'assets/svg/futures/market-closure/paused-icon.svg';
import Webp from 'components/Webp';
import { CurrencyKey } from 'constants/currency';
import { MarketClosureReason } from 'hooks/useMarketClosed';
import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

/**
 *
 * We are removing this component from the app because it is too
 * distracting when markets pause constantly (reason code 231).
 * Leaving the component here in case we want to bring it back later.
 */
const MarketOverlay: FC<{
	marketClosureReason: MarketClosureReason;
	baseCurrencyKey: CurrencyKey;
}> = ({ marketClosureReason, baseCurrencyKey }) => {
	return (
		<OverlayContainer>
			<Overlay>
				<OverlayContent>
					<StyledSvg />
					<StyledText>
						<Trans
							i18nKey={`futures.market.chart.overlay-messages.${marketClosureReason}.title`}
							values={{ baseCurrencyKey }}
						/>
					</StyledText>
					<StyledText>
						<Trans
							i18nKey={`futures.market.chart.overlay-messages.${marketClosureReason}.subtitle`}
							values={{ baseCurrencyKey }}
						/>
					</StyledText>
				</OverlayContent>
			</Overlay>
			<Webp srcOrSrcset={StaticChart} StyledImg={AssetsImage} />
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
`;

const AssetsImage = styled.img`
	width: 100%;
	opacity: 0.08;
`;

const StyledSvg = styled(PausedIcon)`
	margin: 25px;
`;

const StyledText = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-size: 24px;
	padding-bottom: 10px;
`;
