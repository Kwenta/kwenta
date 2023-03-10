import { useCallback } from 'react';

import { setOpenModal } from 'state/app/reducer';
import { modifyIsolatedPosition } from 'state/futures/actions';
import {
	selectIsModifyingIsolatedPosition,
	selectTradePreview,
	selectTradeSizeInputs,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

import TradeConfirmationModal from './TradeConfirmationModal';

export default function TradeConfirmationModalIsolatedMargin() {
	const dispatch = useAppDispatch();

	const potentialTradeDetails = useAppSelector(selectTradePreview);
	const { nativeSizeDelta } = useAppSelector(selectTradeSizeInputs);
	const submitting = useAppSelector(selectIsModifyingIsolatedPosition);

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(null));
	}, [dispatch]);

	const handleConfirmOrder = async () => {
		dispatch(
			modifyIsolatedPosition({
				sizeDelta: nativeSizeDelta,
				delayed: false,
				offchain: false,
			})
		);
	};

	return (
		<TradeConfirmationModal
			onDismiss={onDismiss}
			onConfirmOrder={handleConfirmOrder}
			isSubmitting={submitting}
			tradeFee={potentialTradeDetails?.fee || zeroBN}
		/>
	);
}
