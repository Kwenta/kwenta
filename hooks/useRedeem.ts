import useSynthetixQueries from '@synthetixio/queries';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetRecoilState } from 'recoil';

import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useExchangeContext } from 'contexts/ExchangeContext';
import { txErrorState } from 'store/exchange';
import { hexToAsciiV2 } from 'utils/formatters/string';
import logError from 'utils/logError';

const useRedeem = () => {
	const setTxError = useSetRecoilState(txErrorState);
	const {
		useSynthetixTxn,
		useSynthsBalancesQuery,
		useRedeemableDeprecatedSynthsQuery,
	} = useSynthetixQueries();
	const { setOpenModal } = useExchangeContext();
	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { walletAddress } = Connector.useContainer();

	const redeemableDeprecatedSynthsQuery = useRedeemableDeprecatedSynthsQuery(walletAddress);
	const redeemableDeprecatedSynths = redeemableDeprecatedSynthsQuery.data ?? null;

	const synthsWalletBalancesQuery = useSynthsBalancesQuery(walletAddress);

	const redeemTxn = useSynthetixTxn(
		'SynthRedeemer',
		'redeemAll',
		[redeemableDeprecatedSynths?.balances.map((b) => b.proxyAddress)],
		undefined,
		{ enabled: !!redeemableDeprecatedSynths?.totalUSDBalance.gt(0) }
	);

	React.useEffect(() => {
		if (redeemTxn.hash) {
			monitorTransaction({
				txHash: redeemTxn.hash,
				onTxConfirmed: () => {
					setOpenModal(undefined);
					redeemableDeprecatedSynthsQuery.refetch();
					synthsWalletBalancesQuery.refetch();
				},
			});
		}

		// eslint-disable-next-line
	}, [redeemTxn.hash]);

	const handleRedeem = async () => {
		setTxError(null);
		setOpenModal('redeem');

		try {
			await redeemTxn.mutateAsync();
		} catch (e) {
			logError(e);
			setTxError(
				e.data ? t('common.transaction.revert-reason', { reason: hexToAsciiV2(e.data) }) : e.message
			);
		}
	};

	return { handleRedeem };
};

export default useRedeem;
