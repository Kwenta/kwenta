import Wei, { wei } from '@synthetixio/wei';
import { formatBytes32String } from 'ethers/lib/utils';
import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { DEFAULT_CROSSMARGIN_GAS_BUFFER } from 'constants/defaults';
import { useFuturesContext } from 'contexts/FuturesContext';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import useEstimateGasCost from 'hooks/useEstimateGasCost';
import { currentMarketState, positionState } from 'store/futures';
import { isUserDeniedError } from 'utils/formatters/error';
import { zeroBN } from 'utils/formatters/number';
import { MarketKeyByAsset } from 'utils/futures';
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

	const [crossMarginGasFee, setCrossMarginGasFee] = useState<Wei>(zeroBN);
	const [crossMarginGasLimit, setCrossMarginGasLimit] = useState<Wei | undefined>();
	const [error, setError] = useState<null | string>(null);

	const currencyKey = useRecoilValue(currentMarketState);
	const position = useRecoilValue(positionState);
	const positionDetails = position?.position;

	const positionSize = useMemo(() => positionDetails?.size ?? zeroBN, [positionDetails?.size]);

	const crossMarginCloseParams = useMemo(() => {
		return currencyKey === 'SOL' && position?.position?.side === PositionSide.SHORT
			? [
					{
						marketKey: formatBytes32String(MarketKeyByAsset[currencyKey]),
						marginDelta: zeroBN.toBN(),
						sizeDelta: positionSize.add(wei(1, 18, true)).toBN(),
					},
					{
						marketKey: formatBytes32String(MarketKeyByAsset[currencyKey]),
						marginDelta: zeroBN.toBN(),
						sizeDelta: wei(1, 18, true).neg().toBN(),
					},
			  ]
			: [
					{
						marketKey: formatBytes32String(MarketKeyByAsset[currencyKey]),
						marginDelta: zeroBN.toBN(),
						sizeDelta:
							position?.position?.side === PositionSide.LONG
								? positionSize.neg().toBN()
								: positionSize.toBN(),
					},
			  ];
	}, [currencyKey, position?.position?.side, positionSize]);

	useEffect(() => {
		if (!crossMarginAccountContract) return;
		const estimateGas = async () => {
			const [fee, gasLimit] = await estimateEthersContractTxCost(
				crossMarginAccountContract,
				'distributeMargin',
				[crossMarginCloseParams],
				DEFAULT_CROSSMARGIN_GAS_BUFFER
			);
			setCrossMarginGasFee(fee);
			setCrossMarginGasLimit(gasLimit);
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
			const tx = await crossMarginAccountContract.distributeMargin(crossMarginCloseParams, {
				gasLimit: crossMarginGasLimit?.toBN(),
			});

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
