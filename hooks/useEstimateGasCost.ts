import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { Contract } from 'ethers';
import { useMemo, useCallback } from 'react';

import { selectGasSpeed } from 'state/app/selectors';
import { sdk } from 'state/config';
import { useAppSelector } from 'state/hooks';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN } from 'utils/formatters/number';
import logError from 'utils/logError';
import { getTransactionPrice } from 'utils/network';

export default function useEstimateGasCost() {
	const gasSpeed = useAppSelector(selectGasSpeed);

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
		async (
			contract: Contract,
			method: string,
			params: any[],
			buffer: number = 0
		): Promise<{ gasPrice: Wei | null; gasLimit: Wei | null }> => {
			if (!contract?.estimateGas[method]) throw new Error('Invalid contract method');
			try {
				const gasLimit = await contract?.estimateGas[method](...params);
				const metaTx = await contract?.populateTransaction[method](...params);
				if (!metaTx || !gasLimit || !gasPrice?.gasPrice) return { gasPrice: null, gasLimit: null };
				const gasBuffer = gasLimit.mul(buffer).div(100);
				const gasLimitWithBuffer = gasLimit.add(gasBuffer);
				const l1Fee = await sdk.transactions.getOptimismLayerOneFees({
					...metaTx,
					gasPrice: gasPrice?.gasPrice?.toNumber(),
					gasLimit: Number(gasLimitWithBuffer),
				});
				return {
					gasPrice: getTransactionPrice(gasPrice, gasLimit, ethPriceRate, l1Fee) || zeroBN,
					gasLimit: wei(gasLimitWithBuffer, 0, true),
				};
			} catch (err) {
				logError(err);
				return { gasPrice: null, gasLimit: null };
			}
		},
		[gasPrice, ethPriceRate]
	);

	return { estimateSnxTxGasCost, estimateEthersContractTxCost };
}
