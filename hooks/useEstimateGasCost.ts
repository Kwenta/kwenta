import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { Contract } from 'ethers';
import { useMemo, useCallback } from 'react';
import { useRecoilValue } from 'recoil';
import { sdk } from 'state/config';

import { gasSpeedState } from 'store/wallet';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';
import { getTransactionPrice } from 'utils/network';

export default function useEstimateGasCost() {
	const gasSpeed = useRecoilValue(gasSpeedState);

	const { useEthGasPriceQuery, useExchangeRatesQuery } = useSynthetixQueries();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const gasPrice = ethGasPriceQuery.data?.[gasSpeed] ?? null;

	const exchangeRates = useMemo(() => exchangeRatesQuery.data ?? null, [exchangeRatesQuery.data]);

	const ethPriceRate = useMemo(
		() => newGetExchangeRatesForCurrencies(exchangeRates, 'sETH', 'sUSD'),
		[exchangeRates]
	);

	const estimateSnxTxGasCost = useCallback(
		(transaction: any): Wei => {
			const gasCost = getTransactionPrice(
				gasPrice,
				transaction.gasLimit,
				ethPriceRate,
				transaction.optimismLayerOneFee
			);
			return gasCost || zeroBN;
		},
		[gasPrice, ethPriceRate]
	);

	const estimateEthersContractTxCost = useCallback(
		async (contract: Contract, method: string, params: any[]): Promise<Wei> => {
			try {
				if (!contract?.estimateGas[method]) throw new Error('Invalid contract method');
				const gasLimit = await contract?.estimateGas[method](...params);
				const metaTx = await contract?.populateTransaction[method](...params);
				if (!metaTx || !gasLimit || !gasPrice?.gasPrice) return zeroBN;
				const l1Fee = await sdk.transactions.getOptimismLayerOneFees({
					...metaTx,
					gasPrice: gasPrice?.gasPrice?.toNumber(),
					gasLimit: Number(gasLimit),
				});
				return getTransactionPrice(gasPrice, gasLimit, ethPriceRate, l1Fee) || zeroBN;
			} catch (err) {
				logError(err);
				return zeroBN;
			}
		},
		[gasPrice, ethPriceRate]
	);

	const estimateEthersContractGasLimit = useCallback(
		async (contract: Contract, method: string, params: any[]): Promise<Wei | undefined> => {
			try {
				if (!contract?.estimateGas[method]) throw new Error('Invalid contract method');
				const gasLimit = await contract?.estimateGas[method](...params);
				return wei(gasLimit, 0, true);
			} catch (err) {
				logError(err);
				return;
			}
		},
		[]
	);

	return { estimateSnxTxGasCost, estimateEthersContractTxCost, estimateEthersContractGasLimit };
}
