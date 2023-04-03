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
import SelectorButtons from 'components/SelectorButtons/SelectorButtons';
import Spacer from 'components/Spacer';
import { Body } from 'components/Text';
import { previewErrorI18n } from 'queries/futures/constants';
import { PositionSide, PotentialTradeStatus } from 'sdk/types/futures';
import { setShowPositionModal } from 'state/app/reducer';
import { selectShowPositionModal, selectTransaction } from 'state/app/selectors';
import {
	editClosePositionSizeDelta,
	editCrossMarginPositionSize,
	submitSmartMarginReducePositionOrder,
} from 'state/futures/actions';
import { setClosePositionOrderType } from 'state/futures/reducer';
import {
	selectClosePositionOrderInputs,
	selectIsFetchingTradePreview,
	selectPosition,
	selectPositionPreviewData,
	selectSubmittingFuturesTx,
	selectTradePreview,
	selectTradePreviewError,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { floorNumber, formatDollars, formatNumber, zeroBN } from 'utils/formatters/number';

import OrderTypeSelector from '../Trade/OrderTypeSelector';
import ClosePositionPriceInput from './ClosePositionPriceInput';
import ClosePositionSizeInput from './ClosePositionSizeInput';

const CLOSE_PERCENT_OPTIONS = ['25%', '50%', '75%', '100%'];

export default function ClosePositionModal() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const transactionState = useAppSelector(selectTransaction);
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx);
	const isFetchingPreview = useAppSelector(selectIsFetchingTradePreview);
	const position = useAppSelector(selectPosition);
	const previewTrade = useAppSelector(selectTradePreview);
	const preview = useAppSelector(selectPositionPreviewData);
	const previewError = useAppSelector(selectTradePreviewError);

	const { nativeSizeDelta, orderType, price } = useAppSelector(selectClosePositionOrderInputs);
	const showModal = useAppSelector(selectShowPositionModal);

	const submitCloseOrder = useCallback(() => {
		dispatch(submitSmartMarginReducePositionOrder());
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

	const invalidSize = useMemo(() => sizeWei.gt(maxNativeValue), [sizeWei, maxNativeValue]);

	const orderError = useMemo(() => {
		if (previewError) return t(previewErrorI18n(previewError));
		if (previewTrade?.showStatus) return previewTrade?.statusMessage;
		return null;
	}, [previewTrade?.showStatus, previewTrade?.statusMessage, previewError, t]);

	const submitDisabled = useMemo(() => {
		if (
			(orderType === 'limit' || orderType === 'stop_market') &&
			(!price?.value || Number(price.value) === 0)
		) {
			return true;
		}
		return (
			sizeWei.eq(0) ||
			invalidSize ||
			price?.invalidLabel ||
			isLoading ||
			orderError ||
			previewTrade?.status !== PotentialTradeStatus.OK
		);
	}, [
		sizeWei,
		invalidSize,
		isLoading,
		orderError,
		price?.invalidLabel,
		price?.value,
		orderType,
		previewTrade?.status,
	]);

	const onClose = () => {
		if (showModal) {
			dispatch(editCrossMarginPositionSize(showModal.marketKey, ''));
		}
		dispatch(setShowPositionModal(null));
	};

	const onSelectPercent = useCallback(
		(index) => {
			if (!position?.position?.size || !showModal?.marketKey) return;
			const option = CLOSE_PERCENT_OPTIONS[index];
			const percent = Math.abs(Number(option.replace('%', ''))) / 100;
			const size = floorNumber(position.position.size.abs().mul(percent));
			const sizeDelta = position?.position.side === PositionSide.LONG ? wei(size).neg() : wei(size);
			const decimals = sizeDelta.abs().eq(position.position.size.abs()) ? undefined : 4;
			dispatch(editClosePositionSizeDelta(showModal.marketKey, sizeDelta.toString(decimals)));
		},
		[dispatch, position?.position?.size, position?.position?.side, showModal?.marketKey]
	);

	return (
		<StyledBaseModal title="Close full or partial position" isOpen onDismiss={onClose}>
			<Spacer height={10} />
			<OrderTypeSelector orderType={orderType} setOrderTypeAction={setClosePositionOrderType} />
			<Spacer height={20} />

			<ClosePositionSizeInput maxNativeValue={maxNativeValue} />
			<SelectorButtons options={CLOSE_PERCENT_OPTIONS} onSelect={onSelectPercent} />

			{(orderType === 'limit' || orderType === 'stop_market') && (
				<>
					<Spacer height={20} />
					<ClosePositionPriceInput />
				</>
			)}
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
				onClick={submitCloseOrder}
			>
				{t('futures.market.trade.edit-position.submit-close')}
			</Button>

			{(orderError || transactionState?.error) && (
				<>
					<Spacer height={20} />
					<ErrorView message={orderError || transactionState?.error} formatter="revert" />
				</>
			)}
		</StyledBaseModal>
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
