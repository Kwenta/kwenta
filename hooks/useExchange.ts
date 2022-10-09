import useSynthetixQueries from '@synthetixio/queries';
import { useRouter } from 'next/router';
import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { submitExchange } from 'state/exchange/actions';
import {
	setBaseAmount,
	setCurrencyPair,
	setQuoteAmount,
	setRatio,
	swapCurrencies,
} from 'state/exchange/reducer';
import { selectBothSidesSelected } from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/store';

import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
// import TransactionNotifier from 'containers/TransactionNotifier';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useSynthBalances from 'queries/synths/useSynthBalances';
import { baseCurrencyAmountBNState, quoteCurrencyAmountBNState } from 'store/exchange';
import { truncateNumbers } from 'utils/formatters/number';

type ExchangeCardProps = {
	showNoSynthsCard?: boolean;
};

type ExchangeModal = 'settle' | 'confirm' | 'approve' | 'redeem' | 'base-select' | 'quote-select';
export type SwapRatio = 25 | 50 | 75 | 100;

const useExchange = ({ showNoSynthsCard = false }: ExchangeCardProps) => {
	const { t } = useTranslation();
	// const { monitorTransaction } = TransactionNotifier.useContainer();

	const { useFeeReclaimPeriodQuery } = useSynthetixQueries();

	useSynthBalances();
	const { isWalletConnected, walletAddress } = Connector.useContainer();

	const router = useRouter();

	const [openModal, setOpenModal] = useState<ExchangeModal>();

	const quoteCurrencyAmountBN = useRecoilValue(quoteCurrencyAmountBNState);
	const baseCurrencyAmountBN = useRecoilValue(baseCurrencyAmountBNState);
	useExchangeRatesQuery({ refetchInterval: 15000 });

	const {
		baseCurrencyKey,
		quoteCurrencyKey,
		quoteBalance,
		baseBalance,
		txProvider,
		baseAmount,
		quoteAmount,
		isApproving,
		isSubmitting,
	} = useAppSelector(({ exchange }) => exchange);

	const selectedBothSides = useAppSelector(selectBothSidesSelected);

	const dispatch = useAppDispatch();

	// TODO: these queries break when `txProvider` is not `synthetix` and should not be called.
	// however, condition would break rule of hooks here
	const feeReclaimPeriodQuery = useFeeReclaimPeriodQuery(quoteCurrencyKey ?? null, walletAddress);

	const feeReclaimPeriodInSeconds = feeReclaimPeriodQuery.data ?? 0;

	const submissionDisabledReason = useMemo(() => {
		const insufficientBalance =
			quoteBalance != null ? quoteCurrencyAmountBN.gt(quoteBalance) : false;

		if (feeReclaimPeriodInSeconds > 0) {
			return t('exchange.summary-info.button.fee-reclaim-period');
		}
		if (!selectedBothSides) {
			return txProvider === '1inch'
				? t('exchange.summary-info.button.select-token')
				: t('exchange.summary-info.button.select-synth');
		}
		if (insufficientBalance) {
			return t('exchange.summary-info.button.insufficient-balance');
		}
		if (isSubmitting) {
			return t('exchange.summary-info.button.submitting-order');
		}
		if (isApproving) {
			return t('exchange.summary-info.button.approving');
		}
		// if (oneInchQuoteQuery.error) {
		// 	return t('exchange.summary-info.button.insufficient-liquidity');
		// }
		if (!isWalletConnected || baseCurrencyAmountBN.lte(0) || quoteCurrencyAmountBN.lte(0)) {
			return t('exchange.summary-info.button.enter-amount');
		}
		return null;
	}, [
		quoteBalance,
		selectedBothSides,
		isSubmitting,
		feeReclaimPeriodInSeconds,
		baseCurrencyAmountBN,
		quoteCurrencyAmountBN,
		isWalletConnected,
		isApproving,
		t,
		txProvider,
	]);

	const routeToMarketPair = useCallback(
		(baseCurrencyKey: string, quoteCurrencyKey: string) =>
			router.replace('/exchange', ROUTES.Exchange.MarketPair(baseCurrencyKey, quoteCurrencyKey), {
				shallow: true,
			}),
		[router]
	);

	const routeToBaseCurrency = useCallback(
		(baseCurrencyKey: string) =>
			router.replace(`/exchange`, ROUTES.Exchange.Into(baseCurrencyKey), {
				shallow: true,
			}),
		[router]
	);

	const handleCurrencySwap = useCallback(() => {
		dispatch(swapCurrencies());

		if (!!quoteCurrencyKey && !!baseCurrencyKey) {
			routeToMarketPair(quoteCurrencyKey, baseCurrencyKey);
		}
	}, [baseCurrencyKey, quoteCurrencyKey, routeToMarketPair, dispatch]);

	// useEffect(() => {
	// 	if (!synthsMap) return;

	// 	setCurrencyPair({
	// 		base: (baseCurrencyKey && synthsMap[baseCurrencyKey]?.name) || null,
	// 		quote: (quoteCurrencyKey && synthsMap[quoteCurrencyKey]?.name) || 'sUSD',
	// 	});
	// 	// eslint-disable-next-line
	// }, [network?.id, walletAddress, setCurrencyPair, synthsMap]);

	const onBaseCurrencyChange = useCallback(
		(currencyKey: string) => {
			dispatch(setQuoteAmount({ quoteAmount: '' }));

			dispatch(
				setCurrencyPair({
					baseCurrencyKey: currencyKey,
					quoteCurrencyKey: quoteCurrencyKey === currencyKey ? null : quoteCurrencyKey,
				})
			);

			if (!!quoteCurrencyKey && quoteCurrencyKey !== currencyKey) {
				routeToMarketPair(currencyKey, quoteCurrencyKey);
			} else {
				routeToBaseCurrency(currencyKey);
			}

			if (txProvider === 'synthetix' && !!baseAmount && !!quoteCurrencyKey) {
				// const quoteCurrencyAmountNoFee = wei(baseAmount).mul(inverseRate);
				// const fee = quoteCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
				// setQuoteCurrencyAmount(
				// 	truncateNumbers(quoteCurrencyAmountNoFee.add(fee), DEFAULT_CRYPTO_DECIMALS)
				// );
			}
		},
		[baseAmount, quoteCurrencyKey, routeToBaseCurrency, routeToMarketPair, txProvider, dispatch]
	);

	const onQuoteCurrencyChange = useCallback(
		(currencyKey: string) => {
			dispatch(setBaseAmount({ baseAmount: '' }));

			dispatch(
				setCurrencyPair({
					quoteCurrencyKey: currencyKey,
					baseCurrencyKey: baseCurrencyKey === currencyKey ? null : baseCurrencyKey,
				})
			);

			if (baseCurrencyKey && baseCurrencyKey !== currencyKey) {
				routeToMarketPair(baseCurrencyKey, currencyKey);
			}

			if (txProvider === 'synthetix' && !!quoteAmount && !!baseCurrencyKey) {
				// const baseCurrencyAmountNoFee = wei(quoteAmount).mul(rate);
				// const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
				// setBaseCurrencyAmount(
				// 	truncateNumbers(baseCurrencyAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
				// );
			}
		},
		[baseCurrencyKey, routeToMarketPair, txProvider, quoteAmount, dispatch]
	);

	// const monitorExchangeTxn = useCallback(
	// 	(hash: string | null) => {
	// 		if (hash) {
	// 			monitorTransaction({
	// 				txHash: hash,
	// 				onTxConfirmed: () => {
	// 					// synthsWalletBalancesQuery.refetch();
	// 					numEntriesQuery.refetch();
	// 				},
	// 			});
	// 		}
	// 	},
	// 	[monitorTransaction, numEntriesQuery]
	// );

	const handleDismiss = () => {
		setOpenModal(undefined);
	};

	const handleSubmit = useCallback(() => {
		dispatch(submitExchange());

		// setTxError(null);
		// setOpenModal('confirm');

		// try {
		// setIsSubmitting(true);

		// if (tx?.hash) monitorExchangeTxn(tx.hash);

		// setOpenModal(undefined);
		// } catch (e) {
		// logError(e);
		// setTxError(e.message);
		// } finally {
		// setIsSubmitting(false);
		// }
	}, [
		// monitorExchangeTxn,
		// setTxError,
		dispatch,
	]);

	// useEffect(() => {
	// 	const baseCurrencyFromQuery = router.query.base as CurrencyKey | null;
	// 	const quoteCurrencyFromQuery = router.query.quote as CurrencyKey | null;

	// 	const tokens = oneInchTokensMap || {};

	// 	const validBaseCurrency =
	// 		baseCurrencyFromQuery != null &&
	// 		(synthsMap[baseCurrencyFromQuery] != null || tokens[baseCurrencyFromQuery]);
	// 	const validQuoteCurrency =
	// 		quoteCurrencyFromQuery != null &&
	// 		(synthsMap[quoteCurrencyFromQuery] != null || tokens[quoteCurrencyFromQuery]);

	// 	if (validBaseCurrency && validQuoteCurrency) {
	// 		setCurrencyPair({
	// 			base: baseCurrencyFromQuery,
	// 			quote: quoteCurrencyFromQuery,
	// 		});
	// 	} else if (validBaseCurrency) {
	// 		setCurrencyPair({
	// 			base: baseCurrencyFromQuery,
	// 			quote: null,
	// 		});
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [synthsMap]);

	const onBaseCurrencyAmountChange = useCallback(
		async (value: string) => {
			setRatio(undefined);

			if (value === '') {
				dispatch(setBaseAmount({ baseAmount: '' }));
			} else {
				dispatch(setBaseAmount({ baseAmount: value }));

				if (txProvider === 'synthetix' && baseCurrencyKey != null) {
					// const quoteCurrencyAmountNoFee = wei(value).mul(inverseRate);
					// const fee = quoteCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
					// setQuoteCurrencyAmount(
					// 	truncateNumbers(quoteCurrencyAmountNoFee.add(fee), DEFAULT_CRYPTO_DECIMALS)
					// );
				}
			}
		},
		[baseCurrencyKey, txProvider, dispatch]
	);

	const onBaseBalanceClick = useCallback(async () => {
		if (!!baseBalance) {
			// setBaseCurrencyAmount(truncateNumbers(baseBalance, DEFAULT_CRYPTO_DECIMALS));

			if (txProvider === 'synthetix') {
				// const baseCurrencyAmountNoFee = baseBalance.mul(inverseRate);
				// const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
				// setQuoteCurrencyAmount(
				// 	truncateNumbers(baseCurrencyAmountNoFee.add(fee), DEFAULT_CRYPTO_DECIMALS)
				// );
			}
		}
	}, [baseBalance, txProvider]);

	const onQuoteCurrencyAmountChange = useCallback(
		async (value: string) => {
			setRatio(undefined);

			if (value === '') {
				dispatch(setQuoteAmount({ quoteAmount: '' }));
			} else {
				dispatch(setQuoteAmount({ quoteAmount: value }));
				if (txProvider === 'synthetix' && baseCurrencyKey != null) {
					// const baseCurrencyAmountNoFee = wei(value).mul(rate);
					// const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
					// setBaseCurrencyAmount(
					// 	truncateNumbers(baseCurrencyAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
					// );
				}
			}
		},
		[txProvider, baseCurrencyKey, dispatch]
	);

	const onQuoteBalanceClick = useCallback(async () => {
		if (!!quoteBalance) {
			if ((quoteCurrencyKey as string) === 'ETH') {
				// const ETH_TX_BUFFER = 0.006;
				// const balanceWithBuffer = quoteBalance.sub(wei(ETH_TX_BUFFER));
				// setQuoteCurrencyAmount(
				// 	balanceWithBuffer.lt(0)
				// 		? '0'
				// 		: truncateNumbers(balanceWithBuffer, DEFAULT_CRYPTO_DECIMALS)
				// );
			} else {
				// setQuoteCurrencyAmount(truncateNumbers(quoteBalance, DEFAULT_CRYPTO_DECIMALS));
			}
			if (txProvider === 'synthetix') {
				// const baseCurrencyAmountNoFee = quoteBalance.mul(rate);
				// const fee = baseCurrencyAmountNoFee.mul(exchangeFeeRate ?? 0);
				// setBaseCurrencyAmount(
				// 	truncateNumbers(baseCurrencyAmountNoFee.sub(fee), DEFAULT_CRYPTO_DECIMALS)
				// );
			}
		}
	}, [quoteBalance, quoteCurrencyKey, txProvider]);

	const onRatioChange = useCallback(
		(ratio: SwapRatio) => {
			dispatch(setRatio({ ratio }));

			if (!!quoteBalance) {
				onQuoteCurrencyAmountChange(
					truncateNumbers(quoteBalance.mul(ratio / 100) ?? 0, DEFAULT_CRYPTO_DECIMALS)
				);
			}
		},
		[quoteBalance, onQuoteCurrencyAmountChange, dispatch]
	);

	return {
		handleCurrencySwap,
		openModal,
		setOpenModal,
		handleSubmit,
		routeToBaseCurrency,
		routeToMarketPair,
		handleDismiss,
		showNoSynthsCard,
		submissionDisabledReason,
		feeReclaimPeriodInSeconds,
		onBaseCurrencyAmountChange,
		onBaseBalanceClick,
		onQuoteCurrencyAmountChange,
		onQuoteBalanceClick,
		onRatioChange,
		onBaseCurrencyChange,
		onQuoteCurrencyChange,
	};
};

export default useExchange;
