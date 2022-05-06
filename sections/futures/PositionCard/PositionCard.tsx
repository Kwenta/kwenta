import React from 'react';
import styled, { css } from 'styled-components';

import { FlexDivCol, FlexDivRow } from 'styles/common';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { Synths } from 'constants/currency';
import { FuturesPosition, PositionSide } from 'queries/futures/types';
import { formatNumber } from 'utils/formatters/number';
import Connector from 'containers/Connector';
import { NO_VALUE } from 'constants/placeholder';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import { getSynthDescription } from 'utils/futures';
import Wei, { wei } from '@synthetixio/wei';
import { CurrencyKey } from 'constants/currency';
import useFuturesMarketClosed from 'hooks/useFuturesMarketClosed';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import { Price } from 'queries/rates/types';

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
	marketPrice: string;
	price24h: Wei;
	positionSide: JSX.Element;
	positionSize: string;
	leverage: string;
	liquidationPrice: string;
	pnl: Wei;
	realizedPnl: Wei;
	pnlText: string;
	realizedPnlText: string;
	netFunding: Wei;
	netFundingText: string;
	fees: string;
	avgEntryPrice: string;
};

const PositionCard: React.FC<PositionCardProps> = ({ currencyKey, position, currencyKeyRate }) => {
	const { t } = useTranslation();
	const positionDetails = position?.position ?? null;
	const futuresPositionsQuery = useGetFuturesPositionForAccount();
	const { isFuturesMarketClosed } = useFuturesMarketClosed(currencyKey as CurrencyKey);

	const futuresPositions = futuresPositionsQuery?.data ?? null;

	const { synthsMap } = Connector.useContainer();

	const positionHistory = futuresPositions?.find(
		({ asset, isOpen }) => isOpen && asset === currencyKey
	);

	const futuresMarketsQuery = useGetFuturesMarkets();

	const dailyPriceChangesQuery = useLaggedDailyPrice(
		futuresMarketsQuery?.data?.map(({ asset }) => asset) ?? []
	);

	const data: PositionData = React.useMemo(() => {
		const pnl = positionDetails?.profitLoss.add(positionDetails?.accruedFunding) ?? zeroBN;
		const realizedPnl = positionHistory?.pnl ?? zeroBN;
		const netFundingHistory = positionHistory?.netFunding ?? zeroBN;
		const netFunding =
			positionDetails?.accruedFunding.add(positionHistory?.netFunding ?? zeroBN) ?? zeroBN;
		const lastPriceWei = wei(currencyKeyRate) ?? zeroBN;
		const dailyPriceChanges = dailyPriceChangesQuery?.data ?? [];
		const pastPrice = dailyPriceChanges.find((price: Price) => price.synth === currencyKey);
		const pastPriceWei = pastPrice?.price ?? zeroBN;

		return {
			currencyIconKey: currencyKey ? (currencyKey[0] !== 's' ? 's' : '') + currencyKey : '',
			marketShortName: currencyKey
				? (currencyKey[0] === 's' ? currencyKey.slice(1) : currencyKey) + '-PERP'
				: 'Select a market',
			marketLongName: getSynthDescription(currencyKey, synthsMap, t),
			marketPrice: formatCurrency(Synths.sUSD, currencyKeyRate, {
				sign: '$',
				minDecimals: currencyKeyRate < 0.01 ? 4 : 2,
			}),
			price24h: lastPriceWei.sub(pastPriceWei),
			positionSide: positionDetails ? (
				<PositionValue
					side={positionDetails.side === 'long' ? PositionSide.LONG : PositionSide.SHORT}
				>
					{positionDetails.side === 'long' ? PositionSide.LONG : PositionSide.SHORT}
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
			realizedPnl: realizedPnl,
			pnlText:
				positionDetails && pnl
					? `${formatCurrency(Synths.sUSD, pnl, {
							sign: '$',
							minDecimals: pnl.abs().lt(0.01) ? 4 : 2,
					  })} (${formatPercent(positionDetails.profitLoss.div(positionDetails.initialMargin))})`
					: NO_VALUE,
			realizedPnlText:
				positionHistory && realizedPnl
					? `${formatCurrency(Synths.sUSD, realizedPnl, {
							sign: '$',
							minDecimals: realizedPnl.abs().lt(0.01) ? 4 : 2,
					  })} (${formatPercent(realizedPnl.div(netFundingHistory))})`
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
	}, [
		currencyKey,
		currencyKeyRate,
		positionDetails,
		positionHistory,
		synthsMap,
		dailyPriceChangesQuery,
		t,
	]);

	return (
		<>
			<Container id={isFuturesMarketClosed ? 'closed' : undefined}>
				<DataCol>
					<InfoRow>
						<StyledSubtitle>{data.marketShortName}</StyledSubtitle>
						<StyledValue
							className={data.price24h > zeroBN ? 'green' : data.price24h < zeroBN ? 'red' : ''}
						>
							{data.marketPrice}
						</StyledValue>
					</InfoRow>
					<InfoRow>
						<StyledSubtitle>{t('futures.market.position-card.position-side')}</StyledSubtitle>
						<StyledValue>{data.positionSide}</StyledValue>
					</InfoRow>
					<InfoRow>
						<StyledSubtitle>{t('futures.market.position-card.position-size')}</StyledSubtitle>
						<StyledValue>{data.positionSize}</StyledValue>
					</InfoRow>
				</DataCol>
				<DataColDivider />
				<DataCol>
					<InfoRow>
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
					</InfoRow>
					<InfoRow>
						<StyledSubtitle>{t('futures.market.position-card.r-pnl')}</StyledSubtitle>
						{positionDetails ? (
							<StyledValue
								className={
									data.realizedPnl > zeroBN ? 'green' : data.realizedPnl < zeroBN ? 'red' : ''
								}
							>
								{data.realizedPnlText}
							</StyledValue>
						) : (
							<StyledValue>{NO_VALUE}</StyledValue>
						)}
					</InfoRow>
					<InfoRow>
						<StyledSubtitle>{t('futures.market.position-card.liquidation-price')}</StyledSubtitle>
						<StyledValue>{data.liquidationPrice}</StyledValue>
					</InfoRow>
				</DataCol>
				<DataColDivider />
				<DataCol>
					<InfoRow>
						<StyledSubtitle>{t('futures.market.position-card.leverage')}</StyledSubtitle>
						<StyledValue>{data.leverage}</StyledValue>
					</InfoRow>
					<InfoRow>
						<StyledSubtitle>{t('futures.market.position-card.u-pnl')}</StyledSubtitle>
						{positionDetails ? (
							<StyledValue className={data.pnl > zeroBN ? 'green' : data.pnl < zeroBN ? 'red' : ''}>
								{data.pnlText}
							</StyledValue>
						) : (
							<StyledValue>{NO_VALUE}</StyledValue>
						)}
					</InfoRow>
					<InfoRow>
						<StyledSubtitle>{t('futures.market.position-card.avg-entry-price')}</StyledSubtitle>
						<StyledValue>{data.avgEntryPrice}</StyledValue>
					</InfoRow>
				</DataCol>
			</Container>
		</>
	);
};
export default PositionCard;

const Container = styled.div`
	display: grid;
	grid-template-columns: repeat(5, auto);
	background-color: transparent;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	padding: 10px;
	justify-content: space-between;
	border-radius: 10px;
	margin-bottom: 15px;
	/* min-height: 135px; */
	min-width: 50%;
`;

const DataCol = styled(FlexDivCol)`
	min-width: 200px;
`;

const DataColDivider = styled.div`
	content: '';
	position: relative;
	z-index: 2;
	width: 1px;
	background-color: #2b2a2a;
	flex-direction: column;
`;

const InfoRow = styled(FlexDivRow)`
	.green {
		color: ${(props) => props.theme.colors.common.primaryGreen};
	}

	.red {
		color: ${(props) => props.theme.colors.common.primaryRed};
	}
`;

const StyledSubtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	font-weight: 400;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	text-transform: capitalize;
	padding: 10px;
	line-height; 16px;
`;

const StyledValue = styled.div`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	font-weight: 400;
	color: ${(props) => props.theme.colors.white};
	padding: 10px;
	line-height; 16px;

	${Container}#closed & {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
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
