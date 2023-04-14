import { useCallback } from 'react';

import { setOpenModal } from 'state/app/reducer';
import { approveCrossMargin, submitCrossMarginOrder } from 'state/futures/actions';
import {
	selectCrossMarginTradeFees,
	selectIsConditionalOrder,
	selectMarketInfo,
	selectSmartMarginAllowanceValid,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

import TradeConfirmationModal from './TradeConfirmationModal';

export default function TradeConfirmationModalCrossMargin() {
	const dispatch = useAppDispatch();

	const isConditionalOrder = useAppSelector(selectIsConditionalOrder);
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx);
	const tradeFees = useAppSelector(selectCrossMarginTradeFees);
	const marketInfo = useAppSelector(selectMarketInfo);
	const allowanceValid = useAppSelector(selectSmartMarginAllowanceValid);

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(null));
	}, [dispatch]);

	const handleConfirmOrder = useCallback(async () => {
		dispatch(submitCrossMarginOrder());
	}, [dispatch]);

	const handleApproveSmartMargin = useCallback(async () => {
		dispatch(approveCrossMargin());
	}, [dispatch]);

	return (
		<TradeConfirmationModal
			onDismiss={onDismiss}
			onConfirmOrder={handleConfirmOrder}
			onApproveAllowance={handleApproveSmartMargin}
			isSubmitting={isSubmitting}
			allowanceValid={allowanceValid}
			tradeFee={tradeFees.delayedOrderFee}
			executionFee={marketInfo?.keeperDeposit ?? zeroBN}
			keeperFee={isConditionalOrder ? tradeFees.keeperEthDeposit : null}
		/>
	);
}
