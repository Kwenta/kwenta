import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import { FlexDiv, FlexDivCol } from 'styles/common';
import CurrencyIcon from 'components/Currency/CurrencyIcon';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import Button from 'components/Button';
import { FuturesPosition, PositionSide } from 'queries/futures/types';
import { formatNumber } from 'utils/formatters/number';
import ClosePositionModal from './ClosePositionModal';
import Connector from 'containers/Connector';
import { NO_VALUE } from 'constants/placeholder';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import { getSynthDescription } from 'utils/futures';
import Wei from '@synthetixio/wei';
import { CurrencyKey } from 'constants/currency';
import MarketBadge from 'components/Badge/MarketBadge';
import useFuturesMarketClosed from 'hooks/useFuturesMarketClosed';

type PositionCardProps = {
	currencyKey: string;
	position: FuturesPosition | null;
	currencyKeyRate: number;
	onPositionClose?: () => void;
	dashboard?: boolean;
};

type PositionData = {
	currencyIconKey: string;
	marketShortName: string;
	marketLongName: string;
	positionSide: JSX.Element;
	positionSize: string;
	leverage: string;
	liquidationPrice: string;
	pnl: Wei;
	pnlText: string;
	netFunding: Wei;
	netFundingText: string;
	fees: string;
	avgEntryPrice: string;
};

const PositionCard: React.FC<PositionCardProps> = ({
	currencyKey,
	position,
	currencyKeyRate,
	onPositionClose,
	dashboard,
}) => {
	const { t } = useTranslation();
	const positionDetails = position?.position ?? null;
	const [closePositionModalIsVisible, setClosePositionModalIsVisible] = useState<boolean>(false);
	const futuresPositionsQuery = useGetFuturesPositionForAccount();
	const { isFuturesMarketClosed, futuresClosureReason } = useFuturesMarketClosed(
		currencyKey as CurrencyKey
	);
	const futuresPositions = futuresPositionsQuery?.data ?? null;

	const { synthsMap } = Connector.useContainer();

	const positionHistory = futuresPositions?.find(
		({ asset, isOpen }) => isOpen && asset === currencyKey
	);

	const data: PositionData = React.useMemo(() => {
		const pnl = positionDetails?.profitLoss.add(positionDetails?.accruedFunding) ?? zeroBN;
		const netFunding =
			positionDetails?.accruedFunding.add(positionHistory?.netFunding ?? zeroBN) ?? zeroBN;

		return {
			currencyIconKey: currencyKey ? (currencyKey[0] !== 's' ? 's' : '') + currencyKey : '',
			marketShortName: currencyKey
				? (currencyKey[0] === 's' ? currencyKey.slice(1) : currencyKey) + '-PERP'
				: 'Select a market',
			marketLongName: getSynthDescription(currencyKey, synthsMap, t),
			positionSide: positionDetails ? (
				<PositionValue
					side={positionDetails.side === 'long' ? PositionSide.LONG : PositionSide.SHORT}
				>
					{positionDetails.side === 'long' ? PositionSide.LONG + ' ↗' : PositionSide.SHORT + ' ↘'}
				</PositionValue>
			) : (
				<StyledValue>{NO_VALUE}</StyledValue>
			),
			positionSize: positionDetails
				? `${formatNumber(positionDetails.size ?? 0, {
						minDecimals: positionDetails.size.abs().lt(0.01) ? 4 : 2,
				  })} (${formatCurrency(Synths.sUSD, positionDetails.notionalValue.abs() ?? zeroBN, {
						sign: '$',
						minDecimals: positionDetails.notionalValue.abs().lt(0.01) ? 4 : 2,
				  })})`
				: NO_VALUE,
			leverage: positionDetails
				? formatNumber(positionDetails?.leverage ?? zeroBN) + 'x'
				: NO_VALUE,
			liquidationPrice: positionDetails
				? formatCurrency(Synths.sUSD, positionDetails?.liquidationPrice ?? zeroBN, {
						sign: '$',
				  })
				: NO_VALUE,
			pnl: pnl,
			pnlText:
				positionDetails && pnl
					? `${formatCurrency(Synths.sUSD, pnl, {
							sign: '$',
							minDecimals: pnl.abs().lt(0.01) ? 4 : 2,
					  })} (${formatPercent(positionDetails.profitLoss.div(positionDetails.initialMargin))})`
					: NO_VALUE,
			netFunding: netFunding,
			netFundingText: formatCurrency(Synths.sUSD, netFunding, {
				sign: '$',
				minDecimals: netFunding.abs().lt(0.01) ? 4 : 2,
			}),
			fees: positionDetails
				? formatCurrency(Synths.sUSD, positionHistory?.feesPaid ?? zeroBN, {
						sign: '$',
				  })
				: NO_VALUE,
			avgEntryPrice: positionDetails
				? formatCurrency(Synths.sUSD, positionHistory?.entryPrice ?? zeroBN, {
						sign: '$',
				  })
				: NO_VALUE,
		};
	}, [currencyKey, positionDetails, positionHistory, synthsMap, t]);

	return (
		<>
			<Container id={isFuturesMarketClosed ? 'closed' : undefined}>
				<DataCol>
					<InfoCol>
						<CurrencyInfo>
							<StyledCurrencyIcon currencyKey={data.currencyIconKey} />
							<div>
								<CurrencySubtitle>
									{data.marketShortName}
									<MarketBadge
										currencyKey={currencyKey as CurrencyKey}
										isFuturesMarketClosed={isFuturesMarketClosed}
										futuresClosureReason={futuresClosureReason}
									/>
								</CurrencySubtitle>
								<StyledValue>{data.marketLongName}</StyledValue>
							</div>
						</CurrencyInfo>
					</InfoCol>
					<PositionInfoCol>
						<StyledSubtitle>{t('futures.market.position-card.position-side')}</StyledSubtitle>
						{data.positionSide}
					</PositionInfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>{t('futures.market.position-card.position-size')}</StyledSubtitle>
						<StyledValue>{data.positionSize}</StyledValue>
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>{t('futures.market.position-card.pnl')}</StyledSubtitle>
						{positionDetails ? (
							<StyledValue className={data.pnl > zeroBN ? 'green' : data.pnl < zeroBN ? 'red' : ''}>
								{data.pnlText}
							</StyledValue>
						) : (
							<StyledValue>{NO_VALUE}</StyledValue>
						)}
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>{t('futures.market.position-card.leverage')}</StyledSubtitle>
						<StyledValue>{data.leverage}</StyledValue>
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>{t('futures.market.position-card.liquidation-price')}</StyledSubtitle>
						<StyledValue>{data.liquidationPrice}</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>{t('futures.market.position-card.net-funding')}</StyledSubtitle>
						{positionDetails ? (
							<StyledValue
								className={
									data.netFunding > zeroBN ? 'green' : data.netFunding < zeroBN ? 'red' : ''
								}
							>
								{data.netFundingText}
							</StyledValue>
						) : (
							<StyledValue>{NO_VALUE}</StyledValue>
						)}
					</InfoCol>
					<InfoCol>
						<StyledSubtitle>{t('futures.market.position-card.fees')}</StyledSubtitle>
						<StyledValue>{data.fees}</StyledValue>
					</InfoCol>
				</DataCol>
				<DataCol>
					<InfoCol>
						<StyledSubtitle>{t('futures.market.position-card.avg-entry-price')}</StyledSubtitle>
						<StyledValue>{data.avgEntryPrice}</StyledValue>
					</InfoCol>
					<InfoCol>
						{onPositionClose && (
							<CloseButton
								isRounded={true}
								size="sm"
								variant="danger"
								onClick={() => setClosePositionModalIsVisible(true)}
								disabled={!positionDetails || isFuturesMarketClosed}
								noOutline={true}
							>
								{t('futures.market.user.position.close-position')}
							</CloseButton>
						)}
					</InfoCol>
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
	grid-template-columns: repeat(5, auto);
	background-color: transparent;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	padding: 20px 80px 20px 18px;
	justify-content: space-between;
	border-radius: 10px;
	margin-bottom: 15px;
	/* min-height: 135px; */
`;

const StyledCurrencyIcon = styled(CurrencyIcon)`
	width: 30px;
	height: 30px;
	margin-right: 15px;

	${Container}#closed & {
		opacity: 0.3;
	}
`;

const DataCol = styled(FlexDivCol)``;

const InfoCol = styled(FlexDivCol)`
	&:nth-of-type(odd) {
		margin-bottom: 18px;
	}

	.green {
		color: ${(props) => props.theme.colors.common.primaryGreen};
	}

	.red {
		color: ${(props) => props.theme.colors.common.primaryRed};
	}
`;

const StyledSubtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	text-transform: capitalize;
`;

const StyledValue = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};

	${Container}#closed & {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

const CloseButton = styled(Button)`
	height: 34px;
	font-size: 13px;
	background: rgba(239, 104, 104, 0.04);
	border: 1px solid #ef6868;
	box-shadow: none;
	min-width: 100px;
	width: 110px;
	padding: 0;
	transition: all 0s ease-in-out;

	&:hover {
		background: ${(props) => props.theme.colors.common.primaryRed};
		color: ${(props) => props.theme.colors.white};
		transform: scale(0.98);
	}

	&:disabled {
		border: ${(props) => props.theme.colors.selectedTheme.border};
		background: transparent;
		color: ${(props) => props.theme.colors.selectedTheme.button.disabled.text};
		transform: none;
	}
`;

const CurrencySubtitle = styled(StyledSubtitle)`
	text-transform: initial;
	display: flex;
	align-items: center;
`;

const PositionInfoCol = styled(InfoCol)`
	padding-left: 45px;
`;

const PositionValue = styled.p<{ side: PositionSide }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 12px;
	text-transform: uppercase;
	margin: 0;
	color: ${(props) => props.theme.colors.common.primaryWhite};

	${Container}#closed & {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}

	${(props) =>
		props.side === PositionSide.LONG &&
		css`
			color: ${props.theme.colors.common.primaryGreen};
		`}

	${(props) =>
		props.side === PositionSide.SHORT &&
		css`
			color: ${props.theme.colors.common.primaryRed};
		`}
`;

const CurrencyInfo = styled(FlexDiv)`
	align-items: flex-start;
`;
