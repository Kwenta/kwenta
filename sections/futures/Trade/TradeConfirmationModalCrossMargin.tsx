import Wei from '@synthetixio/wei';
import { formatBytes32String } from 'ethers/lib/utils';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { DEFAULT_CROSSMARGIN_GAS_BUFFER_PCT } from 'constants/defaults';
import { useFuturesContext } from 'contexts/FuturesContext';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import useEstimateGasCost from 'hooks/useEstimateGasCost';
import { selectMarketKey } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import {
	confirmationModalOpenState,
	crossMarginMarginDeltaState,
	futuresTradeInputsState,
	isAdvancedOrderState,
} from 'store/futures';
import { isUserDeniedError } from 'utils/formatters/error';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import TradeConfirmationModal from './TradeConfirmationModal';

export default function TradeConfirmationModalCrossMargin() {
	const { t } = useTranslation();
	const { handleRefetch, refetchUntilUpdate } = useRefetchContext();
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const { estimateEthersContractTxCost } = useEstimateGasCost();

	const marketKey = useAppSelector(selectMarketKey);
	const crossMarginMarginDelta = useRecoilValue(crossMarginMarginDeltaState);
	const tradeInputs = useRecoilValue(futuresTradeInputsState);
	const isAdvancedOrder = useRecoilValue(isAdvancedOrderState);

	const { submitCrossMarginOrder, resetTradeState, tradeFees } = useFuturesContext();

	const setConfirmationModalOpen = useSetRecoilState(confirmationModalOpenState);

	const [error, setError] = useState<null | string>(null);
	const [gasFee, setGasFee] = useState<Wei | null>(null);
	const [gasLimit, setGasLimit] = useState<Wei | null>(null);

	useEffect(() => {
		if (!crossMarginAccountContract) return;
		const estimateGas = async () => {
			const newPosition = [
				{
					marketKey: formatBytes32String(marketKey),
					marginDelta: crossMarginMarginDelta.toBN(),
					sizeDelta: tradeInputs.nativeSizeDelta.toBN(),
				},
			];
			const { gasPrice, gasLimit } = await estimateEthersContractTxCost(
				crossMarginAccountContract,
				'distributeMargin',
				[newPosition],
				DEFAULT_CROSSMARGIN_GAS_BUFFER_PCT
			);

			setGasFee(gasPrice);
			setGasLimit(gasLimit);
		};
		estimateGas();
	}, [
		crossMarginAccountContract,
		marketKey,
		crossMarginMarginDelta,
		tradeInputs.nativeSizeDelta,
		estimateEthersContractTxCost,
	]);

	const onDismiss = useCallback(() => {
		setConfirmationModalOpen(false);
	}, [setConfirmationModalOpen]);

	const handleConfirmOrder = useCallback(async () => {
		setError(null);
		try {
			const tx = await submitCrossMarginOrder(false, gasLimit);
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
						refetchUntilUpdate('account-margin-change');
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
		gasLimit,
		setError,
		handleRefetch,
		refetchUntilUpdate,
		resetTradeState,
		onDismiss,
		submitCrossMarginOrder,
		t,
	]);

	return (
		<TradeConfirmationModal
			onDismiss={onDismiss}
			onConfirmOrder={handleConfirmOrder}
			tradeFee={tradeFees.total}
			keeperFee={isAdvancedOrder ? tradeFees.keeperEthDeposit : null}
			gasFee={gasFee ?? zeroBN}
			errorMessage={error}
		/>
	);
}
