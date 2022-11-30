import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useRecoilState } from 'recoil';
import styled from 'styled-components';

import Button from 'components/Button';
import Error from 'components/Error';
import Loader from 'components/Loader';
import { useFuturesContext } from 'contexts/FuturesContext';
import { previewErrorI18n } from 'queries/futures/constants';
import { PositionSide } from 'queries/futures/types';
import { setLeverageSide as setReduxLeverageSide } from 'state/futures/reducer';
import {
	selectMarketInfo,
	selectIsMarketCapReached,
	selectMarketAssetRate,
	selectPlaceOrderTranslationKey,
	selectPosition,
	selectMaxLeverage,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import {
	confirmationModalOpenState,
	leverageSideState,
	orderTypeState,
	potentialTradeDetailsState,
	sizeDeltaState,
	futuresTradeInputsState,
	futuresAccountTypeState,
	crossMarginMarginDeltaState,
	futuresOrderPriceState,
	isAdvancedOrderState,
} from 'store/futures';
import { isZero } from 'utils/formatters/number';
import { orderPriceInvalidLabel } from 'utils/futures';

import ClosePositionModalCrossMargin from '../PositionCard/ClosePositionModalCrossMargin';
import ClosePositionModalIsolatedMargin from '../PositionCard/ClosePositionModalIsolatedMargin';
import NextPriceConfirmationModal from './NextPriceConfirmationModal';
import TradeConfirmationModalCrossMargin from './TradeConfirmationModalCrossMargin';
import TradeConfirmationModalIsolatedMargin from './TradeConfirmationModalIsolatedMargin';

type OrderTxnError = {
	reason: string;
};

const ManagePosition: React.FC = () => {
	const { t } = useTranslation();
	const {
		error,
		orderTxn,
		onTradeAmountChange,
		maxUsdInputAmount,
		tradePrice,
	} = useFuturesContext();

	const sizeDelta = useRecoilValue(sizeDeltaState);
	const marginDelta = useRecoilValue(crossMarginMarginDeltaState);
	const position = useAppSelector(selectPosition);
	const maxLeverageValue = useAppSelector(selectMaxLeverage);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const { data: previewTrade, error: previewError, status } = useRecoilValue(
		potentialTradeDetailsState
	);
	const orderType = useRecoilValue(orderTypeState);
	const [leverageSide, setLeverageSide] = useRecoilState(leverageSideState);
	const { leverage } = useRecoilValue(futuresTradeInputsState);
	const [isConfirmationModalOpen, setConfirmationModalOpen] = useRecoilState(
		confirmationModalOpenState
	);
	const isMarketCapReached = useAppSelector(selectIsMarketCapReached);
	const placeOrderTranslationKey = useAppSelector(selectPlaceOrderTranslationKey);
	const dispatch = useAppDispatch();
	const orderPrice = useRecoilValue(futuresOrderPriceState);
	const marketAssetRate = useAppSelector(selectMarketAssetRate);
	const tradeInputs = useRecoilValue(futuresTradeInputsState);
	const isAdvancedOrder = useRecoilValue(isAdvancedOrderState);

	const marketInfo = useAppSelector(selectMarketInfo);

	const [isCancelModalOpen, setCancelModalOpen] = React.useState(false);

	const positionDetails = position?.position;

	const orderError = useMemo(() => {
		if (previewError) return t(previewErrorI18n(previewError));
		const orderTxnError = orderTxn.error as OrderTxnError;
		if (orderTxnError?.reason) return orderTxnError.reason;
		if (error) return error;
		if (previewTrade?.showStatus) return previewTrade?.statusMessage;
		return null;
	}, [
		orderTxn.error,
		error,
		previewTrade?.showStatus,
		previewTrade?.statusMessage,
		previewError,
		t,
	]);

	const leverageValid = useMemo(() => {
		if (selectedAccountType === 'cross_margin') return true;
		const leverageNum = Number(leverage || 0);
		return leverageNum > 0 && leverageNum < maxLeverageValue.toNumber();
	}, [leverage, selectedAccountType, maxLeverageValue]);

	const placeOrderDisabledReason = useMemo(() => {
		const invalidReason = orderPriceInvalidLabel(
			orderPrice,
			leverageSide,
			marketAssetRate,
			orderType
		);
		if (!leverageValid) return 'invalid_leverage';
		if (!!error) return error;
		if (marketInfo?.isSuspended) return 'market_suspended';
		if (isMarketCapReached) return 'market_cap_reached';
		if ((orderType === 'limit' || orderType === 'stop market') && !!invalidReason)
			return invalidReason;
		if (tradeInputs.susdSizeDelta.abs().gt(maxUsdInputAmount)) return 'max_size_exceeded';
		if (placeOrderTranslationKey === 'futures.market.trade.button.deposit-margin-minimum')
			return 'min_margin_required';
		if (selectedAccountType === 'cross_margin') {
			if ((isZero(marginDelta) && isZero(sizeDelta)) || status !== 'complete')
				return 'awaiting_preview';
			if (orderType !== 'market' && isZero(orderPrice)) return 'price_required';
		} else if (isZero(sizeDelta)) {
			return 'size_required';
		}

		return null;
	}, [
		leverageValid,
		error,
		sizeDelta,
		marginDelta,
		orderType,
		orderPrice,
		leverageSide,
		marketAssetRate,
		marketInfo?.isSuspended,
		placeOrderTranslationKey,
		tradeInputs.susdSizeDelta,
		maxUsdInputAmount,
		selectedAccountType,
		isMarketCapReached,
		status,
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
						onClick={() => setConfirmationModalOpen(true)}
					>
						{status === 'fetching' ? <Loader /> : t(placeOrderTranslationKey)}
					</PlaceOrderButton>

					<CloseOrderButton
						data-testid="trade-close-position-button"
						fullWidth
						noOutline
						variant="danger"
						onClick={() => {
							if (orderType === 'next price' && position?.position?.size) {
								const newTradeSize = position.position.size;
								const newLeverageSide =
									position.position.side === PositionSide.LONG
										? PositionSide.SHORT
										: PositionSide.LONG;
								setLeverageSide(newLeverageSide);
								dispatch(setReduxLeverageSide(newLeverageSide));
								onTradeAmountChange(newTradeSize.toString(), tradePrice, 'native');
								setConfirmationModalOpen(true);
							} else {
								setCancelModalOpen(true);
							}
						}}
						disabled={!positionDetails || marketInfo?.isSuspended || isAdvancedOrder}
					>
						{t('futures.market.user.position.close-position')}
					</CloseOrderButton>
				</ManagePositionContainer>
			</div>

			{orderError && (
				<Error message={orderError} formatter={orderTxn.error ? 'revert' : undefined} />
			)}

			{isCancelModalOpen &&
				(selectedAccountType === 'cross_margin' ? (
					<ClosePositionModalCrossMargin onDismiss={() => setCancelModalOpen(false)} />
				) : (
					<ClosePositionModalIsolatedMargin onDismiss={() => setCancelModalOpen(false)} />
				))}

			{isConfirmationModalOpen &&
				(selectedAccountType === 'cross_margin' ? (
					<TradeConfirmationModalCrossMargin />
				) : (
					<TradeConfirmationModalIsolatedMargin />
				))}

			{isConfirmationModalOpen && orderType === 'next price' && <NextPriceConfirmationModal />}
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
