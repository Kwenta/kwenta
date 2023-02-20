import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import ColoredPrice from 'components/ColoredPrice';
import { FlexDivCentered, FlexDivCol } from 'components/layout/flex';
import PreviewArrow from 'components/PreviewArrow';
import { Body } from 'components/Text';
import Tooltip from 'components/Tooltip/Tooltip';
import { NO_VALUE } from 'constants/placeholder';
import useFuturesMarketClosed from 'hooks/useFuturesMarketClosed';
import { PositionSide } from 'sdk/types/futures';
import { setOpenModal } from 'state/app/reducer';
import { selectOpenModal } from 'state/app/selectors';
import {
	selectMarketAsset,
	selectMarketKey,
	selectPosition,
	selectSkewAdjustedPrice,
	selectMarketPriceInfo,
	selectSelectedMarketPositionHistory,
	selectPreviewData,
	selectFuturesType,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { PillButtonDiv } from 'styles/common';
import media from 'styles/media';
import { formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';
import { formatNumber } from 'utils/formatters/number';
import { getMarketName } from 'utils/futures';

import EditLeverageModal from '../TradeCrossMargin/EditCrossMarginLeverageModal';

const PositionCard = memo(() => {
	const marketKey = useAppSelector(selectMarketKey);
	const openModal = useAppSelector(selectOpenModal);
	const { isFuturesMarketClosed } = useFuturesMarketClosed(marketKey);

	return (
		<>
			{openModal === 'futures_cross_leverage' && <EditLeverageModal editMode="existing_position" />}

			<Container id={isFuturesMarketClosed ? 'closed' : undefined}>
				<DataCol>
					<MarketNameRow />
					<PositionSideRow />
					<PositionSizeRow />
				</DataCol>
				<DataColDivider />
				<DataCol>
					<NetFundingRow />
					<UnrealizedPNLRow />
					<RealizedPNLRow />
				</DataCol>
				<DataColDivider />
				<DataCol>
					<LeverageRow />
					<LiquidationPriceRow />
					<AverageEntryPriceRow />
				</DataCol>
			</Container>
		</>
	);
});

const MarketNameRow = memo(() => {
	const marketPriceInfo = useAppSelector(selectMarketPriceInfo);
	const marketAsset = useAppSelector(selectMarketAsset);
	const marketPrice = useAppSelector(selectSkewAdjustedPrice);
	const marketShortName = getMarketName(marketAsset);
	const previewData = useAppSelector(selectPreviewData);

	return (
		<InfoRow>
			<Subtitle>{marketShortName}</Subtitle>
			<ColoredPrice priceInfo={marketPriceInfo}>
				{formatDollars(marketPrice, { suggestDecimals: true })}
				<PreviewArrow showPreview={previewData.sizeIsNotZero && !previewData.showStatus}>
					{formatDollars(previewData.fillPrice ?? zeroBN, { suggestDecimals: true })}
				</PreviewArrow>
			</ColoredPrice>
		</InfoRow>
	);
});

const PositionSideRow = memo(() => {
	const { t } = useTranslation();
	const position = useAppSelector(selectPosition);
	const previewData = useAppSelector(selectPreviewData);
	const positionDetails = position?.position;

	return (
		<InfoRow>
			<PositionCardTooltip content={t('futures.market.position-card.tooltips.position-side')}>
				<SubtitleWithCursor>{t('futures.market.position-card.position-side')}</SubtitleWithCursor>
			</PositionCardTooltip>
			<div data-testid="position-card-side-value">
				{positionDetails ? (
					<PositionValue side={positionDetails.side}>
						{positionDetails.side}
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
				)}
			</div>
		</InfoRow>
	);
});

const PositionSizeRow = memo(() => {
	const { t } = useTranslation();
	const position = useAppSelector(selectPosition);
	const previewData = useAppSelector(selectPreviewData);
	const positionDetails = position?.position;

	return (
		<InfoRow>
			<PositionCardTooltip content={t('futures.market.position-card.tooltips.position-size')}>
				<SubtitleWithCursor>{t('futures.market.position-card.position-size')}</SubtitleWithCursor>
			</PositionCardTooltip>
			<StyledValue>
				{positionDetails ? (
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
				)}
			</StyledValue>
		</InfoRow>
	);
});

const NetFundingRow = memo(() => {
	const { t } = useTranslation();
	const position = useAppSelector(selectPosition);
	const positionDetails = position?.position;
	const positionHistory = useAppSelector(selectSelectedMarketPositionHistory);

	const netFunding =
		positionDetails?.accruedFunding.add(positionHistory?.netFunding ?? zeroBN) ?? zeroBN;

	const netFundingText = netFunding
		? `${formatDollars(netFunding, {
				minDecimals: netFunding.abs().lt(0.01) ? 4 : 2,
		  })}`
		: null;

	return (
		<InfoRow>
			<PositionCardTooltip content={t('futures.market.position-card.tooltips.net-funding')}>
				<SubtitleWithCursor>{t('futures.market.position-card.net-funding')}</SubtitleWithCursor>
			</PositionCardTooltip>
			{positionDetails ? (
				<StyledValue className={netFunding.gt(0) ? 'green' : netFunding.lt(0) ? 'red' : ''}>
					{netFundingText}
				</StyledValue>
			) : (
				<StyledValue>{NO_VALUE}</StyledValue>
			)}
		</InfoRow>
	);
});

const UnrealizedPNLRow = memo(() => {
	const { t } = useTranslation();
	const position = useAppSelector(selectPosition);
	const positionDetails = position?.position;

	const pnl = positionDetails?.pnl ?? zeroBN;
	const pnlPct = positionDetails?.pnlPct ?? zeroBN;
	const pnlText =
		positionDetails && pnl
			? `${formatDollars(pnl, {
					minDecimals: pnl.abs().lt(0.01) ? 4 : 2,
			  })} (${formatPercent(pnlPct)})`
			: NO_VALUE;

	return (
		<InfoRow>
			<PositionCardTooltip content={t('futures.market.position-card.tooltips.u-pnl')}>
				<SubtitleWithCursor>{t('futures.market.position-card.u-pnl')}</SubtitleWithCursor>
			</PositionCardTooltip>
			{positionDetails ? (
				<StyledValue className={pnl.gt(0) ? 'green' : pnl.lt(0) ? 'red' : ''}>
					{pnlText}
				</StyledValue>
			) : (
				<StyledValue>{NO_VALUE}</StyledValue>
			)}
		</InfoRow>
	);
});

const RealizedPNLRow = memo(() => {
	const { t } = useTranslation();
	const positionHistory = useAppSelector(selectSelectedMarketPositionHistory);
	const position = useAppSelector(selectPosition);
	const positionDetails = position?.position;
	const realizedPnl =
		positionHistory?.pnl.add(positionHistory?.netFunding).sub(positionHistory?.feesPaid) ?? zeroBN;
	const realizedPnlPct = realizedPnl.abs().gt(0)
		? realizedPnl.div(positionHistory?.initialMargin.add(positionHistory?.totalDeposits))
		: zeroBN;
	const realizedPnlText =
		positionHistory && realizedPnl
			? `${formatDollars(realizedPnl, {
					minDecimals: realizedPnl.abs().lt(0.01) ? 4 : 2,
			  })} (${formatPercent(realizedPnlPct)})`
			: NO_VALUE;

	return (
		<InfoRow>
			<PositionCardTooltip content={t('futures.market.position-card.tooltips.r-pnl')}>
				<SubtitleWithCursor>{t('futures.market.position-card.r-pnl')}</SubtitleWithCursor>
			</PositionCardTooltip>
			{positionDetails ? (
				<StyledValue className={realizedPnl.gt(0) ? 'green' : realizedPnl < zeroBN ? 'red' : ''}>
					{realizedPnlText}
				</StyledValue>
			) : (
				<StyledValue>{NO_VALUE}</StyledValue>
			)}
		</InfoRow>
	);
});

const LeverageRow = memo(() => {
	const { t } = useTranslation();
	const futuresAccountType = useAppSelector(selectFuturesType);
	const dispatch = useAppDispatch();
	const position = useAppSelector(selectPosition);
	const previewData = useAppSelector(selectPreviewData);
	const positionDetails = position?.position;

	return (
		<InfoRow>
			<PositionCardTooltip content={t('futures.market.position-card.tooltips.leverage')}>
				<SubtitleWithCursor>{t('futures.market.position-card.leverage')}</SubtitleWithCursor>
			</PositionCardTooltip>
			<FlexDivCentered>
				<StyledValue data-testid="position-card-leverage-value">
					{positionDetails ? (
						<>
							{formatNumber(positionDetails?.leverage ?? zeroBN) + 'x'}
							<PreviewArrow showPreview={previewData.sizeIsNotZero && !previewData.showStatus}>
								{formatNumber(previewData?.leverage ?? zeroBN) + 'x'}
							</PreviewArrow>
						</>
					) : (
						NO_VALUE
					)}
				</StyledValue>
				{position?.position && futuresAccountType === 'cross_margin' && (
					<PillButtonDiv onClick={() => dispatch(setOpenModal('futures_cross_leverage'))}>
						Edit
					</PillButtonDiv>
				)}
			</FlexDivCentered>
		</InfoRow>
	);
});

const LiquidationPriceRow = memo(() => {
	const { t } = useTranslation();
	const position = useAppSelector(selectPosition);
	const previewData = useAppSelector(selectPreviewData);
	const positionDetails = position?.position;

	return (
		<InfoRow>
			<PositionCardTooltip content={t('futures.market.position-card.tooltips.liquidation-price')}>
				<SubtitleWithCursor>
					{t('futures.market.position-card.liquidation-price')}
				</SubtitleWithCursor>
			</PositionCardTooltip>
			<StyledValue>
				{positionDetails ? (
					<>
						{formatDollars(positionDetails?.liquidationPrice ?? zeroBN, { suggestDecimals: true })}
						<PreviewArrow showPreview={previewData.sizeIsNotZero && !previewData.showStatus}>
							{formatDollars(previewData?.liquidationPrice ?? zeroBN, { suggestDecimals: true })}
						</PreviewArrow>
					</>
				) : (
					NO_VALUE
				)}
			</StyledValue>
		</InfoRow>
	);
});

const AverageEntryPriceRow = memo(() => {
	const { t } = useTranslation();
	const position = useAppSelector(selectPosition);
	const previewData = useAppSelector(selectPreviewData);
	const positionDetails = position?.position;
	const positionHistory = useAppSelector(selectSelectedMarketPositionHistory);

	return (
		<InfoRow>
			<PositionCardTooltip content={t('futures.market.position-card.tooltips.avg-entry-price')}>
				<SubtitleWithCursor>{t('futures.market.position-card.avg-entry-price')}</SubtitleWithCursor>
			</PositionCardTooltip>
			<StyledValue>
				{positionDetails ? (
					<>
						{formatDollars(positionHistory?.entryPrice ?? zeroBN, { suggestDecimals: true })}
						<PreviewArrow showPreview={previewData.sizeIsNotZero && !previewData.showStatus}>
							{formatDollars(previewData.avgEntryPrice ?? zeroBN, { suggestDecimals: true })}
						</PreviewArrow>
					</>
				) : (
					NO_VALUE
				)}
			</StyledValue>
		</InfoRow>
	);
});

export default PositionCard;

export const Container = styled.div`
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

export const DataCol = styled(FlexDivCol)`
	justify-content: space-between;
`;

export const DataColDivider = styled.div`
	width: 1px;
	background-color: #2b2a2a;
	margin: 0 15px;

	${media.lessThan('md')`
		height: 1px;
		width: 100%;
		margin: 15px 0;
	`}
`;

export const InfoRow = styled.div`
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

export const Subtitle = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.text.label};
	text-transform: capitalize;
`;

const SubtitleWithCursor = styled(Subtitle)`
	cursor: help;
`;

const PositionCardTooltip = styled(Tooltip).attrs({ preset: 'fixed', height: 'auto' })`
	z-index: 2;
	padding: 10px;
`;

export const StyledValue = styled(Body).attrs({ mono: true })`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	text-align: end;
	${Container}#closed & {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

export const PositionValue = styled.span<{ side?: PositionSide }>`
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
