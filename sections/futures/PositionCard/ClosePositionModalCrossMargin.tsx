import Wei, { wei } from '@synthetixio/wei';
import { formatBytes32String } from 'ethers/lib/utils';
import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_CROSSMARGIN_GAS_BUFFER_PCT } from 'constants/defaults';
import { useFuturesContext } from 'contexts/FuturesContext';
import { useRefetchContext } from 'contexts/RefetchContext';
import { monitorTransaction } from 'contexts/RelayerContext';
import useCrossMarginAccountContracts from 'hooks/useCrossMarginContracts';
import useEstimateGasCost from 'hooks/useEstimateGasCost';
import { fetchCrossMarginBalanceInfo } from 'state/futures/actions';
import { selectMarketAsset, selectMarketKey, selectPosition } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
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
	const { handleRefetch } = useRefetchContext();
	const { crossMarginAccountContract } = useCrossMarginAccountContracts();
	const { resetTradeState } = useFuturesContext();
	const { estimateEthersContractTxCost } = useEstimateGasCost();
	const dispatch = useAppDispatch();

	const [crossMarginGasFee, setCrossMarginGasFee] = useState<Wei | null>(null);
	const [crossMarginGasLimit, setCrossMarginGasLimit] = useState<Wei | null>(null);
	const [error, setError] = useState<null | string>(null);

	const marketAsset = useAppSelector(selectMarketAsset);
	const marketKey = useAppSelector(selectMarketKey);

	const position = useAppSelector(selectPosition);
	const positionDetails = position?.position;

	const positionSize = useMemo(() => positionDetails?.size ?? zeroBN, [positionDetails?.size]);

	const crossMarginCloseParams = useMemo(() => {
		return marketAsset === 'SOL' && position?.position?.side === PositionSide.SHORT
			? [
					{
						marketKey: formatBytes32String(marketKey),
						marginDelta: zeroBN.toBN(),
						sizeDelta: positionSize.add(wei(1, 18, true)).toBN(),
					},
					{
						marketKey: formatBytes32String(marketKey),
						marginDelta: zeroBN.toBN(),
						sizeDelta: wei(1, 18, true).neg().toBN(),
					},
			  ]
			: [
					{
						marketKey: formatBytes32String(marketKey),
						marginDelta: zeroBN.toBN(),
						sizeDelta:
							position?.position?.side === PositionSide.LONG
								? positionSize.neg().toBN()
								: positionSize.toBN(),
					},
			  ];
	}, [marketKey, marketAsset, position?.position?.side, positionSize]);

	useEffect(() => {
		if (!crossMarginAccountContract) return;
		const estimateGas = async () => {
			const { gasPrice, gasLimit } = await estimateEthersContractTxCost(
				crossMarginAccountContract,
				'distributeMargin',
				[crossMarginCloseParams],
				DEFAULT_CROSSMARGIN_GAS_BUFFER_PCT
			);
			setCrossMarginGasFee(gasPrice);
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
					dispatch(fetchCrossMarginBalanceInfo());
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
