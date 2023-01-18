import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import Error from 'components/Error';
import Loader from 'components/Loader';
import { useFuturesContext } from 'contexts/FuturesContext';
import { previewErrorI18n } from 'queries/futures/constants';
import { setOpenModal } from 'state/app/reducer';
import { selectOpenModal, selectTransaction } from 'state/app/selectors';
import {
	selectMarketInfo,
	selectIsMarketCapReached,
	selectMarketAssetRate,
	selectPlaceOrderTranslationKey,
	selectPosition,
	selectMaxLeverage,
	selectTradePreviewError,
	selectTradePreview,
	selectTradePreviewStatus,
	selectTradeSizeInputs,
	selectIsolatedMarginLeverage,
	selectCrossMarginOrderPrice,
	selectOrderType,
	selectIsAdvancedOrder,
	selectFuturesType,
	selectCrossMarginMarginDelta,
	selectLeverageSide,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';
import { isZero } from 'utils/formatters/number';
import { orderPriceInvalidLabel } from 'utils/futures';

import ClosePositionModalCrossMargin from '../PositionCard/ClosePositionModalCrossMargin';
import ClosePositionModalIsolatedMargin from '../PositionCard/ClosePositionModalIsolatedMargin';
import TradeConfirmationModalCrossMargin from './TradeConfirmationModalCrossMargin';
import TradeConfirmationModalIsolatedMargin from './TradeConfirmationModalIsolatedMargin';

const ManagePosition: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const { maxUsdInputAmount } = useFuturesContext();

	const { susdSize } = useAppSelector(selectTradeSizeInputs);
	const marginDelta = useAppSelector(selectCrossMarginMarginDelta);
	const position = useAppSelector(selectPosition);
	const maxLeverageValue = useAppSelector(selectMaxLeverage);
	const selectedAccountType = useAppSelector(selectFuturesType);
	const previewTrade = useAppSelector(selectTradePreview);

	const previewError = useAppSelector(selectTradePreviewError);
	const leverage = useAppSelector(selectIsolatedMarginLeverage);
	const orderType = useAppSelector(selectOrderType);
	const leverageSide = useAppSelector(selectLeverageSide);

	const futuresTransaction = useAppSelector(selectTransaction);
	const isMarketCapReached = useAppSelector(selectIsMarketCapReached);
	const placeOrderTranslationKey = useAppSelector(selectPlaceOrderTranslationKey);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const marketAssetRate = useAppSelector(selectMarketAssetRate);
	const isAdvancedOrder = useAppSelector(selectIsAdvancedOrder);
	const openModal = useAppSelector(selectOpenModal);
	const marketInfo = useAppSelector(selectMarketInfo);
	const previewStatus = useAppSelector(selectTradePreviewStatus);

	const isCancelModalOpen = openModal === 'futures_close_position_confirm';
	const isConfirmationModalOpen = openModal === 'futures_modify_position_confirm';

	const positionDetails = position?.position;

	const orderError = useMemo(() => {
		if (previewError) return t(previewErrorI18n(previewError));
		if (futuresTransaction?.error) return futuresTransaction.error;
		if (previewTrade?.showStatus) return previewTrade?.statusMessage;
		return null;
	}, [
		previewTrade?.showStatus,
		previewTrade?.statusMessage,
		futuresTransaction?.error,
		previewError,
		t,
	]);

	const leverageValid = useMemo(() => {
		if (selectedAccountType === 'cross_margin') return true;
		const leverageNum = Number(leverage || 0);
		return leverageNum > 0 && leverageNum < maxLeverageValue.toNumber();
	}, [selectedAccountType, maxLeverageValue, leverage]);

	const placeOrderDisabledReason = useMemo(() => {
		const invalidReason = orderPriceInvalidLabel(
			orderPrice,
			leverageSide,
			marketAssetRate,
			orderType
		);
		if (!leverageValid) return 'invalid_leverage';
		if (marketInfo?.isSuspended) return 'market_suspended';
		if (isMarketCapReached) return 'market_cap_reached';
		if ((orderType === 'limit' || orderType === 'stop market') && !!invalidReason)
			return invalidReason;
		if (susdSize.gt(maxUsdInputAmount)) return 'max_size_exceeded';
		if (placeOrderTranslationKey === 'futures.market.trade.button.deposit-margin-minimum')
			return 'min_margin_required';
		if (selectedAccountType === 'cross_margin') {
			if ((isZero(marginDelta) && isZero(susdSize)) || previewStatus.status !== FetchStatus.Success)
				return 'awaiting_preview';
			if (orderType !== 'market' && isZero(orderPrice)) return 'pricerequired';
		} else if (isZero(susdSize)) {
			return 'size_required';
		}

		return null;
	}, [
		leverageValid,
		susdSize,
		marginDelta,
		orderType,
		orderPrice,
		leverageSide,
		marketAssetRate,
		marketInfo?.isSuspended,
		placeOrderTranslationKey,
		maxUsdInputAmount,
		selectedAccountType,
		isMarketCapReached,
		previewStatus,
	]);

	// TODO: Better user feedback for disabled reasons

	return (
		<>
			<div>
				<ManageOrderTitle>
					Manage&nbsp; —<span>&nbsp; Adjust your position</span>
				</ManageOrderTitle>

				<ManagePositionContainer>
					<PlaceOrderButton
						data-testid="trade-open-position-button"
						noOutline
						fullWidth
						disabled={!!placeOrderDisabledReason}
						onClick={() => dispatch(setOpenModal('futures_modify_position_confirm'))}
					>
						{previewStatus.status === FetchStatus.Loading ? (
							<Loader />
						) : (
							t(placeOrderTranslationKey)
						)}
					</PlaceOrderButton>

					<CloseOrderButton
						data-testid="trade-close-position-button"
						fullWidth
						noOutline
						variant="danger"
						onClick={() => {
							dispatch(setOpenModal('futures_close_position_confirm'));
						}}
						disabled={!positionDetails || marketInfo?.isSuspended || isAdvancedOrder}
					>
						{t('futures.market.user.position.close-position')}
					</CloseOrderButton>
				</ManagePositionContainer>
			</div>

			{orderError && (
				<Error message={orderError} formatter={futuresTransaction?.error ? 'revert' : undefined} />
			)}

			{isCancelModalOpen &&
				(selectedAccountType === 'cross_margin' ? (
					<ClosePositionModalCrossMargin onDismiss={() => dispatch(setOpenModal(null))} />
				) : (
					<ClosePositionModalIsolatedMargin onDismiss={() => dispatch(setOpenModal(null))} />
				))}

			{isConfirmationModalOpen &&
				(selectedAccountType === 'cross_margin' ? (
					<TradeConfirmationModalCrossMargin />
				) : (
					<TradeConfirmationModalIsolatedMargin />
				))}
		</>
	);
};

const ManagePositionContainer = styled.div`
	display: flex;
	grid-gap: 15px;
	margin-bottom: 16px;
`;

const PlaceOrderButton = styled(Button)`
	font-size: 16px;
	height: 55px;
	text-align: center;
	white-space: normal;
`;

const CloseOrderButton = styled(Button)`
	font-size: 16px;
	height: 55px;
	text-align: center;
	white-space: normal;
	background: rgba(239, 104, 104, 0.04);
	border: 1px solid ${(props) => props.theme.colors.selectedTheme.red};
	transition: all 0s ease-in-out;

	&:hover {
		background: ${(props) => props.theme.colors.selectedTheme.red};
		color: ${(props) => props.theme.colors.selectedTheme.white};
	}

	&:disabled {
		display: none;
	}
`;

const ManageOrderTitle = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	font-size: 13px;
	margin-bottom: 8px;

	span {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

export default ManagePosition;
