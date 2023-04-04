import { wei } from '@synthetixio/wei';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import BaseModal from 'components/BaseModal';
import Button from 'components/Button';
import ErrorView from 'components/ErrorView';
import { InfoBoxContainer, InfoBoxRow } from 'components/InfoBox';
import { FlexDivRowCentered } from 'components/layout/flex';
import PreviewArrow from 'components/PreviewArrow';
import SegmentedControl from 'components/SegmentedControl';
import Spacer from 'components/Spacer';
import { Body } from 'components/Text';
import { APP_MAX_LEVERAGE } from 'constants/futures';
import { previewErrorI18n } from 'queries/futures/constants';
import { getDisplayAsset } from 'sdk/utils/futures';
import { setShowPositionModal } from 'state/app/reducer';
import { selectShowPositionModal, selectTransaction } from 'state/app/selectors';
import {
	clearTradeInputs,
	editCrossMarginPositionMargin,
	submitCrossMarginAdjustMargin,
} from 'state/futures/actions';
import {
	selectEditPositionInputs,
	selectEditPositionModalInfo,
	selectIdleMargin,
	selectIsFetchingTradePreview,
	selectPosition,
	selectPositionPreviewData,
	selectSubmittingFuturesTx,
	selectTradePreview,
	selectTradePreviewError,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { formatDollars, zeroBN } from 'utils/formatters/number';

import EditPositionMarginInput from './EditPositionMarginInput';

export default function EditPositionMarginModal() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const transactionState = useAppSelector(selectTransaction);
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx);
	const isFetchingPreview = useAppSelector(selectIsFetchingTradePreview);
	const position = useAppSelector(selectPosition);
	const preview = useAppSelector(selectPositionPreviewData);
	const { marginDelta } = useAppSelector(selectEditPositionInputs);
	const idleMargin = useAppSelector(selectIdleMargin);
	const modal = useAppSelector(selectShowPositionModal);
	const { market } = useAppSelector(selectEditPositionModalInfo);
	const previewError = useAppSelector(selectTradePreviewError);
	const previewTrade = useAppSelector(selectTradePreview);
	const [transferType, setTransferType] = useState(0);

	useEffect(() => {
		dispatch(clearTradeInputs());
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onChangeTab = (selection: number) => {
		setTransferType(selection);
	};

	const submitMarginChange = useCallback(() => {
		dispatch(submitCrossMarginAdjustMargin());
	}, [dispatch]);

	const isLoading = useMemo(() => isSubmitting || isFetchingPreview, [
		isSubmitting,
		isFetchingPreview,
	]);

	const maxWithdraw = useMemo(() => {
		const maxSize = position?.remainingMargin.mul(APP_MAX_LEVERAGE);
		const currentSize = position?.position?.notionalValue;
		const max = maxSize?.sub(currentSize).div(APP_MAX_LEVERAGE) ?? wei(0);
		return max.lt(0) ? zeroBN : max;
	}, [position?.remainingMargin, position?.position?.notionalValue]);

	const maxUsdInputAmount = useMemo(() => (transferType === 0 ? idleMargin : maxWithdraw), [
		idleMargin,
		maxWithdraw,
		transferType,
	]);

	const marginWei = useMemo(
		() => (!marginDelta || isNaN(Number(marginDelta)) ? wei(0) : wei(marginDelta)),
		[marginDelta]
	);

	const invalid = useMemo(() => marginWei.gt(maxUsdInputAmount), [marginWei, maxUsdInputAmount]);

	const maxLeverageExceeded =
		transferType === 1 && position?.position?.leverage.gt(APP_MAX_LEVERAGE);

	const orderError = useMemo(() => {
		if (previewError) return t(previewErrorI18n(previewError));
		if (previewTrade?.showStatus) return previewTrade?.statusMessage;
		return null;
	}, [previewTrade?.showStatus, previewTrade?.statusMessage, previewError, t]);

	const submitDisabled = useMemo(() => {
		return marginWei.eq(0) || invalid || isLoading || maxLeverageExceeded || orderError;
	}, [marginWei, invalid, isLoading, maxLeverageExceeded, orderError]);

	const onClose = () => {
		if (modal?.marketKey) {
			dispatch(editCrossMarginPositionMargin(modal.marketKey, ''));
		}
		dispatch(setShowPositionModal(null));
	};

	const marketAsset = market ? getDisplayAsset(market?.asset) : '';

	return (
		<StyledBaseModal
			title={
				transferType === 0
					? `Increase ${marketAsset} Position Margin`
					: `Reduce ${marketAsset} Position Margin`
			}
			isOpen
			onDismiss={onClose}
		>
			<Spacer height={10} />

			<SegmentedControl
				values={['Add Margin', 'Withdraw']}
				selectedIndex={transferType}
				onChange={onChangeTab}
			/>
			<Spacer height={20} />

			<EditPositionMarginInput
				maxUsdInput={maxUsdInputAmount}
				type={transferType === 0 ? 'deposit' : 'withdraw'}
			/>

			<Spacer height={20} />
			<InfoBoxContainer>
				<InfoBoxRow
					valueNode={
						preview?.leverage && (
							<PreviewArrow showPreview>{preview.leverage.toString(2)}x</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.leverage-change')}
					value={position?.position?.leverage.toString(2) + 'x'}
				/>
				<InfoBoxRow
					valueNode={
						preview?.leverage && (
							<PreviewArrow showPreview>
								{position?.remainingMargin
									? formatDollars(position?.remainingMargin.add(marginWei))
									: '-'}
							</PreviewArrow>
						)
					}
					title={t('futures.market.trade.edit-position.margin-change')}
					value={formatDollars(position?.remainingMargin || 0)}
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
				{transferType === 0
					? t('futures.market.trade.edit-position.submit-margin-deposit')
					: t('futures.market.trade.edit-position.submit-margin-withdraw')}
			</Button>

			{(transactionState?.error || orderError || maxLeverageExceeded) && (
				<>
					<Spacer height={20} />
					<ErrorView
						message={transactionState?.error || orderError || 'Max leverage exceeded'}
						formatter="revert"
					/>
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
