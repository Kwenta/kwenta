import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';
import styled from 'styled-components';

import Button from 'components/Button';
import Error from 'components/Error';
import { useFuturesContext } from 'contexts/FuturesContext';
import { PositionSide } from 'queries/futures/types';
import {
	confirmationModalOpenState,
	isMarketCapReachedState,
	leverageSideState,
	isolatedMarginleverageState,
	marketInfoState,
	maxLeverageState,
	orderTypeState,
	placeOrderTranslationKeyState,
	positionState,
	potentialTradeDetailsState,
	sizeDeltaState,
	tradeSizeState,
	futuresAccountTypeState,
	crossMarginMarginDeltaState,
} from 'store/futures';
import { zeroBN } from 'utils/formatters/number';

import ClosePositionModal from '../PositionCard/ClosePositionModal';
import NextPriceConfirmationModal from './NextPriceConfirmationModal';
import TradeConfirmationModal from './TradeConfirmationModal';

type OrderTxnError = {
	reason: string;
};

const ManagePosition: React.FC = () => {
	const { t } = useTranslation();
	const isolatedMarginLeverage = useRecoilValue(isolatedMarginleverageState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const marginDelta = useRecoilValue(crossMarginMarginDeltaState);
	const position = useRecoilValue(positionState);
	const maxLeverageValue = useRecoilValue(maxLeverageState);
	const marketInfo = useRecoilValue(marketInfoState);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const previewTrade = useRecoilValue(potentialTradeDetailsState);
	const orderType = useRecoilValue(orderTypeState);
	const setLeverageSide = useSetRecoilState(leverageSideState);
	const setTradeSize = useSetRecoilState(tradeSizeState);
	const [isCancelModalOpen, setCancelModalOpen] = React.useState(false);
	const [isConfirmationModalOpen, setConfirmationModalOpen] = useRecoilState(
		confirmationModalOpenState
	);
	const { error, orderTxn, onTradeAmountChange } = useFuturesContext();
	const isMarketCapReached = useRecoilValue(isMarketCapReachedState);
	const placeOrderTranslationKey = useRecoilValue(placeOrderTranslationKeyState);

	const positionDetails = position?.position;

	const orderError = useMemo(() => {
		const orderTxnError = orderTxn.error as OrderTxnError;
		if (orderTxnError) return orderTxnError.reason;
		if (error) return error;
		if (previewTrade?.showStatus) return previewTrade?.statusMessage;
		return null;
	}, [orderTxn.error, error, previewTrade?.showStatus, previewTrade?.statusMessage]);

	const leverageValid = useMemo(() => {
		if (selectedAccountType === 'cross_margin') return true;
		const leverage = Number(isolatedMarginLeverage || 0);
		return leverage > 0 && leverage < maxLeverageValue.toNumber();
	}, [isolatedMarginLeverage, selectedAccountType, maxLeverageValue]);

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
						disabled={
							!leverageValid ||
							(selectedAccountType === 'isolated_margin' && sizeDelta.eq(zeroBN)) ||
							(selectedAccountType === 'cross_margin' &&
								marginDelta.eq(zeroBN) &&
								sizeDelta.eq(zeroBN)) ||
							!!error ||
							placeOrderTranslationKey === 'futures.market.trade.button.deposit-margin-minimum' ||
							marketInfo?.isSuspended ||
							isMarketCapReached
						}
						onClick={() => setConfirmationModalOpen(true)}
					>
						{t(placeOrderTranslationKey)}
					</PlaceOrderButton>

					<CloseOrderButton
						data-testid="trade-close-position-button"
						fullWidth
						noOutline
						variant="danger"
						onClick={() => {
							if (orderType === 1 && position?.position?.size) {
								const newTradeSize = position.position.size;
								const newLeverageSide =
									position.position.side === PositionSide.LONG
										? PositionSide.SHORT
										: PositionSide.LONG;
								setLeverageSide(newLeverageSide);
								setTradeSize(newTradeSize.toString());
								onTradeAmountChange(newTradeSize.toString(), true);
								setConfirmationModalOpen(true);
							} else {
								setCancelModalOpen(true);
							}
						}}
						disabled={!positionDetails || marketInfo?.isSuspended}
					>
						{t('futures.market.user.position.close-position')}
					</CloseOrderButton>
				</ManagePositionContainer>
			</div>

			{orderError && (
				<Error message={orderError} formatter={orderTxn.error ? 'revert' : undefined} />
			)}

			{isCancelModalOpen && <ClosePositionModal onDismiss={() => setCancelModalOpen(false)} />}

			{isConfirmationModalOpen && orderType === 0 && <TradeConfirmationModal />}

			{isConfirmationModalOpen && orderType === 1 && <NextPriceConfirmationModal />}
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
		border: ${(props) => props.theme.colors.selectedTheme.border};
		background: transparent;
		color: ${(props) => props.theme.colors.selectedTheme.button.disabled.text};
		transform: none;
		display: none;
	}
`;

const ManageOrderTitle = styled.p`
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-size: 13px;
	margin-bottom: 8px;

	span {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

export default ManagePosition;
