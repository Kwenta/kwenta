import { useCallback } from 'react';
import { submitRedeem } from 'state/exchange/actions';
import { useAppDispatch } from 'state/hooks';

import logError from 'utils/logError';

const useRedeem = () => {
	const dispatch = useAppDispatch();

	const handleRedeem = useCallback(async () => {
		try {
			dispatch(submitRedeem());
		} catch (e) {
			logError(e);
		}
	}, [dispatch]);

	return { handleRedeem };
};

export default useRedeem;
