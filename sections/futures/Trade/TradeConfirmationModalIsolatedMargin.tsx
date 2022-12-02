import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useFuturesContext } from 'contexts/FuturesContext';
import useEstimateGasCost from 'hooks/useEstimateGasCost';
import { confirmationModalOpenState, potentialTradeDetailsState } from 'store/futures';
import { zeroBN } from 'utils/formatters/number';

import TradeConfirmationModal from './TradeConfirmationModal';

export default function TradeConfirmationModalIsolatedMargin() {
	// const { estimateSnxTxGasCost } = useEstimateGasCost();
	const { orderTxn, submitIsolatedMarginOrder } = useFuturesContext();

	const setConfirmationModalOpen = useSetRecoilState(confirmationModalOpenState);
	const { data: potentialTradeDetails } = useRecoilValue(potentialTradeDetailsState);

	// const transactionFee = estimateSnxTxGasCost(orderTxn);

	const onDismiss = () => {
		setConfirmationModalOpen(false);
	};

	const handleConfirmOrder = async () => {
		submitIsolatedMarginOrder();
		onDismiss();
	};

	return (
		<TradeConfirmationModal
			onDismiss={onDismiss}
			onConfirmOrder={handleConfirmOrder}
			// gasFee={transactionFee}
			// TODO: add back gas estimate calculation
			gasFee={zeroBN}
			tradeFee={potentialTradeDetails?.fee || zeroBN}
		/>
	);
}
