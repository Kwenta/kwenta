import React, { useState } from 'react';
import styled from 'styled-components';
import { wei } from '@synthetixio/wei';

import SpiralLines from 'assets/svg/app/future-position-background.svg';

import Card from 'components/Card';
import { FlexDivRow, FlexDivCol, FlexDivRowCentered } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { useTranslation } from 'react-i18next';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import ChangePercent from 'components/ChangePercent';
import Button from 'components/Button';
import { FuturesPosition, PositionSide } from 'queries/futures/types';
import { formatNumber } from 'utils/formatters/number';
import ClosePositionModal from './ClosePositionModal';

type PositionCardProps = {
	currencyKey: string;
	position: FuturesPosition | null;
	currencyKeyRate: number;
};

const PositionCard: React.FC<PositionCardProps> = ({ currencyKey, position, currencyKeyRate }) => {
	const { t } = useTranslation();
	const positionDetails = position?.position ?? null;
	const [closePositionModalIsVisible, setClosePositionModalIsVisible] = useState<boolean>(false);

	return (
		<>
			<Card>
				<FlexDivRow>
					<GraphicPosition>
						<StyledGraphicRow>
							<FlexDivCol>
								<PositionSizeRow>
									<StyledCurrencyIcon currencyKey={currencyKey} />
									<PositionSizeCol>
										<StyledPositionSize>
											{formatCurrency(currencyKey, positionDetails?.size ?? zeroBN, {
												currencyKey,
											})}
										</StyledPositionSize>
										<StyledPositionSizeUSD>
											{formatCurrency(
												Synths.sUSD,
												positionDetails?.size?.mul(wei(currencyKeyRate ?? 0)) ?? zeroBN,
												{ sign: '$' }
											)}
										</StyledPositionSizeUSD>
									</PositionSizeCol>
								</PositionSizeRow>
								<ROIContainer>
									<StyledROIValue>
										<span>{t('futures.market.user.position.roi')}</span>
										<p>
											{formatCurrency(Synths.sUSD, positionDetails?.roi ?? zeroBN, { sign: '$' })}
										</p>
									</StyledROIValue>
									<ChangePercent value={Number(positionDetails?.roiChange?.toString() ?? 0)} />
								</ROIContainer>
							</FlexDivCol>
							<FlexDivRow>
								<Leverage>{`${formatNumber(positionDetails?.leverage ?? 0)}x |`}</Leverage>
								<Side isLong={positionDetails?.side === PositionSide.LONG ?? true}>
									{positionDetails?.side ?? PositionSide.LONG}
								</Side>
							</FlexDivRow>
						</StyledGraphicRow>
					</GraphicPosition>
					<RightHand>
						<DataCol>
							<InfoCol>
								<StyledSubtitle>{t('futures.market.user.position.entry')}</StyledSubtitle>
								<StyledValue>
									{positionDetails && positionDetails.lastPrice
										? formatCurrency(Synths.sUSD, positionDetails?.lastPrice, { sign: '$' })
										: '--'}
								</StyledValue>
							</InfoCol>
							<InfoCol>
								<StyledSubtitle>{t('futures.market.user.position.margin')}</StyledSubtitle>
								<StyledValue>
									{formatCurrency(Synths.sUSD, position?.remainingMargin ?? zeroBN, { sign: '$' })}
								</StyledValue>
							</InfoCol>
						</DataCol>
						<DataCol>
							<InfoCol>
								<StyledSubtitle>{t('futures.market.user.position.liquidation')}</StyledSubtitle>
								<StyledValue>
									{formatCurrency(Synths.sUSD, positionDetails?.liquidationPrice ?? zeroBN, {
										sign: '$',
									})}
								</StyledValue>
							</InfoCol>
							<InfoCol>
								<StyledSubtitle>{t('futures.market.user.position.ratio')}</StyledSubtitle>
								<StyledValue>
									{formatCurrency(Synths.sUSD, positionDetails?.marginRatio ?? zeroBN)}
								</StyledValue>
							</InfoCol>
						</DataCol>
						<DataCol style={{ justifyContent: 'flex-end' }}>
							<CloseButton
								variant="text"
								onClick={() => setClosePositionModalIsVisible(true)}
								disabled={!positionDetails}
							>
								{t('futures.market.user.position.close')}
							</CloseButton>
						</DataCol>
					</RightHand>
				</FlexDivRow>
			</Card>
			{closePositionModalIsVisible && (
				<ClosePositionModal
					position={positionDetails}
					currencyKey={currencyKey}
					onDismiss={() => setClosePositionModalIsVisible(false)}
				/>
			)}
		</>
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

const Leverage = styled.div`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	color: ${(props) => props.theme.colors.white};
`;

const Side = styled.div<{ isLong: boolean }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 14px;
	color: ${(props) => (props.isLong ? props.theme.colors.green : props.theme.colors.red)};
	margin-left: 4px;
	text-transform: uppercase;
`;

const ROIContainer = styled(FlexDivRow)`
	margin-top: 16px;
	justify-content: flex-start;
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
		margin-right: 6px;
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

const CloseButton = styled(Button)`
	color: ${(props) => props.theme.colors.red};
	&:disabled {
		background: none;
		opacity: 0.5;
	}
`;
