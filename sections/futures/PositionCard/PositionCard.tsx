import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import ColoredPrice from 'components/ColoredPrice';
import { InfoBoxRow } from 'components/InfoBox';
import { FlexDivCentered, FlexDivCol } from 'components/layout/flex';
import Pill from 'components/Pill';
import PreviewArrow from 'components/PreviewArrow';
import Spacer from 'components/Spacer';
import { Body, NumericValue } from 'components/Text';
import Tooltip from 'components/Tooltip/Tooltip';
import { NO_VALUE } from 'constants/placeholder';
import { PositionSide } from 'sdk/types/futures';
import { setShowPositionModal } from 'state/app/reducer';
import {
	selectMarketAsset,
	selectPosition,
	selectSkewAdjustedPrice,
	selectMarketPriceInfo,
	selectSelectedMarketPositionHistory,
	selectPositionPreviewData,
	selectFuturesType,
	selectMarketInfo,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import media from 'styles/media';
import { formatDollars, formatPercent, zeroBN } from 'utils/formatters/number';
import { formatNumber } from 'utils/formatters/number';
import { getMarketName } from 'utils/futures';

const PositionCard = memo(() => {
	const marketInfo = useAppSelector(selectMarketInfo);

	return (
		<>
			<Container id={marketInfo?.isSuspended ? 'closed' : undefined}>
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
	const previewData = useAppSelector(selectPositionPreviewData);

	return (
		<InfoRow>
			<Subtitle>{marketShortName}</Subtitle>
			<ColoredPrice priceInfo={marketPriceInfo}>
				{formatDollars(marketPrice, { suggestDecimals: true })}
				<PreviewArrow showPreview={!!previewData?.sizeIsNotZero && !previewData.showStatus}>
					{formatDollars(previewData?.fillPrice ?? zeroBN, { suggestDecimals: true })}
				</PreviewArrow>
			</ColoredPrice>
		</InfoRow>
	);
});

const PositionSideRow = memo(() => {
	const { t } = useTranslation();
	const position = useAppSelector(selectPosition);
	const previewData = useAppSelector(selectPositionPreviewData);
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
						{previewData?.positionSide !== positionDetails.side && (
							<PreviewArrow
								showPreview={
									!!previewData?.sizeIsNotZero &&
									previewData?.positionSide !== positionDetails.side &&
									!previewData?.showStatus
								}
							>
								<PositionValue side={previewData?.positionSide as PositionSide}>
									{previewData?.positionSide}
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
	const previewData = useAppSelector(selectPositionPreviewData);
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
							suggestDecimals: true,
						})} (${formatDollars(positionDetails.notionalValue?.abs() ?? zeroBN, {
							suggestDecimals: true,
						})})`}
						<PreviewArrow
							showPreview={
								!!previewData?.positionSize &&
								previewData?.sizeIsNotZero &&
								!previewData?.showStatus
							}
						>
							{`${formatNumber(previewData?.positionSize ?? 0, {
								minDecimals: 2,
							})} (${formatDollars(previewData?.notionalValue?.abs() ?? zeroBN, {
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
				<StyledNumericValue colored value={netFunding}>
					{netFundingText}
				</StyledNumericValue>
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
				<StyledNumericValue colored value={pnl}>
					{pnlText}
				</StyledNumericValue>
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
		positionHistory?.pnl
			.add(positionHistory?.netFunding)
			.add(position?.position?.accruedFunding ?? zeroBN)
			.sub(positionHistory?.feesPaid) ?? zeroBN;
	const realizedPnlText =
		positionHistory && realizedPnl
			? `${formatDollars(realizedPnl, {
					minDecimals: realizedPnl.abs().lt(0.01) ? 4 : 2,
			  })}`
			: NO_VALUE;

	const rpnlTooltipContent = useMemo(() => {
		const feesPaid = positionHistory?.feesPaid.neg() ?? zeroBN;
		const fundingPaid =
			positionHistory?.netFunding.add(positionDetails?.accruedFunding ?? zeroBN) ?? zeroBN;
		const priceAction = positionHistory?.pnl ?? zeroBN;

		return (
			<div>
				<StyledBody>{t('futures.market.position-card.tooltips.r-pnl')}</StyledBody>

				<InfoBoxRow
					title="Price Action"
					value={formatDollars(priceAction, {
						minDecimals: 2,
					})}
					isSubItem
				/>
				<InfoBoxRow
					title="Fees"
					value={formatDollars(feesPaid, {
						minDecimals: 2,
					})}
					isSubItem
				/>
				<InfoBoxRow
					title="Funding"
					value={formatDollars(fundingPaid, {
						minDecimals: 2,
					})}
					isSubItem
				/>
			</div>
		);
	}, [t, positionHistory, positionDetails]);

	return (
		<InfoRow>
			<PositionCardTooltip content={rpnlTooltipContent}>
				<SubtitleWithCursor>{t('futures.market.position-card.r-pnl')}</SubtitleWithCursor>
			</PositionCardTooltip>
			{positionDetails ? (
				<StyledNumericValue colored value={realizedPnl}>
					{realizedPnlText}
				</StyledNumericValue>
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
	const previewData = useAppSelector(selectPositionPreviewData);
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
							<PreviewArrow showPreview={!!previewData?.sizeIsNotZero && !previewData?.showStatus}>
								{formatNumber(previewData?.leverage ?? zeroBN) + 'x'}
							</PreviewArrow>
						</>
					) : (
						NO_VALUE
					)}
				</StyledValue>
				{position?.position && futuresAccountType === 'cross_margin' && (
					<>
						<Spacer width={10} />
						<Pill
							onClick={() =>
								dispatch(
									setShowPositionModal({
										type: 'futures_edit_position_margin',
										marketKey: position.marketKey,
									})
								)
							}
						>
							EDIT
						</Pill>
					</>
				)}
			</FlexDivCentered>
		</InfoRow>
	);
});

const LiquidationPriceRow = memo(() => {
	const { t } = useTranslation();
	const position = useAppSelector(selectPosition);
	const previewData = useAppSelector(selectPositionPreviewData);
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
						<PreviewArrow showPreview={!!previewData?.sizeIsNotZero && !previewData?.showStatus}>
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
	const previewData = useAppSelector(selectPositionPreviewData);
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
						<PreviewArrow showPreview={!!previewData?.sizeIsNotZero && !previewData?.showStatus}>
							{formatDollars(previewData?.avgEntryPrice ?? zeroBN, { suggestDecimals: true })}
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

const StyledNumericValue = styled(NumericValue)`
	text-align: end;
`;

const StyledBody = styled(Body)`
	margin-bottom: 8px;
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
