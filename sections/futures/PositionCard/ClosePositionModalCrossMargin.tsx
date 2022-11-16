import { wei } from '@synthetixio/wei';
import { formatBytes32String } from 'ethers/lib/utils';
import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { useFuturesContext } from 'contexts/FuturesContext';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import useEstimateGasCost from 'hooks/useEstimateGasCost';
import { selectMarketAsset, selectMarketKey } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
import { positionState } from 'store/futures';
import { isUserDeniedError } from 'utils/formatters/error';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';

import { PositionSide } from '../types';
import ClosePositionModal from './ClosePositionModal';

type Props = {
	onDismiss: () => void;
};

export default function ClosePositionModalCrossMargin({ onDismiss }: Props) {
	const { t } = useTranslation();
	const { handleRefetch, refetchUntilUpdate } = useRefetchContext();
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const { resetTradeState } = useFuturesContext();
	const { estimateEthersContractTxCost } = useEstimateGasCost();

	const [crossMarginGasFee, setCrossMarginGasFee] = useState(wei(0));
	const [error, setError] = useState<null | string>(null);

	const marketAsset = useAppSelector(selectMarketAsset);
	const marketAssetKey = useAppSelector(selectMarketKey);

	const position = useRecoilValue(positionState);
	const positionDetails = position?.position;

	const positionSize = useMemo(() => positionDetails?.size ?? zeroBN, [positionDetails?.size]);

	const crossMarginCloseParams = useMemo(() => {
		return marketAsset === 'SOL' && position?.position?.side === PositionSide.SHORT
			? [
					{
						marketKey: formatBytes32String(marketAssetKey),
						marginDelta: zeroBN.toBN(),
						sizeDelta: positionSize.add(wei(1, 18, true)).toBN(),
					},
					{
						marketKey: formatBytes32String(marketAssetKey),
						marginDelta: zeroBN.toBN(),
						sizeDelta: wei(1, 18, true).neg().toBN(),
					},
			  ]
			: [
					{
						marketKey: formatBytes32String(marketAssetKey),
						marginDelta: zeroBN.toBN(),
						sizeDelta:
							position?.position?.side === PositionSide.LONG
								? positionSize.neg().toBN()
								: positionSize.toBN(),
					},
			  ];
	}, [marketAssetKey, marketAsset, position?.position?.side, positionSize]);

	useEffect(() => {
		if (!crossMarginAccountContract) return;
		const estimateGas = async () => {
			const fee = await estimateEthersContractTxCost(
				crossMarginAccountContract,
				'distributeMargin',
				[crossMarginCloseParams]
			);
			setCrossMarginGasFee(fee);
		};
		estimateGas();
	}, [crossMarginAccountContract, crossMarginCloseParams, estimateEthersContractTxCost]);

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

	const closePosition = async () => {
		if (!crossMarginAccountContract) return;
		try {
			const tx = await crossMarginAccountContract.distributeMargin(crossMarginCloseParams);

			monitorTx(tx.hash);
		} catch (err) {
			if (!isUserDeniedError(err.message)) {
				setError(t('common.transaction.transaction-failed'));
			}
			logError(err);
		}
	};

	return (
		<ClosePositionModal
			onDismiss={onDismiss}
			gasFee={crossMarginGasFee}
			positionDetails={positionDetails}
			onClosePosition={closePosition}
			errorMessage={error}
		/>
	);
}
