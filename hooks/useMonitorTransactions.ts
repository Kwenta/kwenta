import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { monitorTransaction } from 'contexts/RelayerContext';
import { TransactionStatus } from 'sdk/types/common';
import { handleTransactionError, updateTransactionStatus } from 'state/futures/reducer';
import { selectFuturesTransaction } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

export default function useMonitorTransactions() {
	const dispatch = useDispatch();
	const transaction = useAppSelector(selectFuturesTransaction);

	useEffect(() => {
		if (transaction?.hash) {
			monitorTransaction({
				txHash: transaction.hash,
				onTxFailed: (err) => {
					dispatch(handleTransactionError(err.failureReason ?? 'transaction_failed'));
				},
				onTxConfirmed: () => {
					dispatch(updateTransactionStatus(TransactionStatus.Confirmed));
				},
			});
		}
	}, [transaction?.hash, dispatch]);
}
