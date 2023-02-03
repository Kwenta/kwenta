import { useCallback } from 'react';

import { setOpenModal } from 'state/app/reducer';
import { submitCrossMarginOrder } from 'state/futures/actions';
import {
	selectCrossMarginTradeFees,
	selectIsAdvancedOrder,
	selectSubmittingFuturesTx,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import TradeConfirmationModal from './TradeConfirmationModal';

export default function TradeConfirmationModalCrossMargin() {
	const dispatch = useAppDispatch();

	const isAdvancedOrder = useAppSelector(selectIsAdvancedOrder);
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx);
	const tradeFees = useAppSelector(selectCrossMarginTradeFees);

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(null));
	}, [dispatch]);

	const handleConfirmOrder = useCallback(async () => {
		dispatch(submitCrossMarginOrder());
	}, [dispatch]);

	return (
		<TradeConfirmationModal
			onDismiss={onDismiss}
			onConfirmOrder={handleConfirmOrder}
			isSubmitting={isSubmitting}
			tradeFee={tradeFees.total}
			keeperFee={isAdvancedOrder ? tradeFees.keeperEthDeposit : null}
		/>
	);
}
