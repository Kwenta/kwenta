import { useMemo } from 'react';
import { useCallback, useEffect } from 'react';

import { setOpenModal } from 'state/app/reducer';
import { modifyIsolatedPosition, modifyIsolatedPositionEstimateGas } from 'state/futures/actions';
import {
	selectIsModifyingIsolatedPosition,
	selectIsolatedTradeInputs,
	selectModifyIsolatedGasEstimate,
	selectTradePreview,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { zeroBN } from 'utils/formatters/number';

import TradeConfirmationModal from './TradeConfirmationModal';

export default function TradeConfirmationModalIsolatedMargin() {
	const dispatch = useAppDispatch();

	const potentialTradeDetails = useAppSelector(selectTradePreview);
	const submitting = useAppSelector(selectIsModifyingIsolatedPosition);
	const gasEstimate = useAppSelector(selectModifyIsolatedGasEstimate);
	const { nativeSizeDelta, priceImpactDelta } = useAppSelector(selectIsolatedTradeInputs);

	const transactionFee = useMemo(() => gasEstimate?.cost ?? zeroBN, [gasEstimate?.cost]);

	useEffect(() => {
		dispatch(
			modifyIsolatedPositionEstimateGas({
				sizeDelta: nativeSizeDelta,
				priceImpactDelta: priceImpactDelta,
				delayed: false,
			})
		);
	}, [nativeSizeDelta, priceImpactDelta, dispatch]);

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(null));
	}, [dispatch]);

	const handleConfirmOrder = async () => {
		dispatch(
			modifyIsolatedPosition({
				sizeDelta: nativeSizeDelta,
				priceImpactDelta: priceImpactDelta,
				delayed: false,
			})
		);
	};

	return (
		<TradeConfirmationModal
			onDismiss={onDismiss}
			onConfirmOrder={handleConfirmOrder}
			gasFee={transactionFee}
			isSubmitting={submitting}
			tradeFee={potentialTradeDetails?.fee || zeroBN}
		/>
	);
}
