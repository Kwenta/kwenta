import Wei from '@synthetixio/wei';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import PreviewArrow from 'components/PreviewArrow';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { NO_VALUE } from 'constants/placeholder';
import Connector from 'containers/Connector';
import { useFuturesContext } from 'contexts/FuturesContext';
import useAverageEntryPrice from 'hooks/useAverageEntryPrice';
import useFuturesMarketClosed from 'hooks/useFuturesMarketClosed';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { PositionSide } from 'sdk/types/futures';
import {
	selectMarketAsset,
	selectMarketKey,
	selectPosition,
	selectTradePreview,
	selectFuturesType,
	selectSelectedMarketPositionHistory,
} from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { FlexDivCentered, FlexDivCol, PillButtonDiv } from 'styles/common';
import media from 'styles/media';
import { isFiatCurrency } from 'utils/currencies';
import { formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';
import { formatNumber } from 'utils/formatters/number';
import { getMarketName, getSynthDescription, isDecimalFour, MarketKeyByAsset } from 'utils/futures';

import EditLeverageModal from '../TradeCrossMargin/EditCrossMarginLeverageModal';

type PositionCardProps = {
	dashboard?: boolean;
};

type PositionData = {
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
	const { synthsMap } = Connector.useContainer();
	const { marketAssetRate } = useFuturesContext();
	const { selectedPriceCurrency } = useSelectedPriceCurrency();

	const futuresAccountType = useAppSelector(selectFuturesType);
	const position = useAppSelector(selectPosition);
	const marketAsset = useAppSelector(selectMarketAsset);
	const marketKey = useAppSelector(selectMarketKey);
	const previewTradeData = useAppSelector(selectTradePreview);
	const thisPositionHistory = useAppSelector(selectSelectedMarketPositionHistory);
	const { isFuturesMarketClosed } = useFuturesMarketClosed(marketKey);

	const positionDetails = position?.position ?? null;

	const [showEditLeverage, setShowEditLeverage] = useState(false);

	const minDecimals =
		isFiatCurrency(selectedPriceCurrency.name) && isDecimalFour(marketKey)
			? DEFAULT_CRYPTO_DECIMALS
			: undefined;

	const modifiedAverage = useAverageEntryPrice(thisPositionHistory);

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
			leverage: previewTradeData.margin.gt(0)
				? previewTradeData.notionalValue.div(previewTradeData.margin).abs()
				: zeroBN,
			liquidationPrice: previewTradeData.liqPrice,
			avgEntryPrice: modifiedAverage || zeroBN,
			showStatus: previewTradeData.showStatus,
		};
	}, [positionDetails, previewTradeData, modifiedAverage]);

	const data: PositionData = React.useMemo(() => {
		const pnl = positionDetails?.pnl ?? zeroBN;
		const pnlPct = positionDetails?.pnlPct ?? zeroBN;
		const realizedPnl =
			thisPositionHistory?.pnl
				.add(thisPositionHistory?.netFunding)
				.sub(thisPositionHistory?.feesPaid) ?? zeroBN;
		const realizedPnlPct = realizedPnl.abs().gt(0)
			? realizedPnl.div(thisPositionHistory?.initialMargin.add(thisPositionHistory?.totalDeposits))
			: zeroBN;
		const netFunding =
			positionDetails?.accruedFunding.add(thisPositionHistory?.netFunding ?? zeroBN) ?? zeroBN;

		return {
			currencyIconKey: MarketKeyByAsset[marketAsset],
			marketShortName: marketAsset ? getMarketName(marketAsset) : 'Select a market',
			marketLongName: getSynthDescription(marketAsset, synthsMap, t),
			marketPrice: formatDollars(marketAssetRate, {
				minDecimals,
				isAssetPrice: true,
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
					})} (${formatDollars(positionDetails.notionalValue?.abs() ?? zeroBN, {
						minDecimals: positionDetails.notionalValue?.abs()?.lt(0.01) ? 4 : 2,
					})})`}
					<PreviewArrow
						showPreview={
							previewData.positionSize && previewData.sizeIsNotZero && !previewData.showStatus
						}
					>
						{`${formatNumber(previewData.positionSize ?? 0, {
							minDecimals: 2,
						})} (${formatDollars(previewData.notionalValue?.abs() ?? zeroBN, {
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
					{formatDollars(positionDetails?.liquidationPrice ?? zeroBN, {
						minDecimals,
						isAssetPrice: true,
					})}
					{
						<PreviewArrow showPreview={previewData.sizeIsNotZero && !previewData.showStatus}>
							{formatDollars(previewData?.liquidationPrice ?? zeroBN, {
								minDecimals,
								isAssetPrice: true,
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
					? `${formatDollars(pnl, {
							minDecimals: pnl.abs().lt(0.01) ? 4 : 2,
					  })} (${formatPercent(pnlPct)})`
					: NO_VALUE,
			realizedPnlText:
				thisPositionHistory && realizedPnl
					? `${formatDollars(realizedPnl, {
							minDecimals: realizedPnl.abs().lt(0.01) ? 4 : 2,
					  })} (${formatPercent(realizedPnlPct)})`
					: NO_VALUE,
			netFunding: netFunding,
			netFundingText: netFunding
				? `${formatDollars(netFunding, {
						minDecimals: netFunding.abs().lt(0.01) ? 4 : 2,
				  })}`
				: null,
			fees: positionDetails ? formatDollars(thisPositionHistory?.feesPaid ?? zeroBN) : NO_VALUE,
			avgEntryPrice: positionDetails ? (
				<>
					{formatDollars(thisPositionHistory?.entryPrice ?? zeroBN, {
						minDecimals,
						isAssetPrice: true,
					})}
					{
						<PreviewArrow showPreview={previewData.sizeIsNotZero && !previewData.showStatus}>
							{formatDollars(previewData.avgEntryPrice ?? zeroBN, {
								minDecimals,
								isAssetPrice: true,
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
		thisPositionHistory,
		marketAssetRate,
		marketAsset,
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
			{showEditLeverage && <EditLeverageModal editMode="existing_position" />}

			<Container id={isFuturesMarketClosed ? 'closed' : undefined}>
				<DataCol>
					<InfoRow>
						<StyledSubtitle>{data.marketShortName}</StyledSubtitle>
						<StyledValue>{data.marketPrice}</StyledValue>
					</InfoRow>
					<InfoRow>
						<PositionCardTooltip
							preset="fixed"
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
							preset="fixed"
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
							preset="fixed"
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
							preset="fixed"
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
							preset="fixed"
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
						<PositionCardTooltip
							preset="fixed"
							height={'auto'}
							content={t('futures.market.position-card.tooltips.leverage')}
						>
							<StyledSubtitleWithCursor>
								{t('futures.market.position-card.leverage')}
							</StyledSubtitleWithCursor>
						</PositionCardTooltip>
						<FlexDivCentered>
							<StyledValue data-testid="position-card-leverage-value">{data.leverage}</StyledValue>
							{position?.position && futuresAccountType === 'cross_margin' && (
								<PillButtonDiv onClick={() => setShowEditLeverage(true)}>Edit</PillButtonDiv>
							)}
						</FlexDivCentered>
					</InfoRow>
					<InfoRow>
						<PositionCardTooltip
							preset="fixed"
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
						<PositionCardTooltip
							preset="fixed"
							height={'auto'}
							content={t('futures.market.position-card.tooltips.avg-entry-price')}
						>
							<StyledSubtitleWithCursor>
								{t('futures.market.position-card.avg-entry-price')}
							</StyledSubtitleWithCursor>
						</PositionCardTooltip>
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
	padding: 0px 10px 0px 10px;
`;

const StyledValue = styled.p`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
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
