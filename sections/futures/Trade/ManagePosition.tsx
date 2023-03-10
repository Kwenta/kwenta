import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import Error from 'components/ErrorView';
import InputTitle from 'components/Input/InputTitle';
import { previewErrorI18n } from 'queries/futures/constants';
import { PositionSide } from 'sdk/types/futures';
import { setOpenModal } from 'state/app/reducer';
import { selectOpenModal } from 'state/app/selectors';
import { changeLeverageSide, editTradeSizeInput } from 'state/futures/actions';
import {
	selectMarketInfo,
	selectIsMarketCapReached,
	selectMarketPrice,
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
	selectIsConditionalOrder,
	selectFuturesType,
	selectCrossMarginMarginDelta,
	selectLeverageSide,
	selectPendingDelayedOrder,
	selectMaxUsdInputAmount,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';
import { isZero } from 'utils/formatters/number';
import { orderPriceInvalidLabel } from 'utils/futures';

import ClosePositionModalCrossMargin from '../PositionCard/ClosePositionModalCrossMargin';
import ClosePositionModalIsolatedMargin from '../PositionCard/ClosePositionModalIsolatedMargin';
import DelayedOrderConfirmationModal from '../TradeConfirmation/DelayedOrderConfirmationModal';
import TradeConfirmationModalCrossMargin from '../TradeConfirmation/TradeConfirmationModalCrossMargin';
import TradeConfirmationModalIsolatedMargin from '../TradeConfirmation/TradeConfirmationModalIsolatedMargin';

const ManagePosition: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const { susdSize } = useAppSelector(selectTradeSizeInputs);
	const marginDelta = useAppSelector(selectCrossMarginMarginDelta);
	const position = useAppSelector(selectPosition);
	const maxLeverageValue = useAppSelector(selectMaxLeverage);
	const selectedAccountType = useAppSelector(selectFuturesType);
	const previewTrade = useAppSelector(selectTradePreview);
	const previewError = useAppSelector(selectTradePreviewError);
	const leverage = useAppSelector(selectIsolatedMarginLeverage);
	const orderType = useAppSelector(selectOrderType);
	const openOrder = useAppSelector(selectPendingDelayedOrder);
	const leverageSide = useAppSelector(selectLeverageSide);
	const maxUsdInputAmount = useAppSelector(selectMaxUsdInputAmount);
	const isMarketCapReached = useAppSelector(selectIsMarketCapReached);
	const placeOrderTranslationKey = useAppSelector(selectPlaceOrderTranslationKey);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const marketAssetRate = useAppSelector(selectMarketPrice);
	const isConditionalOrder = useAppSelector(selectIsConditionalOrder);
	const openModal = useAppSelector(selectOpenModal);
	const marketInfo = useAppSelector(selectMarketInfo);
	const previewStatus = useAppSelector(selectTradePreviewStatus);

	const isCancelModalOpen = openModal === 'futures_close_position_confirm';
	const isConfirmationModalOpen = openModal === 'futures_modify_position_confirm';

	const positionDetails = position?.position;

	const orderError = useMemo(() => {
		if (previewError) return t(previewErrorI18n(previewError));
		if (previewTrade?.showStatus) return previewTrade?.statusMessage;
		return null;
	}, [previewTrade?.showStatus, previewTrade?.statusMessage, previewError, t]);

	const leverageValid = useMemo(() => {
		if (selectedAccountType === 'cross_margin') return true;
		return leverage.gt(0) && leverage.lt(maxLeverageValue);
	}, [selectedAccountType, maxLeverageValue, leverage]);

	const placeOrderDisabledReason = useMemo(() => {
		if (!leverageValid) return 'invalid_leverage';
		if (marketInfo?.isSuspended) return 'market_suspended';
		if (isMarketCapReached) return 'market_cap_reached';

		const invalidReason = orderPriceInvalidLabel(
			orderPrice,
			leverageSide,
			marketAssetRate,
			orderType
		);

		if ((orderType === 'limit' || orderType === 'stop_market') && !!invalidReason)
			return invalidReason;
		if (susdSize.gt(maxUsdInputAmount)) return 'max_size_exceeded';
		if (placeOrderTranslationKey === 'futures.market.trade.button.deposit-margin-minimum')
			return 'min_margin_required';

		if (isZero(susdSize)) {
			return 'size_required';
		}
		if (selectedAccountType === 'cross_margin') {
			if ((isZero(marginDelta) && isZero(susdSize)) || previewStatus.status !== FetchStatus.Success)
				return 'awaiting_preview';
			if (orderType !== 'market' && isZero(orderPrice)) return 'pricerequired';
		} else if (selectedAccountType === 'isolated_margin') {
			if ((orderType === 'delayed' || orderType === 'delayed_offchain') && !!openOrder)
				return 'order_open';
		}

		return null;
	}, [
		leverageValid,
		susdSize,
		marginDelta,
		orderType,
		openOrder,
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
						variant={leverageSide}
						disabled={!!placeOrderDisabledReason}
						onClick={() => dispatch(setOpenModal('futures_modify_position_confirm'))}
					>
						{t(placeOrderTranslationKey)}
					</PlaceOrderButton>

					<CloseOrderButton
						data-testid="trade-close-position-button"
						fullWidth
						noOutline
						variant="flat"
						onClick={() => {
							if (
								(orderType === 'delayed' || orderType === 'delayed_offchain') &&
								position?.position?.size
							) {
								const newTradeSize = position.position.size;
								const newLeverageSide =
									position.position.side === PositionSide.LONG
										? PositionSide.SHORT
										: PositionSide.LONG;
								dispatch(changeLeverageSide(newLeverageSide));
								dispatch(editTradeSizeInput(newTradeSize.toString(), 'native'));
								dispatch(setOpenModal('futures_modify_position_confirm'));
							} else {
								dispatch(setOpenModal('futures_close_position_confirm'));
							}
						}}
						disabled={!positionDetails || marketInfo?.isSuspended || isConditionalOrder}
					>
						{t('futures.market.user.position.close-position')}
					</CloseOrderButton>
				</ManagePositionContainer>
			</div>

			{orderError && <Error message={orderError} />}

			{isCancelModalOpen &&
				(selectedAccountType === 'cross_margin' ? (
					<ClosePositionModalCrossMargin onDismiss={() => dispatch(setOpenModal(null))} />
				) : (
					<ClosePositionModalIsolatedMargin onDismiss={() => dispatch(setOpenModal(null))} />
				))}

			{isConfirmationModalOpen &&
				(selectedAccountType === 'cross_margin' ? (
					<TradeConfirmationModalCrossMargin />
				) : orderType === 'delayed' || orderType === 'delayed_offchain' ? (
					<DelayedOrderConfirmationModal />
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

	&:disabled {
		display: none;
	}
`;

const ManageOrderTitle = styled(InputTitle)`
	margin-bottom: 8px;
`;

export default ManagePosition;
