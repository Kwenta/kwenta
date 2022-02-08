import React, { useState } from 'react';
import styled from 'styled-components';
import { wei } from '@synthetixio/wei';

import { FlexDiv, FlexDivRow, FlexDivCol, FlexDivRowCentered, InfoTooltip } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { useTranslation } from 'react-i18next';
import { formatCurrency, zeroBN } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import ChangePercent from 'components/ChangePercent';
import Button from 'components/Button';
import { FuturesPosition, PositionSide } from 'queries/futures/types';
import { formatNumber } from 'utils/formatters/number';
import ClosePositionModal from './ClosePositionModal';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';

type PositionCardProps = {
	currencyKey: string;
	position: FuturesPosition | null;
	currencyKeyRate: number;
	onPositionClose?: () => void;
	dashboard?: boolean;
};

const PositionCard: React.FC<PositionCardProps> = ({
	currencyKey,
	position,
	currencyKeyRate,
	onPositionClose,
	dashboard,
}) => {
	const { t } = useTranslation();
	const router = useRouter();
	const positionDetails = position?.position ?? null;
	const [closePositionModalIsVisible, setClosePositionModalIsVisible] = useState<boolean>(false);

	return (
		<>
			<Container>
				{/* <GraphicPosition>
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
									<InfoTooltip
										placement="top"
										content={<div>{t('futures.market.user.position.roi-tooltip')}</div>}
									>
										<StyledSubtitle>{t('futures.market.user.position.roi')}</StyledSubtitle>
									</InfoTooltip>
									<ROIValueContainer>
										<StyledROIValue>
											<div>
												{formatCurrency(Synths.sUSD, positionDetails?.roi ?? zeroBN, { sign: '$' })}
											</div>
										</StyledROIValue>
										<ChangePercent value={Number(positionDetails?.roiChange?.toString() ?? 0)} />
									</ROIValueContainer>
								</ROIContainer>
							</FlexDivCol>
							<FlexDivRow>
								<Leverage>{`${formatNumber(positionDetails?.leverage ?? 0)}x |`}</Leverage>
								<Side isLong={positionDetails?.side === PositionSide.LONG ?? true}>
									{positionDetails?.side ?? PositionSide.LONG}
								</Side>
							</FlexDivRow>
						</StyledGraphicRow>
					</GraphicPosition> */}
				<DataCol>
					<InfoCol>
						<FlexDiv>
							<StyledCurrencyIcon currencyKey={currencyKey} />
							<div>
								<CurrencySubtitle>{currencyKey}/sUSD</CurrencySubtitle>
								<StyledValue>Synthetic Bitcoin</StyledValue>
							</div>
						</FlexDiv>
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>Position</StyledSubtitle>
						<StyledValue>LONG</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>Size</StyledSubtitle>
						<StyledValue>8.98 ($4,131.23)</StyledValue>
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>Unrealized P&amp;L</StyledSubtitle>
						<StyledValue>$4,131.23 (1.53%)</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>Leverage</StyledSubtitle>
						<StyledValue>4.12x</StyledValue>
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>Liq. Price</StyledSubtitle>
						<StyledValue>$4,131.23</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<InfoTooltip
							placement="top"
							content={<div>{t('futures.market.user.position.entry-tooltip')}</div>}
						>
							<StyledSubtitle>{t('futures.market.user.position.entry')}</StyledSubtitle>
						</InfoTooltip>
						<StyledValue>
							{positionDetails && positionDetails.lastPrice
								? formatCurrency(Synths.sUSD, positionDetails?.lastPrice, { sign: '$' })
								: '--'}
						</StyledValue>
					</InfoCol>
					<InfoCol>
						<InfoTooltip
							placement="top"
							content={<div>{t('futures.market.user.position.remaining-margin-tooltip')}</div>}
						>
							<StyledSubtitle>{t('futures.market.user.position.remaining-margin')}</StyledSubtitle>
						</InfoTooltip>
						<StyledValue>
							{formatCurrency(Synths.sUSD, position?.remainingMargin ?? zeroBN, { sign: '$' })}
						</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<InfoTooltip
							placement="top"
							content={<div>{t('futures.market.user.position.liquidation-tooltip')}</div>}
						>
							<StyledSubtitle>{t('futures.market.user.position.liquidation')}</StyledSubtitle>
						</InfoTooltip>
						<StyledValue>
							{formatCurrency(Synths.sUSD, positionDetails?.liquidationPrice ?? zeroBN, {
								sign: '$',
							})}
						</StyledValue>
					</InfoCol>
					<InfoCol>
						<InfoTooltip
							placement="top"
							content={<div>{t('futures.market.user.position.margin-ratio-tooltip')}</div>}
						>
							<StyledSubtitle>{t('futures.market.user.position.margin-ratio')}</StyledSubtitle>
						</InfoTooltip>

						<StyledValue>
							{formatCurrency(Synths.sUSD, positionDetails?.marginRatio ?? zeroBN)}
						</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<InfoTooltip
							placement="top"
							content={<div>{t('futures.market.user.position.accrued-funding-tooltip')}</div>}
						>
							<StyledSubtitle>{t('futures.market.user.position.accrued-funding')}</StyledSubtitle>
						</InfoTooltip>
						<StyledValue>
							{positionDetails && positionDetails.accruedFunding
								? formatCurrency(Synths.sUSD, positionDetails.accruedFunding, { sign: '$' })
								: '--'}
						</StyledValue>
					</InfoCol>
					{onPositionClose && (
						<CloseButton
							isRounded={true}
							size="sm"
							variant="danger"
							onClick={() => setClosePositionModalIsVisible(true)}
							disabled={!positionDetails}
						>
							{t('futures.market.user.position.close-position')}
						</CloseButton>
					)}
					{dashboard && (
						<ManageButton
							isRounded={true}
							variant="text"
							onClick={() => router.push(ROUTES.Markets.MarketPair(currencyKey))}
						>
							{t('futures.market.user.position.manage-position')}
						</ManageButton>
					)}
				</DataCol>
			</Container>
			{closePositionModalIsVisible && onPositionClose && (
				<ClosePositionModal
					position={positionDetails}
					currencyKey={currencyKey}
					onPositionClose={onPositionClose}
					onDismiss={() => setClosePositionModalIsVisible(false)}
				/>
			)}
		</>
	);
};
export default PositionCard;

const Container = styled.div`
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	grid-gap: 16px;
	background-color: transparent;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	padding: 22px;
	border-radius: 16px;
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
	width: 30px;
	height: 30px;
	margin-right: 8px;
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

const ROIContainer = styled.div`
	margin-top: 16px;
`;

const ROIValueContainer = styled(FlexDivRow)`
	justify-content: flex-start;
`;

const StyledROIValue = styled(FlexDivRowCentered)`
	div {
		font-family: ${(props) => props.theme.fonts.bold};
		font-size: 16px;
		color: ${(props) => props.theme.colors.white};
		margin-right: 6px;
		margin-top: 4px;
	}
`;

const DataCol = styled(FlexDivCol)`
	justify-content: space-between;
`;

const InfoCol = styled(FlexDivCol)`
	margin-bottom: 8px;
`;

const StyledSubtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	text-transform: capitalize;
	margin-bottom: 4px;
`;

const StyledValue = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const CloseButton = styled(Button)`
	height: 36px;
	font-size: 13px;
`;

const ManageButton = styled(Button)`
	color: ${(props) => props.theme.colors.white};
	background: ${(props) => props.theme.colors.navy};
	padding: 0 10px;
	&:disabled {
		color: ${(props) => props.theme.colors.silver};
		background: ${(props) => props.theme.colors.navy};
		opacity: 0.5;
	}
	&:hover:not(:disabled) {
		color: ${(props) => props.theme.colors.white};
		opacity: 0.9;
	}
`;

const CurrencySubtitle = styled(StyledSubtitle)`
	text-transform: initial;
`;
