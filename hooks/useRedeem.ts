import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import { submitRedeem } from 'state/exchange/actions';
import { useAppDispatch } from 'state/hooks';

import { txErrorState } from 'store/exchange';
import { hexToAsciiV2 } from 'utils/formatters/string';
import logError from 'utils/logError';

const useRedeem = () => {
	const setTxError = useSetRecoilState(txErrorState);
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const handleRedeem = useCallback(async () => {
		setTxError(null);

		try {
			dispatch(submitRedeem());
		} catch (e) {
			logError(e);
			setTxError(
				e.data ? t('common.transaction.revert-reason', { reason: hexToAsciiV2(e.data) }) : e.message
			);
		}
	}, [dispatch, setTxError, t]);

	return { handleRedeem };
};

export default useRedeem;
