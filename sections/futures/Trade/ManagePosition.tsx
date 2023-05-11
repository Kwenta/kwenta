import { wei } from '@synthetixio/wei';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import Error from 'components/ErrorView';
import { ERROR_MESSAGES } from 'components/ErrorView/ErrorNotifier';
import { previewErrorI18n } from 'queries/futures/constants';
import { setOpenModal } from 'state/app/reducer';
import { setTradePanelDrawerOpen } from 'state/futures/reducer';
import {
	selectMarketInfo,
	selectIsMarketCapReached,
	selectMarketPrice,
	selectPlaceOrderTranslationKey,
	selectMaxLeverage,
	selectTradePreviewError,
	selectTradePreview,
	selectTradePreviewStatus,
	selectTradeSizeInputs,
	selectIsolatedMarginLeverage,
	selectCrossMarginOrderPrice,
	selectOrderType,
	selectFuturesType,
	selectCrossMarginMarginDelta,
	selectLeverageSide,
	selectPendingDelayedOrder,
	selectMaxUsdSizeInput,
	selectCrossMarginAccount,
	selectPosition,
	selectMarketPriceInfo,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { FetchStatus } from 'state/types';
import { isZero, zeroBN } from 'utils/formatters/number';
import { orderPriceInvalidLabel } from 'utils/futures';

const ManagePosition: React.FC = () => {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const { susdSize } = useAppSelector(selectTradeSizeInputs);
	const marginDelta = useAppSelector(selectCrossMarginMarginDelta);
	const maxLeverageValue = useAppSelector(selectMaxLeverage);
	const selectedAccountType = useAppSelector(selectFuturesType);
	const previewTrade = useAppSelector(selectTradePreview);
	const previewError = useAppSelector(selectTradePreviewError);
	const leverage = useAppSelector(selectIsolatedMarginLeverage);
	const orderType = useAppSelector(selectOrderType);
	const openOrder = useAppSelector(selectPendingDelayedOrder);
	const leverageSide = useAppSelector(selectLeverageSide);
	const maxUsdInputAmount = useAppSelector(selectMaxUsdSizeInput);
	const isMarketCapReached = useAppSelector(selectIsMarketCapReached);
	const placeOrderTranslationKey = useAppSelector(selectPlaceOrderTranslationKey);
	const orderPrice = useAppSelector(selectCrossMarginOrderPrice);
	const marketAssetRate = useAppSelector(selectMarketPrice);
	const marketInfo = useAppSelector(selectMarketInfo);
	const indexPrice = useAppSelector(selectMarketPriceInfo);
	const previewStatus = useAppSelector(selectTradePreviewStatus);
	const smartMarginAccount = useAppSelector(selectCrossMarginAccount);
	const position = useAppSelector(selectPosition);

	const orderError = useMemo(() => {
		if (previewError) return t(previewErrorI18n(previewError));
		if (previewTrade?.statusMessage && previewTrade.statusMessage !== 'Success')
			return previewTrade?.statusMessage;
		return null;
	}, [previewTrade?.statusMessage, previewError, t]);

	const increasingPosition = !position?.position?.side || position?.position?.side === leverageSide;

	const onSubmit = useCallback(() => {
		dispatch(setTradePanelDrawerOpen(false));
		if (selectedAccountType === 'cross_margin' && !smartMarginAccount) {
			dispatch(setOpenModal('futures_smart_margin_onboard'));
			return;
		}
		dispatch(
			setOpenModal(
				selectedAccountType === 'cross_margin'
					? 'futures_confirm_smart_margin_trade'
					: 'futures_confirm_isolated_margin_trade'
			)
		);
	}, [selectedAccountType, smartMarginAccount, dispatch]);

	const placeOrderDisabledReason = useMemo<{
		message: string;
		show?: 'warn' | 'error';
	} | null>(() => {
		if (orderError) {
			return { message: orderError, show: 'error' };
		}
		const maxLeverage = marketInfo?.appMaxLeverage ?? wei(1);

		// TODO: Clean up errors and warnings
		const indexPriceWei = indexPrice?.price ?? zeroBN;
		const canLiquidate =
			(previewTrade?.size.gt(0) && indexPriceWei.lt(previewTrade?.liqPrice)) ||
			(previewTrade?.size.lt(0) && indexPriceWei.gt(previewTrade?.liqPrice));
		if (canLiquidate) {
			return {
				show: 'warn',
				message: `Position can be liquidated`,
			};
		}

		if (leverage.gt(maxLeverageValue))
			return {
				show: 'warn',
				message: `Max leverage ${maxLeverage.toString(0)}x exceeded`,
			};
		if (marketInfo?.isSuspended)
			return {
				show: 'warn',
				message: `Market suspended`,
			};
		if (isMarketCapReached && increasingPosition)
			return {
				show: 'warn',
				message: `Open interest limit exceeded`,
			};

		const invalidReason = orderPriceInvalidLabel(
			orderPrice,
			leverageSide,
			marketAssetRate,
			orderType
		);

		if ((orderType === 'limit' || orderType === 'stop_market') && !!invalidReason)
			return {
				show: 'warn',
				message: invalidReason,
			};
		if (susdSize.gt(maxUsdInputAmount))
			return {
				show: 'warn',
				message: 'Max trade size exceeded',
			};
		if (placeOrderTranslationKey === 'futures.market.trade.button.deposit-margin-minimum')
			return {
				show: 'warn',
				message: 'Min $50 margin required',
			};

		if (isZero(susdSize)) {
			return { message: 'Trade size required' };
		}
		if (orderType === 'market' && !!openOrder) {
			return {
				show: 'warn',
				message: ERROR_MESSAGES.ORDER_PENDING,
			};
		}
		if (selectedAccountType === 'cross_margin') {
			if ((isZero(marginDelta) && isZero(susdSize)) || previewStatus.status !== FetchStatus.Success)
				return { message: 'awaiting_preview' };
			if (orderType !== 'market' && isZero(orderPrice)) return { message: 'trade price required' };
		}

		return null;
	}, [
		susdSize,
		marginDelta,
		orderType,
		openOrder,
		orderError,
		orderPrice,
		leverageSide,
		marketAssetRate,
		marketInfo?.isSuspended,
		placeOrderTranslationKey,
		maxUsdInputAmount,
		selectedAccountType,
		isMarketCapReached,
		increasingPosition,
		previewStatus,
		maxLeverageValue,
		leverage,
		indexPrice,
		previewTrade,
		marketInfo?.appMaxLeverage,
	]);

	return (
		<>
			<div>
				<ManagePositionContainer>
					<PlaceOrderButton
						data-testid="trade-open-position-button"
						noOutline
						fullWidth
						variant={leverageSide}
						disabled={!!placeOrderDisabledReason}
						onClick={onSubmit}
					>
						{t(placeOrderTranslationKey)}
					</PlaceOrderButton>
				</ManagePositionContainer>
			</div>

			{placeOrderDisabledReason?.show ? (
				<Error
					message={placeOrderDisabledReason.message}
					messageType={placeOrderDisabledReason.show}
				/>
			) : null}
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

export default ManagePosition;
