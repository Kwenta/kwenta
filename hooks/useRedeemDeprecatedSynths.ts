import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries, { DeprecatedSynthsBalances } from '@synthetixio/queries';
import { ethers } from 'ethers';

import { Synths } from 'constants/currency';

import { customGasPriceState, gasSpeedState } from 'store/wallet';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';

import { normalizeGasLimit, gasPriceInWei, getTransactionPrice } from 'utils/network';
import { hexToAsciiV2 } from 'utils/formatters/string';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { UseQueryResult } from 'react-query';

const useRedeemDeprecatedSynths = (
	redeemableDeprecatedSynthsQuery: UseQueryResult<DeprecatedSynthsBalances>,
	onSuccess?: () => void
) => {
	const { t } = useTranslation();
	const { useEthGasPriceQuery, useExchangeRatesQuery } = useSynthetixQueries();
	const { synthetixjs } = Connector.useContainer();
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const { selectedPriceCurrency } = useSelectedPriceCurrency();
	const ethGasPriceQuery = useEthGasPriceQuery();
	const exchangeRatesQuery = useExchangeRatesQuery();

	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
	const redeemableDeprecatedSynths = redeemableDeprecatedSynthsQuery.isSuccess
		? redeemableDeprecatedSynthsQuery.data ?? null
		: null;

	const customGasPrice = useRecoilValue(customGasPriceState);
	const gasSpeed = useRecoilValue(gasSpeedState);

	const [redeemTxModalOpen, setRedeemTxModalOpen] = useState<boolean>(false);
	const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
	const [gasLimit, setGasLimit] = useState<number | null>(null);
	const [txError, setTxError] = useState<string | null>(null);

	const gasPrice = useMemo(
		() =>
			customGasPrice !== ''
				? Number(customGasPrice)
				: ethGasPriceQuery.data != null
				? ethGasPriceQuery.data[gasSpeed]
				: null,
		[customGasPrice, ethGasPriceQuery.data, gasSpeed]
	);

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

	const getGasLimitEstimate = useCallback(async (): Promise<number | null> => {
		if (!Redeemer) return null;
		try {
			const { method, params } = getMethodAndParams();
			const gasEstimate = await Redeemer.estimateGas[method](...params);
			return normalizeGasLimit(Number(gasEstimate));
		} catch (e) {
			return null;
		}
	}, [getMethodAndParams, Redeemer]);

	useEffect(() => {
		async function updateGasLimit() {
			if (gasLimit == null) {
				const newGasLimit = await getGasLimitEstimate();
				setGasLimit(newGasLimit);
			}
		}
		updateGasLimit();
	}, [gasLimit, getGasLimitEstimate]);

	const handleRedeem = async () => {
		if (!(Redeemer && gasPrice)) return;

		setTxError(null);
		setRedeemTxModalOpen(true);

		const { method, params } = getMethodAndParams();

		try {
			setIsRedeeming(true);

			let transaction: ethers.ContractTransaction | null = null;

			const gasPriceWei = gasPriceInWei(gasPrice);

			const gasLimitEstimate = await getGasLimitEstimate();
			transaction = (await Redeemer[method](...params, {
				gasPrice: gasPriceWei,
				gasLimit: gasLimitEstimate,
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
				console.log(e);
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
