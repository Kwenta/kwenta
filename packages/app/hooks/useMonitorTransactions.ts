import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { monitorTransaction } from 'contexts/RelayerContext'
import { handleTransactionError } from 'state/app/reducer'
import { selectTransaction } from 'state/app/selectors'
import { useAppSelector } from 'state/hooks'

export default function useMonitorTransactions() {
	const dispatch = useDispatch()
	const transaction = useAppSelector(selectTransaction)

	useEffect(() => {
		if (transaction?.hash) {
			monitorTransaction({
				txHash: transaction.hash,
				onTxFailed: (err) => {
					dispatch(handleTransactionError(err.failureReason ?? 'transaction_failed'))
				},
			})
		}
	}, [transaction?.hash, dispatch])
}
