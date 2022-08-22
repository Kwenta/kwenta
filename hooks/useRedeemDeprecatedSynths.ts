import useSynthetixQueries, { DeprecatedSynthsBalances } from '@synthetixio/queries';
import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UseQueryResult } from 'react-query';

import { Synths } from 'constants/currency';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getExchangeRatesForCurrencies } from 'utils/currencies';
import { hexToAsciiV2 } from 'utils/formatters/string';
import logError from 'utils/logError';
import { getTransactionPrice } from 'utils/network';

import useGas from './useGas';

const useRedeemDeprecatedSynths = (
	redeemableDeprecatedSynthsQuery: UseQueryResult<DeprecatedSynthsBalances>,
	onSuccess?: () => void
) => {
	const { t } = useTranslation();
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const { synthetixjs } = Connector.useContainer();
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
	const redeemableDeprecatedSynths = redeemableDeprecatedSynthsQuery.isSuccess
		? redeemableDeprecatedSynthsQuery.data ?? null
		: null;

	const [redeemTxModalOpen, setRedeemTxModalOpen] = useState(false);
	const [isRedeeming, setIsRedeeming] = useState(false);
	const [gasLimit, setGasLimit] = useState<number | null>(null);
	const [txError, setTxError] = useState<string | null>(null);
	const { gasPrice, gasPriceWei, getGasLimitEstimate } = useGas();

	const Redeemer = useMemo(() => synthetixjs?.contracts.SynthRedeemer ?? null, [synthetixjs]);

	const ethPriceRate = useMemo(
		() => getExchangeRatesForCurrencies(exchangeRates, Synths.sETH, selectedPriceCurrency.name),
		[exchangeRates, selectedPriceCurrency.name]
	);

	const transactionFee = useMemo(() => getTransactionPrice(gasPrice, gasLimit, ethPriceRate), [
		gasPrice,
		gasLimit,
		ethPriceRate,
	]);

	const getMethodAndParams = useCallback(
		() => ({
			method: 'redeemAll',
			params: [redeemableDeprecatedSynths?.balances.map((b) => b.proxyAddress)],
		}),
		[redeemableDeprecatedSynths?.balances]
	);

	const gasLimitEstimate = useCallback(async (): Promise<number | null> => {
		if (!Redeemer) return null;
		try {
			const { method, params } = getMethodAndParams();
			return await getGasLimitEstimate(() => Redeemer.estimateGas[method](...params));
		} catch (e) {
			return null;
		}
	}, [getMethodAndParams, Redeemer, getGasLimitEstimate]);

	useEffect(() => {
		async function updateGasLimit() {
			if (gasLimit == null) {
				const newGasLimit = await gasLimitEstimate();
				setGasLimit(newGasLimit);
			}
		}
		updateGasLimit();
	}, [gasLimit, gasLimitEstimate]);

	const handleRedeem = async () => {
		if (!(Redeemer && gasPrice)) return;

		setTxError(null);
		setRedeemTxModalOpen(true);

		const { method, params } = getMethodAndParams();

		try {
			setIsRedeeming(true);

			let transaction: ethers.ContractTransaction | null = null;

			const limitEstimate = await gasLimitEstimate();

			transaction = (await Redeemer[method](...params, {
				gasPrice: gasPriceWei,
				gasLimit: limitEstimate,
			})) as ethers.ContractTransaction;

			if (transaction != null) {
				monitorTransaction({
					txHash: transaction.hash,
				});

				await transaction.wait();
			}
			setRedeemTxModalOpen(false);
			redeemableDeprecatedSynthsQuery.refetch();
			onSuccess?.();
		} catch (e) {
			try {
				await Redeemer.callStatic[method](...params);
				throw e;
			} catch (e) {
				logError(e);
				setTxError(
					e.data
						? t('common.transaction.revert-reason', { reason: hexToAsciiV2(e.data) })
						: e.message
				);
			}
		} finally {
			setIsRedeeming(false);
		}
	};

	const handleDismiss = () => {
		setRedeemTxModalOpen(false);
		setIsRedeeming(false);
	};

	return { isRedeeming, transactionFee, redeemTxModalOpen, txError, handleRedeem, handleDismiss };
};

export default useRedeemDeprecatedSynths;
