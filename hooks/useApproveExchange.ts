import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { submitApprove } from 'state/exchange/actions';
import { useAppDispatch } from 'state/hooks';

import { txErrorState } from 'store/exchange';
import logError from 'utils/logError';

const useApproveExchange = () => {
	const setTxError = useSetRecoilState(txErrorState);
	const dispatch = useAppDispatch();

	const handleApprove = useCallback(async () => {
		setTxError(null);

		try {
			dispatch(submitApprove());
		} catch (e) {
			logError(e);
			setTxError(e.message);
		}
	}, [setTxError, dispatch]);

	return { handleApprove };
};

export default useApproveExchange;
