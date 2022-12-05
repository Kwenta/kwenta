import { useCallback, useEffect, useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { setOpenModal } from 'state/app/reducer';
import { modifyIsolatedPosition, modifyIsolatedPositionEstimateGas } from 'state/futures/actions';
import {
	selectIsModifyingIsolatedPosition,
	selectModifyIsolatedGasEstimate,
} from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { futuresTradeInputsState, potentialTradeDetailsState } from 'store/futures';
import { zeroBN } from 'utils/formatters/number';

import TradeConfirmationModal from './TradeConfirmationModal';

export default function TradeConfirmationModalIsolatedMargin() {
	const dispatch = useAppDispatch();

	const { data: potentialTradeDetails } = useRecoilValue(potentialTradeDetailsState);
	const { nativeSizeDelta } = useRecoilValue(futuresTradeInputsState);
	const submitting = useAppSelector(selectIsModifyingIsolatedPosition);
	const gasEstimate = useAppSelector(selectModifyIsolatedGasEstimate);

	const transactionFee = useMemo(() => gasEstimate?.cost ?? zeroBN, [gasEstimate?.cost]);

	useEffect(() => {
		dispatch(
			modifyIsolatedPositionEstimateGas({
				sizeDelta: nativeSizeDelta,
				useNextPrice: false,
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
				useNextPrice: true,
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
