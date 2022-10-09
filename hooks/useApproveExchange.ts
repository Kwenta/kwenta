import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { submitApprove } from 'state/exchange/actions';
import { useAppDispatch } from 'state/store';

// import TransactionNotifier from 'containers/TransactionNotifier';
import { useExchangeContext } from 'contexts/ExchangeContext';
import { txErrorState } from 'store/exchange';
import logError from 'utils/logError';

const useApproveExchange = () => {
	// const [approveStatus, setApproveStatus] = useRecoilState(approveStatusState);
	const setTxError = useSetRecoilState(txErrorState);
	const dispatch = useAppDispatch();

	// const { monitorTransaction } = TransactionNotifier.useContainer();
	const { setOpenModal } = useExchangeContext();

	// useEffect(() => {
	// 	if (approveTxn.hash) {
	// 		monitorTransaction({
	// 			txHash: approveTxn.hash,
	// 			onTxConfirmed: () => {
	// 				setApproveStatus('approved');
	// 			},
	// 		});
	// 	}

	// 	// eslint-disable-next-line
	// }, [approveTxn.hash]);

	const handleApprove = useCallback(async () => {
		setTxError(null);
		setOpenModal('approve');

		try {
			dispatch(submitApprove());
			setOpenModal(undefined);
		} catch (e) {
			logError(e);
			// setApproveStatus('none');
			setTxError(e.message);
		}
	}, [setTxError, setOpenModal, dispatch]);

	// if (wei(ethers.utils.formatEther(allowance)).gte(quoteCurrencyAmount)) {
	// 	setApproveStatus('approved');
	// }

	// useEffect(() => {
	// 	if (needsApproval) {
	// 		checkAllowance();
	// 	}
	// }, [checkAllowance, needsApproval]);

	const isApproving = false;
	const isApproved = false;

	return { isApproving, isApproved, handleApprove };
};

export default useApproveExchange;
