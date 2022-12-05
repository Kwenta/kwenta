import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useFuturesContext } from 'contexts/FuturesContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import useEstimateGasCost from 'hooks/useEstimateGasCost';
import { confirmationModalOpenState, potentialTradeDetailsState } from 'store/futures';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import TradeConfirmationModal from './TradeConfirmationModal';

export default function TradeConfirmationModalIsolatedMargin() {
	const { t } = useTranslation();
	const [error, setError] = useState<null | string>(null);

	// const { estimateSnxTxGasCost } = useEstimateGasCost();
	const { resetTradeState, submitIsolatedMarginOrder } = useFuturesContext();

	const setConfirmationModalOpen = useSetRecoilState(confirmationModalOpenState);
	const { data: potentialTradeDetails } = useRecoilValue(potentialTradeDetailsState);

	// const transactionFee = estimateSnxTxGasCost(orderTxn);

	const onDismiss = () => {
		setConfirmationModalOpen(false);
	};

	const handleConfirmOrder = async () => {
		setError(null);
		try {
			const tx = await submitIsolatedMarginOrder();
			if (tx?.hash) {
				monitorTransaction({
					txHash: tx.hash,
					onTxFailed(failureMessage) {
						setError(failureMessage?.failureReason || t('common.transaction.transaction-failed'));
					},
					onTxConfirmed: () => {
						resetTradeState();
						// handleRefetch('modify-position');
						// handleRefetch('account-margin-change');
					},
				});
				onDismiss();
			}
		} catch (err) {
			logError(err);
			setError(t('common.transaction.transaction-failed'));
		}

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
