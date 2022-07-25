import { useFuturesContext } from 'contexts/FuturesContext';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';
import styled from 'styled-components';

import Button from 'components/Button';
import Error from 'components/Error';
import { PositionSide } from 'queries/futures/types';
import {
	confirmationModalOpenState,
	leverageSideState,
	leverageState,
	marketInfoState,
	maxLeverageState,
	orderTypeState,
	positionState,
	potentialTradeDetailsState,
	sizeDeltaState,
	tradeSizeState,
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
	const leverage = useRecoilValue(leverageState);
	const sizeDelta = useRecoilValue(sizeDeltaState);
	const position = useRecoilValue(positionState);
	const maxLeverageValue = useRecoilValue(maxLeverageState);
	const marketInfo = useRecoilValue(marketInfoState);
	const previewTrade = useRecoilValue(potentialTradeDetailsState);
	const positionDetails = position?.position;
	const orderType = useRecoilValue(orderTypeState);
	const setLeverageSide = useSetRecoilState(leverageSideState);
	const setTradeSize = useSetRecoilState(tradeSizeState);
	const [isCancelModalOpen, setCancelModalOpen] = React.useState(false);
	const [isConfirmationModalOpen, setConfirmationModalOpen] = useRecoilState(
		confirmationModalOpenState
	);
	const {
		error,
		orderTxn,
		isMarketCapReached,
		placeOrderTranslationKey,
		onTradeAmountChange,
	} = useFuturesContext();

	const orderError = useMemo(() => {
		const orderTxnError = orderTxn.error as OrderTxnError;
		return orderTxnError?.reason;
	}, [orderTxn]);

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
							!leverage ||
							Number(leverage) < 0 ||
							Number(leverage) > maxLeverageValue.toNumber() ||
							sizeDelta.eq(zeroBN) ||
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

			{(orderTxn.isError || error || previewTrade?.showStatus) && (
				<Error
					message={
						orderTxn.isError
							? orderError
							: error
							? error
							: previewTrade?.showStatus
							? previewTrade?.statusMessage
							: ''
					}
					formatter="revert"
				/>
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
	margin-left: 14px;

	span {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
	}
`;

export default ManagePosition;
