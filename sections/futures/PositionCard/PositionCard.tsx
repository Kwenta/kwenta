import Wei from '@synthetixio/wei';
import { useFuturesContext } from 'contexts/FuturesContext';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled, { css } from 'styled-components';

import PreviewArrow from 'components/PreviewArrow';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { Synths } from 'constants/currency';
import { DEFAULT_FIAT_EURO_DECIMALS } from 'constants/defaults';
import { NO_VALUE } from 'constants/placeholder';
import Connector from 'containers/Connector';
import useFuturesMarketClosed from 'hooks/useFuturesMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { PositionSide } from 'queries/futures/types';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
import {
	currentMarketState,
	marketKeyState,
	positionState,
	potentialTradeDetailsState,
} from 'store/futures';
import { FlexDivCol } from 'styles/common';
import media from 'styles/media';
import { isFiatCurrency } from 'utils/currencies';
import { formatCurrency, formatPercent, zeroBN } from 'utils/formatters/number';
import { formatNumber } from 'utils/formatters/number';
import { getSynthDescription, isEurForex } from 'utils/futures';

type PositionCardProps = {
	dashboard?: boolean;
};

type PositionData = {
	currencyIconKey: string;
	marketShortName: string;
	marketLongName: string;
	marketPrice: string;
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

const PositionCard: React.FC<PositionCardProps> = () => {
	const { t } = useTranslation();
	const position = useRecoilValue(positionState);
	const currencyKey = useRecoilValue(currentMarketState);
	const marketKey = useRecoilValue(marketKeyState);

	const positionDetails = position?.position ?? null;
	const futuresPositionsQuery = useGetFuturesPositionForAccount();
	const { isFuturesMarketClosed } = useFuturesMarketClosed(marketKey);

	const potentialTrade = useRecoilValue(potentialTradeDetailsState);

	const futuresPositions = futuresPositionsQuery?.data ?? null;

	const { synthsMap } = Connector.useContainer();

	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const minDecimals =
		isFiatCurrency(selectedPriceCurrency.name) && isEurForex(marketKey)
			? DEFAULT_FIAT_EURO_DECIMALS
			: undefined;

	const positionHistory = futuresPositions?.find(
		({ asset, isOpen }) => isOpen && asset === currencyKey
	);

	const { marketAssetRate } = useFuturesContext();

	const previewTradeData = useRecoilValue(potentialTradeDetailsState);

	const modifiedAverage = useMemo(() => {
		if (positionHistory && previewTradeData && potentialTrade) {
			const totalSize = positionHistory.size.add(potentialTrade.size);

			const existingValue = positionHistory.avgEntryPrice.mul(positionHistory.size);
			const newValue = previewTradeData.price.mul(potentialTrade.size);
			const totalValue = existingValue.add(newValue);

			return totalSize.gt(0) ? totalValue.div(totalSize) : null;
		}
		return null;
	}, [positionHistory, previewTradeData, potentialTrade]);

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
			leverage: previewTradeData.notionalValue.div(previewTradeData.margin).abs(),
			liquidationPrice: previewTradeData.liqPrice,
			avgEntryPrice: modifiedAverage || zeroBN,
			showStatus: previewTradeData.showStatus,
		};
	}, [positionDetails, previewTradeData, modifiedAverage]);

	const data: PositionData = React.useMemo(() => {
		const pnl = positionDetails?.profitLoss.add(positionDetails?.accruedFunding) ?? zeroBN;
		const pnlPct = pnl.abs().gt(0) ? pnl.div(positionDetails?.initialMargin) : zeroBN;
		const realizedPnl =
			positionHistory?.pnl.add(positionHistory?.netFunding).sub(positionHistory?.feesPaid) ??
			zeroBN;
		const realizedPnlPct = realizedPnl.abs().gt(0)
			? realizedPnl.div(positionHistory?.initialMargin.add(positionHistory?.totalDeposits))
			: zeroBN;
		const netFunding =
			positionDetails?.accruedFunding.add(positionHistory?.netFunding ?? zeroBN) ?? zeroBN;

		return {
			currencyIconKey: currencyKey ? (currencyKey[0] !== 's' ? 's' : '') + currencyKey : '',
			marketShortName: currencyKey
				? (currencyKey[0] === 's' ? currencyKey.slice(1) : currencyKey) + '-PERP'
				: 'Select a market',
			marketLongName: getSynthDescription(currencyKey, synthsMap, t),
			marketPrice: formatCurrency(Synths.sUSD, marketAssetRate, {
				sign: '$',
				minDecimals: marketAssetRate.lt(0.01) ? 4 : 2,
			}),
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
							minDecimals: 2,
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
					  })} (${formatPercent(pnlPct)})`
					: NO_VALUE,
			realizedPnlText:
				positionHistory && realizedPnl
					? `${formatCurrency(Synths.sUSD, realizedPnl, {
							sign: '$',
							minDecimals: realizedPnl.abs().lt(0.01) ? 4 : 2,
					  })} (${formatPercent(realizedPnlPct)})`
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
		marketAssetRate,
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
						<div data-testid="position-card-side-value">{data.positionSide}</div>
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
							<StyledSubtitleWithCursor>
								{t('futures.market.position-card.u-pnl')}
							</StyledSubtitleWithCursor>
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
						<StyledValue data-testid="position-card-leverage-value">{data.leverage}</StyledValue>
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

	${media.lessThan('md')`
		display: flex;
		flex-direction: column;
	`}
`;

const DataCol = styled(FlexDivCol)`
	justify-content: space-between;
`;

const DataColDivider = styled.div`
	width: 1px;
	background-color: #2b2a2a;
	margin: 0 15px;

	${media.lessThan('md')`
		height: 1px;
		width: 100%;
		margin: 15px 0;
	`}
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
	${media.greaterThan('sm')`
		left: -60px;
		z-index: 2;
	`}
`;

const StyledValue = styled.p`
	font-family: ${(props) => props.theme.fonts.mono};
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
