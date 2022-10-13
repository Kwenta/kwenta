import useSynthetixQueries from '@synthetixio/queries';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import TransactionNotifier from 'containers/TransactionNotifier';
import { useFuturesContext } from 'contexts/FuturesContext';
import { useRefetchContext } from 'contexts/RefetchContext';
import useEstimateGasCost from 'hooks/useEstimateGasCost';
import { KWENTA_TRACKING_CODE } from 'queries/futures/constants';
import { currentMarketState, futuresAccountTypeState, positionState } from 'store/futures';
import { gasSpeedState } from 'store/wallet';
import { getDisplayAsset } from 'utils/futures';

import ClosePositionModal from './ClosePositionModal';

type Props = {
	onDismiss: () => void;
};

export default function ClosePositionModalIsolatedMargin({ onDismiss }: Props) {
	const { handleRefetch, refetchUntilUpdate } = useRefetchContext();
	const { useEthGasPriceQuery, useSynthetixTxn } = useSynthetixQueries();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const gasSpeed = useRecoilValue(gasSpeedState);
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { resetTradeState } = useFuturesContext();
	const { estimateSnxTxGasCost } = useEstimateGasCost();

	const currencyKey = useRecoilValue(currentMarketState);
	const position = useRecoilValue(positionState);
	const positionDetails = position?.position;
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);

	const gasPrice = ethGasPriceQuery.data?.[gasSpeed] ?? null;

	const closeTxn = useSynthetixTxn(
		`FuturesMarket${getDisplayAsset(currencyKey)}`,
		'closePositionWithTracking',
		[KWENTA_TRACKING_CODE],
		gasPrice ?? undefined,
		{ enabled: !!currencyKey && selectedAccountType === 'isolated_margin' }
	);

	const transactionFee = estimateSnxTxGasCost(closeTxn);

	useEffect(() => {
		if (closeTxn?.hash) {
			monitorTx(closeTxn.hash);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [closeTxn?.hash]);

	const monitorTx = (txHash: string) => {
		if (txHash) {
			monitorTransaction({
				txHash: txHash,
				onTxConfirmed: () => {
					onDismiss();
					resetTradeState();
					handleRefetch('close-position');
					refetchUntilUpdate('account-margin-change');
				},
			});
		}
	};

	return (
		<ClosePositionModal
			onDismiss={onDismiss}
			gasFee={transactionFee}
			positionDetails={positionDetails}
			onClosePosition={() => closeTxn?.mutate()}
		/>
	);
}
