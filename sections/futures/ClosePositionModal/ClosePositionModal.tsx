import { wei } from '@synthetixio/wei';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox';
import { FlexDivRowCentered } from 'components/layout/flex';
import PreviewArrow from 'components/PreviewArrow';
import SegmentedControl from 'components/SegmentedControl';
import SelectorButtons from 'components/SelectorButtons/SelectorButtons';
import Spacer from 'components/Spacer';
import { Body } from 'components/Text';
import { CROSS_MARGIN_ORDER_TYPES } from 'constants/futures';
import { PositionSide } from 'sdk/types/futures';
import { OrderNameByType } from 'sdk/utils/futures';
import { setShowPositionModal } from 'state/app/reducer';
import { selectShowPositionModal, selectTransaction } from 'state/app/selectors';
import {
	editCrossMarginPositionSize,
	submitCrossMarginAdjustPositionSize,
} from 'state/futures/actions';
import { setClosePositionOrderType, setClosePositionSizeDelta } from 'state/futures/reducer';
import {
	selectClosePositionOrderInputs,
	selectIsFetchingTradePreview,
	selectPosition,
	selectPositionPreviewData,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { floorNumber, formatDollars, formatNumber, zeroBN } from 'utils/formatters/number';

import ClosePositionSizeInput from './ClosePositionSizeInput';

const CLOSE_PERCENT_OPTIONS = ['25%', '50%', '75%', '100%'];

export default function ClosePositionModal() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const transactionState = useAppSelector(selectTransaction);
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx);
	const isFetchingPreview = useAppSelector(selectIsFetchingTradePreview);
	const position = useAppSelector(selectPosition);
	const preview = useAppSelector(selectPositionPreviewData);
	const { nativeSizeDelta } = useAppSelector(selectClosePositionOrderInputs);
	const showModal = useAppSelector(selectShowPositionModal);

	const submitMarginChange = useCallback(() => {
		dispatch(submitCrossMarginAdjustPositionSize());
	}, [dispatch]);

	const isLoading = useMemo(() => isSubmitting || isFetchingPreview, [
		isSubmitting,
		isFetchingPreview,
	]);

	const maxNativeValue = useMemo(() => {
		return position?.position?.size ?? zeroBN;
	}, [position?.position?.size]);

	const sizeWei = useMemo(
		() => (!nativeSizeDelta || isNaN(Number(nativeSizeDelta)) ? wei(0) : wei(nativeSizeDelta)),
		[nativeSizeDelta]
	);

	const invalid = useMemo(() => sizeWei.gt(maxNativeValue), [sizeWei, maxNativeValue]);

	const submitDisabled = useMemo(() => {
		return sizeWei.eq(0) || invalid || isLoading;
	}, [sizeWei, invalid, isLoading]);

	const onClose = () => {
		if (showModal) {
			dispatch(editCrossMarginPositionSize(showModal.marketKey, ''));
		}
		dispatch(setShowPositionModal(null));
	};

	const onSelectPercent = useCallback(
		(index) => {
			if (!position?.position?.size) return;
			const option = CLOSE_PERCENT_OPTIONS[index];
			const percent = Math.abs(Number(option.replace('%', ''))) / 100;
			const size = floorNumber(position.position.size.abs().mul(percent));
			const sizeDelta = position?.position.side === PositionSide.LONG ? wei(size).neg() : wei(size);
			dispatch(setClosePositionSizeDelta(sizeDelta.toString()));
		},
		[dispatch, position?.position?.size, position?.position?.side]
	);

	return (
		<StyledBaseModal title="Close full or partial position" isOpen onDismiss={onClose}>
			<Spacer height={10} />
			<OrderTypeSelector />
			<Spacer height={20} />

			<ClosePositionSizeInput maxNativeValue={maxNativeValue} />
			<SelectorButtons options={CLOSE_PERCENT_OPTIONS} onSelect={onSelectPercent} />

			<Spacer height={20} />
			<InfoBoxContainer>
				<InfoBoxRow
					valueNode={
						preview?.leverage && (
							<PreviewArrow showPreview>{preview.leverage.toString(2)}x</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.leverage-change')}
					value={position?.position ? position?.position?.leverage.toString(2) + 'x' : '-'}
				/>
				<InfoBoxRow
					valueNode={
						preview?.leverage && (
							<PreviewArrow showPreview>
								{position?.remainingMargin
									? formatNumber(preview.positionSize, { suggestDecimals: true })
									: '-'}
							</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.position-size')}
					value={formatNumber(position?.position?.size || 0, { suggestDecimals: true })}
				/>
				<InfoBoxRow
					valueNode={
						preview?.leverage && (
							<PreviewArrow showPreview>
								{preview ? formatDollars(preview.liquidationPrice) : '-'}
							</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.liquidation')}
					value={formatDollars(position?.position?.liquidationPrice || 0)}
				/>
			</InfoBoxContainer>
			<Spacer height={20} />

			<Button
				loading={isLoading}
				variant="flat"
				data-testid="futures-market-trade-deposit-margin-button"
				disabled={submitDisabled}
				fullWidth
				onClick={submitMarginChange}
			>
				{t('futures.market.trade.edit-position.submit-size-increase')}
			</Button>

			{transactionState?.error && (
				<>
					<Spacer height={20} />
					<ErrorView
						message={transactionState?.error || 'Max leverage exceeded'}
						formatter="revert"
					/>
				</>
			)}
		</StyledBaseModal>
	);
}

function OrderTypeSelector() {
	const dispatch = useAppDispatch();
	const { orderType } = useAppSelector(selectClosePositionOrderInputs);

	return (
		<SegmentedControl
			values={CROSS_MARGIN_ORDER_TYPES.map((o) => OrderNameByType[o])}
			selectedIndex={CROSS_MARGIN_ORDER_TYPES.indexOf(orderType)}
			onChange={(index: number) => {
				const type = CROSS_MARGIN_ORDER_TYPES[index];
				dispatch(setClosePositionOrderType(type));
			}}
		/>
	);
}

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

export const InfoContainer = styled(FlexDivRowCentered)`
	margin: 16px 0;
`;

export const BalanceText = styled(Body)`
	color: ${(props) => props.theme.colors.selectedTheme.gray};
	span {
		color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	}
`;

export const MaxButton = styled.button`
	height: 22px;
	padding: 4px 10px;
	background: ${(props) => props.theme.colors.selectedTheme.button.background};
	border-radius: 11px;
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	line-height: 13px;
	border: ${(props) => props.theme.colors.selectedTheme.border};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	cursor: pointer;
`;
