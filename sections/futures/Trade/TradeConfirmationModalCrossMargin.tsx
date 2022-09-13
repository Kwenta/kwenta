import Wei from '@synthetixio/wei';
import { formatBytes32String } from 'ethers/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import TransactionNotifier from 'containers/TransactionNotifier';
import { useFuturesContext } from 'contexts/FuturesContext';
import { useRefetchContext } from 'contexts/RefetchContext';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import useEstimateGasCost from 'hooks/useEstimateGasCost';
import {
	confirmationModalOpenState,
	crossMarginMarginDeltaState,
	currentMarketState,
	futuresTradeInputsState,
	potentialTradeDetailsState,
} from 'store/futures';
import { isUserDeniedError } from 'utils/formatters/error';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import TradeConfirmationModal from './TradeConfirmationModal';

export default function TradeConfirmationModalCrossMargin() {
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { handleRefetch } = useRefetchContext();
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const { estimateEthersContractTxCost } = useEstimateGasCost();

	const { data: potentialTradeDetails } = useRecoilValue(potentialTradeDetailsState);
	const marketAsset = useRecoilValue(currentMarketState);
	const crossMarginMarginDelta = useRecoilValue(crossMarginMarginDeltaState);
	const tradeInputs = useRecoilValue(futuresTradeInputsState);

	const { submitCrossMarginOrder, resetTradeState, tradeFees } = useFuturesContext();

	const setConfirmationModalOpen = useSetRecoilState(confirmationModalOpenState);

	const [error, setError] = useState<null | string>(null);
	const [gasFee, setGasFee] = useState<Wei>(zeroBN);

	useEffect(() => {
		if (!crossMarginAccountContract) return;
		const estimateGas = async () => {
			const newPosition = [
				{
					marketKey: formatBytes32String(marketAsset),
					marginDelta: crossMarginMarginDelta.toBN(),
					sizeDelta: tradeInputs.nativeSizeDelta.toBN(),
				},
			];
			const fee = await estimateEthersContractTxCost(
				crossMarginAccountContract,
				'distributeMargin',
				[newPosition]
			);
			setGasFee(fee);
		};
		estimateGas();
	}, [
		crossMarginAccountContract,
		marketAsset,
		crossMarginMarginDelta,
		tradeInputs.nativeSizeDelta,
		estimateEthersContractTxCost,
	]);

	const tradeFee = tradeFees.crossMarginFee.add(potentialTradeDetails?.fee || 0);

	const onDismiss = useCallback(() => {
		setConfirmationModalOpen(false);
	}, [setConfirmationModalOpen]);

	const handleConfirmOrder = useCallback(async () => {
		setError(null);
		try {
			const tx = await submitCrossMarginOrder();
			if (tx?.hash) {
				monitorTransaction({
					txHash: tx.hash,
					onTxFailed(failureMessage) {
						if (!isUserDeniedError(failureMessage?.failureReason)) {
							setError(failureMessage?.failureReason || t('common.transaction.transaction-failed'));
						}
					},
					onTxConfirmed: () => {
						resetTradeState();
						handleRefetch('modify-position');
					},
				});
				onDismiss();
			}
		} catch (err) {
			if (!isUserDeniedError(err.message)) {
				logError(err);
				setError(t('common.transaction.transaction-failed'));
			}
		}
	}, [
		setError,
		handleRefetch,
		resetTradeState,
		monitorTransaction,
		onDismiss,
		submitCrossMarginOrder,
		t,
	]);

	return (
		<TradeConfirmationModal
			onDismiss={onDismiss}
			onConfirmOrder={handleConfirmOrder}
			tradeFee={tradeFee}
			gasFee={gasFee}
			errorMessage={error}
		/>
	);
}
