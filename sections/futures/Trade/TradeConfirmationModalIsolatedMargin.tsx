import { useCallback, useEffect } from 'react';

import { setOpenModal } from 'state/app/reducer';
import { modifyIsolatedPosition, modifyIsolatedPositionEstimateGas } from 'state/futures/actions';
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

	useEffect(() => {
		dispatch(
			modifyIsolatedPositionEstimateGas({
				sizeDelta: nativeSizeDelta,
			})
		);
	}, [nativeSizeDelta, dispatch]);

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(null));
	}, [dispatch]);

	const handleConfirmOrder = async () => {
		dispatch(
			modifyIsolatedPosition({
				sizeDelta: nativeSizeDelta,
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
