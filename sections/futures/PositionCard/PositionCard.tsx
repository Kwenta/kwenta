import React from 'react';
import styled, { css } from 'styled-components';

import { FlexDivCol } from 'styles/common';
import { useTranslation } from 'react-i18next';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { HoverTransform } from '../MarketDetails/MarketDetails';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { isFiatCurrency } from 'utils/currencies';
import { Synths } from 'constants/currency';
import { FuturesPosition, PositionSide } from 'queries/futures/types';
import { formatNumber } from 'utils/formatters/number';
import Connector from 'containers/Connector';
import { NO_VALUE } from 'constants/placeholder';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import { getSynthDescription, getMarketKey, isEurForex } from 'utils/futures';
import Wei, { wei } from '@synthetixio/wei';
import { CurrencyKey } from 'constants/currency';
import useFuturesMarketClosed from 'hooks/useFuturesMarketClosed';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import { Price } from 'queries/rates/types';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';

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
	positionSize: string | React.ReactNode;
	leverage: string | React.ReactNode;
	liquidationPrice: string | JSX.Element;
	pnl: string | Wei | JSX.Element;
	realizedPnl: Wei;
	pnlText: string | null | JSX.Element;
	realizedPnlText: string | JSX.Element;
	netFunding: Wei;
	netFundingText: string | null | JSX.Element;
	fees: string | JSX.Element;
	avgEntryPrice: string | JSX.Element;
};

const PositionCard: React.FC<PositionCardProps> = ({ currencyKey, position, currencyKeyRate }) => {
	const { t } = useTranslation();
	const positionDetails = position?.position ?? null;
	const futuresPositionsQuery = useGetFuturesPositionForAccount();
	const { isFuturesMarketClosed } = useFuturesMarketClosed(currencyKey as CurrencyKey);

	const futuresPositions = futuresPositionsQuery?.data ?? null;

	const { synthsMap, network } = Connector.useContainer();

	const marketKey = getMarketKey(currencyKey, network.id);
	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const minDecimals =
		isFiatCurrency(selectedPriceCurrency.name) && isEurForex(marketKey)
			? DEFAULT_FIAT_EURO_DECIMALS
			: undefined;

	const positionHistory = futuresPositions?.find(
		({ asset, isOpen }) => isOpen && asset === currencyKey
	);

	const futuresMarketsQuery = useGetFuturesMarkets();

	const dailyPriceChangesQuery = useLaggedDailyPrice(
		futuresMarketsQuery?.data?.map(({ asset }) => asset) ?? []
	);

	const data: PositionData = React.useMemo(() => {
		const pnl = positionDetails?.profitLoss.add(positionDetails?.accruedFunding) ?? zeroBN;
		const realizedPnl =
			positionHistory?.pnl.add(positionHistory?.netFunding).sub(positionHistory?.feesPaid) ??
			zeroBN;
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
				<PositionCardTooltip
					preset="bottom"
					height={'auto'}
					content={t('futures.market.position-card.tooltips.position-side')}
				>
					<HoverTransform>
						<PositionValue
							side={positionDetails.side === 'long' ? PositionSide.LONG : PositionSide.SHORT}
						>
							{positionDetails.side === 'long' ? PositionSide.LONG : PositionSide.SHORT}
						</PositionValue>
					</HoverTransform>
				</PositionCardTooltip>
			) : (
				<StyledValue>{NO_VALUE}</StyledValue>
			),
			positionSize: positionDetails ? (
				<PositionCardTooltip
					preset="bottom"
					height={'auto'}
					content={t('futures.market.position-card.tooltips.position-size')}
				>
					<HoverTransform>
						{`${formatNumber(positionDetails.size ?? 0, {
							minDecimals: positionDetails.size.abs().lt(0.01) ? 4 : 2,
						})} (${formatCurrency(Synths.sUSD, positionDetails.notionalValue.abs() ?? zeroBN, {
							sign: '$',
							minDecimals: positionDetails.notionalValue.abs().lt(0.01) ? 4 : 2,
						})})`}
					</HoverTransform>
				</PositionCardTooltip>
			) : (
				NO_VALUE
			),
			leverage: positionDetails ? (
				<LeftMarginTooltip
					preset="bottom"
					height={'auto'}
					content={t('futures.market.position-card.tooltips.leverage')}
				>
					<HoverTransform>{formatNumber(positionDetails?.leverage ?? zeroBN) + 'x'}</HoverTransform>
				</LeftMarginTooltip>
			) : (
				NO_VALUE
			),
			liquidationPrice: positionDetails ? (
				<PositionCardTooltip
					preset="bottom"
					height={'auto'}
					content={t('futures.market.position-card.tooltips.liquidation-price')}
				>
					<HoverTransform>
						{formatCurrency(Synths.sUSD, positionDetails?.liquidationPrice ?? zeroBN, {
							sign: '$',
							minDecimals,
						})}
					</HoverTransform>
				</PositionCardTooltip>
			) : (
				NO_VALUE
			),
			pnl: pnl ?? NO_VALUE,
			realizedPnl: realizedPnl,
			pnlText:
				positionDetails && pnl ? (
					<PositionCardTooltip
						preset="bottom"
						height={'auto'}
						content={t('futures.market.position-card.tooltips.u-pnl')}
					>
						<HoverTransform>
							{`${formatCurrency(Synths.sUSD, pnl, {
								sign: '$',
								minDecimals: pnl.abs().lt(0.01) ? 4 : 2,
							})} (${formatPercent(
								positionDetails.profitLoss.div(positionDetails.initialMargin)
							)})`}
						</HoverTransform>
					</PositionCardTooltip>
				) : (
					NO_VALUE
				),
			realizedPnlText:
				positionHistory && realizedPnl ? (
					<PositionCardTooltip
						preset="bottom"
						height={'auto'}
						content={t('futures.market.position-card.tooltips.r-pnl')}
					>
						<HoverTransform>
							{`${formatCurrency(Synths.sUSD, realizedPnl, {
								sign: '$',
								minDecimals: 2,
							})}`}
						</HoverTransform>
					</PositionCardTooltip>
				) : (
					NO_VALUE
				),
			netFunding: netFunding,
			netFundingText: netFunding ? (
				<PositionCardTooltip
					preset="bottom"
					height={'auto'}
					content={t('futures.market.position-card.tooltips.net-funding')}
				>
					<HoverTransform>{`${formatCurrency(Synths.sUSD, netFunding, {
						sign: '$',
						minDecimals: netFunding.abs().lt(0.01) ? 4 : 2,
					})}`}</HoverTransform>
				</PositionCardTooltip>
			) : null,
			fees: positionDetails ? (
				<PositionCardTooltip
					preset="bottom"
					height={'auto'}
					content={t('futures.market.position-card.tooltips.fees')}
				>
					<HoverTransform>
						{formatCurrency(Synths.sUSD, positionHistory?.feesPaid ?? zeroBN, {
							sign: '$',
						})}
					</HoverTransform>
				</PositionCardTooltip>
			) : (
				NO_VALUE
			),
			avgEntryPrice: positionDetails ? (
				<LeftMarginTooltip
					preset="bottom-z-index-2-left-margin"
					height={'auto'}
					content={t('futures.market.position-card.tooltips.avg-entry-price')}
				>
					<HoverTransform>
						{formatCurrency(Synths.sUSD, positionHistory?.entryPrice ?? zeroBN, {
							sign: '$',
							minDecimals,
						})}
					</HoverTransform>
				</LeftMarginTooltip>
			) : (
				NO_VALUE
			),
		};
	}, [
		currencyKey,
		currencyKeyRate,
		minDecimals,
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
						<StyledValue>{data.marketPrice}</StyledValue>
					</InfoRow>
					<InfoRow>
						<StyledSubtitle>{t('futures.market.position-card.position-side')}</StyledSubtitle>
						{data.positionSide}
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
	grid-template-columns: 1fr 30px 1fr 30px 1fr;
	background-color: transparent;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	padding: 15px;
	justify-content: space-between;
	border-radius: 10px;
	margin-bottom: 15px;
`;

const DataCol = styled(FlexDivCol)`
	justify-content: space-between;
`;

const DataColDivider = styled.div`
	width: 1px;
	background-color: #2b2a2a;
	margin: 0 15px;
`;

const InfoRow = styled.div`
	display: flex;
	justify-content: space-between;
	line-height: 16px;
	padding-bottom: 10px;

	:last-child {
		padding-bottom: 0;
	}
	.green {
		color: ${(props) => props.theme.colors.common.primaryGreen};
	}

	.red {
		color: ${(props) => props.theme.colors.common.primaryRed};
	}
`;

const StyledSubtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.secondaryGray};
	text-transform: capitalize;
	margin: 0;
`;

const PositionCardTooltip = styled(StyledTooltip)`
	z-index: 2;
`;

const LeftMarginTooltip = styled(StyledTooltip)`
	left: -60px;
	z-index: 2;
`;

const StyledValue = styled.p`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	margin: 0;
	text-align: end;
	${Container}#closed & {
		color: ${(props) => props.theme.colors.common.secondaryGray};
	}
`;

const PositionValue = styled.p<{ side: PositionSide }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 13px;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	margin: 0;
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
