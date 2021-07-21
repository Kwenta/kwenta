import React from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import SpiralLines from 'assets/svg/app/future-position-background.svg';
import LinkIcon from 'assets/svg/app/link.svg';

import Card from 'components/Card';
import { FlexDivRow, FlexDivCol, FlexDivRowCentered, ExternalLink } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import ChangePercent from 'components/ChangePercent';
import Button from 'components/Button';
import Etherscan from 'containers/Etherscan';

type PositionCardProps = {
	currencyKey: string;
};

const PositionCard: React.FC<PositionCardProps> = ({ currencyKey }) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();

	return (
		<Card>
			<FlexDivRow>
				<GraphicPosition>
					<StyledGraphicRow>
						<FlexDivCol>
							<PositionSizeRow>
								<StyledCurrencyIcon currencyKey={currencyKey} />
								<PositionSizeCol>
									<StyledPositionSize>5.00 {currencyKey}</StyledPositionSize>
									<StyledPositionSizeUSD>
										{formatCurrency(Synths.sUSD, 190000, { sign: '$' })}
									</StyledPositionSizeUSD>
								</PositionSizeCol>
							</PositionSizeRow>
							<ROIContainer>
								<StyledROIValue>
									<span>{t('futures.market.user.position.roi')}</span>
									<p>{formatCurrency(Synths.sUSD, 520, { sign: '$' })}</p>
								</StyledROIValue>
								<ChangePercent value={0.05} />
							</ROIContainer>
						</FlexDivCol>
						<PositionLeverageContainer>
							<div>5x |</div>
							<span>LONG</span>
						</PositionLeverageContainer>
					</StyledGraphicRow>
				</GraphicPosition>
				<RightHand>
					<DataCol>
						<InfoCol>
							<StyledSubtitle>{t('futures.market.user.position.entry')}</StyledSubtitle>
							<StyledValue>{formatCurrency(Synths.sUSD, 10000, { sign: '$' })}</StyledValue>
						</InfoCol>
						<InfoCol>
							<StyledSubtitle>{t('futures.market.user.position.margin')}</StyledSubtitle>
							<StyledValue>{formatCurrency(Synths.sUSD, 10000, { sign: '$' })}</StyledValue>
						</InfoCol>
					</DataCol>
					<DataCol>
						<InfoCol>
							<StyledSubtitle>{t('futures.market.user.position.liquidation')}</StyledSubtitle>
							<StyledValue>{formatCurrency(Synths.sUSD, 10000, { sign: '$' })}</StyledValue>
						</InfoCol>
						<InfoCol>
							<StyledSubtitle>{t('futures.market.user.position.ratio')}</StyledSubtitle>
							<StyledValue>{formatCurrency(Synths.sUSD, 10000, { sign: '$' })}</StyledValue>
						</InfoCol>
					</DataCol>
					<DataCol>
						<StyledExternalLink href={etherscanInstance ? etherscanInstance.txLink('') : ''}>
							<StyledLinkIcon src={LinkIcon} viewBox={`0 0 ${LinkIcon.width} ${LinkIcon.height}`} />
						</StyledExternalLink>
						<CloseButton variant="text" onClick={() => {}}>
							{t('futures.market.user.position.close')}
						</CloseButton>
					</DataCol>
				</RightHand>
			</FlexDivRow>
		</Card>
	);
};
export default PositionCard;

const GraphicPosition = styled.div`
	width: 45%;
	padding: 20px;
	background-size: cover;
	background-position: center center;
	background-image: url(${SpiralLines.src});
	background-color: ${(props) => props.theme.colors.vampire};
`;

const StyledGraphicRow = styled(FlexDivRow)`
	align-items: flex-start;
`;

const PositionSizeRow = styled(FlexDivRow)`
	justify-content: flex-start;
	align-items: center;
`;

const PositionSizeCol = styled(FlexDivCol)`
	margin-left: 8px;
`;

const StyledCurrencyIcon = styled(CurrencyIcon)`
	width: 40px;
	height: 40px;
`;

const StyledPositionSize = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 20px;
	color: ${(props) => props.theme.colors.white};
	margin-bottom: 4px;
`;

const StyledPositionSizeUSD = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 12px;
	color: ${(props) => props.theme.colors.silver};
	text-transform: capitalize;
`;

const PositionLeverageContainer = styled(FlexDivRow)`
	div {
		font-family: ${(props) => props.theme.fonts.bold};
		font-size: 14px;
		color: ${(props) => props.theme.colors.white};
	}
	span {
		font-family: ${(props) => props.theme.fonts.bold};
		font-size: 14px;
		color: ${(props) => props.theme.colors.green};
		margin-left: 4px;
	}
`;

const ROIContainer = styled(FlexDivRow)`
	margin-top: 16px;
`;

const StyledROIValue = styled(FlexDivRowCentered)`
	span {
		font-family: ${(props) => props.theme.fonts.regular};
		font-size: 16px;
		color: ${(props) => props.theme.colors.silver};
		margin-right: 4px;
	}

	p {
		font-family: ${(props) => props.theme.fonts.bold};
		font-size: 16px;
		color: ${(props) => props.theme.colors.white};
		margin-right: 4px;
	}
`;

const RightHand = styled(FlexDivRow)`
	width: 100%;
	width: 50%;
	padding: 20px;
`;

const DataCol = styled(FlexDivCol)`
	justify-content: space-between;
`;

const InfoCol = styled(FlexDivCol)`
	margin-bottom: 8px;
`;

const StyledSubtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	color: ${(props) => props.theme.colors.blueberry};
	text-transform: capitalize;
	margin-bottom: 4px;
`;

const StyledValue = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const StyledExternalLink = styled(ExternalLink)`
	margin-left: auto;
	cursor: pointer;
`;

const StyledLinkIcon = styled(Svg)`
	width: 14px;
	height: 14px;
	color: ${(props) => props.theme.colors.blueberry};
	&:hover {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
`;

const CloseButton = styled(Button)`
	color: ${(props) => props.theme.colors.red};
`;
