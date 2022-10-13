import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';
import { submitRedeem } from 'state/exchange/actions';
import { setOpenModal } from 'state/exchange/reducer';
import { useAppDispatch } from 'state/store';

import { txErrorState } from 'store/exchange';
import { hexToAsciiV2 } from 'utils/formatters/string';
import logError from 'utils/logError';

const useRedeem = () => {
	const setTxError = useSetRecoilState(txErrorState);
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	// useEffect(() => {
	// 	if (redeemTxn.hash) {
	// 		monitorTransaction({
	// 			txHash: redeemTxn.hash,
	// 			onTxConfirmed: () => {
	// 				setOpenModal(undefined);
	// 				redeemableDeprecatedSynthsQuery.refetch();
	// 				synthsWalletBalancesQuery.refetch();
	// 			},
	// 		});
	// 	}

	// 	// eslint-disable-next-line
	// }, [redeemTxn.hash]);

	const handleRedeem = useCallback(async () => {
		setTxError(null);
		dispatch(setOpenModal('redeem'));

		try {
			dispatch(submitRedeem());
		} catch (e) {
			logError(e);
			setTxError(
				e.data ? t('common.transaction.revert-reason', { reason: hexToAsciiV2(e.data) }) : e.message
			);
		}
	}, [dispatch, setOpenModal, setTxError, t]);

	return { handleRedeem };
};

export default useRedeem;
