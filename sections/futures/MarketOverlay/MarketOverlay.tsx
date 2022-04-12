import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import StaticChart from 'assets/png/chart/static-chart.png';
import PausedIcon from 'assets/svg/futures/market-closure/paused-icon.svg';
import Img, { Svg } from 'react-optimized-image';

type MarketOverlayProps = {
	isPaused: boolean;
};

const MarketOverlay = () => {
	const { t } = useTranslation();
	return (
		<OverlayContainer>
			<Overlay>
				<OverlayContent>
					<StyledSvg src={PausedIcon} />
					<StyledText>This market has been closed</StyledText>
					<StyledSubText>
						Trading activity will resume in: <StyledTimer>12:09:22</StyledTimer>
					</StyledSubText>
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
	background-color: rgba(8, 8, 8, 0.93);
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
	color: white;
	border-radius: 16px;
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
	border-radius: 16px;
	opacity: 0.05;
`;

const StyledSvg = styled(Svg)`
	margin: 25px;
`;

const StyledText = styled.div`
	font-family: 'AkkuratLLWeb-Regular';
	color: white;
	font-size: 24px;
	padding-bottom: 10px;
`;

const StyledSubText = styled.div`
	font-family: 'AkkuratLLWeb-Regular';
	font-weight: bolder;
	color: #787878;
	line-height: 12px;
	font-size: 16px;
`;

const StyledTimer = styled.span`
	font-family: 'AkkuratMonoLLWeb-Regular';
	font-weight: bolder;
	color: white;
`;
