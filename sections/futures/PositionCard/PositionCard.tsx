import React, { useMemo } from 'react';
import styled, { css } from 'styled-components';

import { FlexDivCol } from 'styles/common';
import { useTranslation } from 'react-i18next';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
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
import { PotentialTrade } from '../types';
import useGetFuturesPotentialTradeDetails from 'queries/futures/useGetFuturesPotentialTradeDetails';
import PreviewArrow from 'components/PreviewArrow';

type PositionCardProps = {
	currencyKey: string;
	position: FuturesPosition | null;
	currencyKeyRate: number;
	potentialTrade: PotentialTrade | null;
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

type PositionPreviewData = {
	sizeIsNotZero: boolean;
	positionSide: string;
	positionSize: Wei;
	leverage: Wei;
	liquidationPrice: Wei;
	avgEntryPrice: Wei;
	notionalValue: Wei;
	showStatus: boolean;
};

const PositionCard: React.FC<PositionCardProps> = ({
	currencyKey,
	position,
	currencyKeyRate,
	potentialTrade,
}) => {
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

	const potentialTradeDetails = useGetFuturesPotentialTradeDetails(
		currencyKey as CurrencyKey,
		potentialTrade
	);

	const previewTradeData = potentialTradeDetails.data ?? null;

	const modifiedAverage = useMemo(() => {
		if (positionHistory && potentialTradeDetails.data && potentialTrade) {
			const totalSize = positionHistory.size.add(potentialTrade.size);

			const existingValue = positionHistory.avgEntryPrice.mul(positionHistory.size);
			const newValue = potentialTradeDetails.data.price.mul(potentialTrade.size);
			const totalValue = existingValue.add(newValue);
			return totalValue.div(totalSize);
		}
		return null;
	}, [positionHistory, potentialTradeDetails.data, potentialTrade]);

	const previewData: PositionPreviewData = React.useMemo(() => {
		if (positionDetails === null || previewTradeData === null) {
			return {} as PositionPreviewData;
		}

		const size: Wei = previewTradeData?.size;
		const newSide = size?.gt(zeroBN) ? PositionSide.LONG : PositionSide.SHORT;

		return {
			sizeIsNotZero: size && !size?.eq(0),
			positionSide: newSide,
			positionSize: size?.abs(),
			notionalValue: previewTradeData.notionalValue,
			leverage: previewTradeData.notionalValue.div(previewTradeData.margin),
			liquidationPrice: previewTradeData.liqPrice,
			avgEntryPrice: modifiedAverage || zeroBN,
			showStatus: previewTradeData.showStatus,
		};
	}, [positionDetails, previewTradeData, modifiedAverage]);

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
				<PositionValue
					side={positionDetails.side === 'long' ? PositionSide.LONG : PositionSide.SHORT}
				>
					{positionDetails.side === 'long' ? PositionSide.LONG : PositionSide.SHORT}
					{previewData.positionSide !== positionDetails.side && (
						<PreviewArrow
							showPreview={
								previewData.sizeIsNotZero &&
								previewData.positionSide !== positionDetails.side &&
								!previewData.showStatus
							}
						>
							<PositionValue side={previewData.positionSide as PositionSide}>
								{previewData.positionSide}
							</PositionValue>
						</PreviewArrow>
					)}
				</PositionValue>
			) : (
				<StyledValue>{NO_VALUE}</StyledValue>
			),
			positionSize: positionDetails ? (
				<>
					{`${formatNumber(positionDetails.size ?? 0, {
						minDecimals: positionDetails.size.abs().lt(0.01) ? 4 : 2,
					})} (${formatCurrency(Synths.sUSD, positionDetails.notionalValue?.abs() ?? zeroBN, {
						sign: '$',
						minDecimals: positionDetails.notionalValue?.abs()?.lt(0.01) ? 4 : 2,
					})})`}
					<PreviewArrow
						showPreview={
							previewData.positionSize && previewData.sizeIsNotZero && !previewData.showStatus
						}
					>
						{`${formatNumber(previewData.positionSize ?? 0, {
							minDecimals: 4,
						})} (${formatCurrency(Synths.sUSD, previewData.notionalValue?.abs() ?? zeroBN, {
							sign: '$',
							minDecimals: 2,
						})})`}
					</PreviewArrow>
				</>
			) : (
				NO_VALUE
			),
			leverage: positionDetails ? (
				<>
					{formatNumber(positionDetails?.leverage ?? zeroBN) + 'x'}
					{
						<PreviewArrow showPreview={previewData.sizeIsNotZero && !previewData.showStatus}>
							{formatNumber(previewData?.leverage ?? zeroBN) + 'x'}
						</PreviewArrow>
					}
				</>
			) : (
				NO_VALUE
			),
			liquidationPrice: positionDetails ? (
				<>
					{formatCurrency(Synths.sUSD, positionDetails?.liquidationPrice ?? zeroBN, {
						sign: '$',
						minDecimals,
					})}
					{
						<PreviewArrow showPreview={previewData.sizeIsNotZero && !previewData.showStatus}>
							{formatCurrency(Synths.sUSD, previewData?.liquidationPrice ?? zeroBN, {
								sign: '$',
								minDecimals,
							})}
						</PreviewArrow>
					}
				</>
			) : (
				NO_VALUE
			),
			pnl: pnl ?? NO_VALUE,
			realizedPnl: realizedPnl,
			pnlText:
				positionDetails && pnl
					? `${formatCurrency(Synths.sUSD, pnl, {
							sign: '$',
							minDecimals: pnl.abs().lt(0.01) ? 4 : 2,
					  })} (${formatPercent(pnl.div(positionDetails.initialMargin))})`
					: NO_VALUE,
			realizedPnlText:
				positionHistory && realizedPnl
					? formatCurrency(Synths.sUSD, realizedPnl, {
							sign: '$',
							minDecimals: 2,
					  })
					: NO_VALUE,
			netFunding: netFunding,
			netFundingText: netFunding
				? `${formatCurrency(Synths.sUSD, netFunding, {
						sign: '$',
						minDecimals: netFunding.abs().lt(0.01) ? 4 : 2,
				  })}`
				: null,
			fees: positionDetails
				? formatCurrency(Synths.sUSD, positionHistory?.feesPaid ?? zeroBN, {
						sign: '$',
				  })
				: NO_VALUE,
			avgEntryPrice: positionDetails ? (
				<>
					{formatCurrency(Synths.sUSD, positionHistory?.entryPrice ?? zeroBN, {
						sign: '$',
						minDecimals,
					})}
					{
						<PreviewArrow showPreview={previewData.sizeIsNotZero && !previewData.showStatus}>
							{formatCurrency(Synths.sUSD, previewData.avgEntryPrice ?? zeroBN, {
								sign: '$',
								minDecimals,
							})}
						</PreviewArrow>
					}
				</>
			) : (
				NO_VALUE
			),
		};
	}, [
		positionDetails,
		positionHistory,
		currencyKeyRate,
		dailyPriceChangesQuery?.data,
		currencyKey,
		synthsMap,
		t,
		previewData.positionSide,
		previewData.sizeIsNotZero,
		previewData.showStatus,
		previewData.positionSize,
		previewData.notionalValue,
		previewData?.leverage,
		previewData?.liquidationPrice,
		previewData.avgEntryPrice,
		minDecimals,
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
						<PositionCardTooltip
							preset="bottom"
							height={'auto'}
							content={t('futures.market.position-card.tooltips.position-side')}
						>
							<StyledSubtitleWithCursor>
								{t('futures.market.position-card.position-side')}
							</StyledSubtitleWithCursor>
						</PositionCardTooltip>
						{data.positionSide}
					</InfoRow>
					<InfoRow>
						<PositionCardTooltip
							preset="bottom"
							height={'auto'}
							content={t('futures.market.position-card.tooltips.position-size')}
						>
							<StyledSubtitleWithCursor>
								{t('futures.market.position-card.position-size')}
							</StyledSubtitleWithCursor>
						</PositionCardTooltip>
						<StyledValue>{data.positionSize}</StyledValue>
					</InfoRow>
				</DataCol>
				<DataColDivider />
				<DataCol>
					<InfoRow>
						<PositionCardTooltip
							preset="bottom"
							height={'auto'}
							content={t('futures.market.position-card.tooltips.net-funding')}
						>
							<StyledSubtitleWithCursor>
								{t('futures.market.position-card.net-funding')}
							</StyledSubtitleWithCursor>
						</PositionCardTooltip>
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
						<PositionCardTooltip
							preset="bottom"
							height={'auto'}
							content={t('futures.market.position-card.tooltips.u-pnl')}
						>
							<StyledSubtitle>{t('futures.market.position-card.u-pnl')}</StyledSubtitle>
						</PositionCardTooltip>
						{positionDetails ? (
							<StyledValue className={data.pnl > zeroBN ? 'green' : data.pnl < zeroBN ? 'red' : ''}>
								{data.pnlText}
							</StyledValue>
						) : (
							<StyledValue>{NO_VALUE}</StyledValue>
						)}
					</InfoRow>
					<InfoRow>
						<PositionCardTooltip
							preset="bottom"
							height={'auto'}
							content={t('futures.market.position-card.tooltips.r-pnl')}
						>
							<StyledSubtitleWithCursor>
								{t('futures.market.position-card.r-pnl')}
							</StyledSubtitleWithCursor>
						</PositionCardTooltip>
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
				</DataCol>
				<DataColDivider />
				<DataCol>
					<InfoRow>
						<LeftMarginTooltip
							preset="bottom"
							height={'auto'}
							content={t('futures.market.position-card.tooltips.leverage')}
						>
							<StyledSubtitleWithCursor>
								{t('futures.market.position-card.leverage')}
							</StyledSubtitleWithCursor>
						</LeftMarginTooltip>
						<StyledValue>{data.leverage}</StyledValue>
					</InfoRow>
					<InfoRow>
						<PositionCardTooltip
							preset="bottom"
							height={'auto'}
							content={t('futures.market.position-card.tooltips.liquidation-price')}
						>
							<StyledSubtitleWithCursor>
								{t('futures.market.position-card.liquidation-price')}
							</StyledSubtitleWithCursor>
						</PositionCardTooltip>
						<StyledValue>{data.liquidationPrice}</StyledValue>
					</InfoRow>
					<InfoRow>
						<LeftMarginTooltip
							preset="bottom-z-index-2-left-margin"
							height={'auto'}
							content={t('futures.market.position-card.tooltips.avg-entry-price')}
						>
							<StyledSubtitleWithCursor>
								{t('futures.market.position-card.avg-entry-price')}
							</StyledSubtitleWithCursor>
						</LeftMarginTooltip>
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
		color: ${(props) => props.theme.colors.selectedTheme.green};
	}

	.red {
		color: ${(props) => props.theme.colors.selectedTheme.red};
	}
`;

const StyledSubtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	text-transform: capitalize;
	margin: 0;
`;

const StyledSubtitleWithCursor = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	text-transform: capitalize;
	margin: 0;
	cursor: help;
`;

const PositionCardTooltip = styled(StyledTooltip)`
	z-index: 2;
`;

const LeftMarginTooltip = styled(StyledTooltip)`
	left: -60px;
	z-index: 2;
`;

const StyledValue = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	margin: 0;
	text-align: end;
	${Container}#closed & {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

const PositionValue = styled.span<{ side?: PositionSide }>`
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 13px;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	margin: 0;
	${Container}#closed & {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}

	${(props) =>
		props.side === PositionSide.LONG &&
		css`
			color: ${props.theme.colors.selectedTheme.green};
		`}

	${(props) =>
		props.side === PositionSide.SHORT &&
		css`
			color: ${props.theme.colors.selectedTheme.red};
		`}
`;
