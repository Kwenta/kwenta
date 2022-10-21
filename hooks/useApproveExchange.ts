import { useCallback } from 'react';
import { submitApprove } from 'state/exchange/actions';
import { useAppDispatch } from 'state/hooks';

import logError from 'utils/logError';

const useApproveExchange = () => {
	const dispatch = useAppDispatch();

	const handleApprove = useCallback(async () => {
		try {
			dispatch(submitApprove());
		} catch (e) {
			logError(e);
		}
	}, [dispatch]);

	return { handleApprove };
};

export default useApproveExchange;
