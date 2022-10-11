import useSynthetixQueries from '@synthetixio/queries';
import { useRouter } from 'next/router';
import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchRates, fetchTxProvider, submitExchange } from 'state/exchange/actions';
import {
	setBaseAmount,
	setBaseCurrencyKey,
	setMaxBaseBalance,
	setMaxQuoteBalance,
	setQuoteAmount,
	setQuoteCurrencyKey,
	setRatio,
	swapCurrencies,
} from 'state/exchange/reducer';
import {
	selectBaseAmountWei,
	selectBothSidesSelected,
	selectQuoteAmountWei,
} from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/store';

import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
// import TransactionNotifier from 'containers/TransactionNotifier';
// import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
// import useSynthBalances from 'queries/synths/useSynthBalances';

type ExchangeCardProps = {
	showNoSynthsCard?: boolean;
};

type ExchangeModal = 'settle' | 'confirm' | 'approve' | 'redeem' | 'base-select' | 'quote-select';
export type SwapRatio = 25 | 50 | 75 | 100;

const useExchange = ({ showNoSynthsCard = false }: ExchangeCardProps) => {
	const { t } = useTranslation();
	// const { monitorTransaction } = TransactionNotifier.useContainer();

	const { useFeeReclaimPeriodQuery } = useSynthetixQueries();

	// useSynthBalances();
	const { isWalletConnected, walletAddress } = Connector.useContainer();

	const router = useRouter();

	const [openModal, setOpenModal] = useState<ExchangeModal>();

	// useExchangeRatesQuery({ refetchInterval: 15000 });

	const {
		baseCurrencyKey,
		quoteCurrencyKey,
		quoteBalance,
		txProvider,
		isApproving,
		isSubmitting,
	} = useAppSelector(({ exchange }) => exchange);

	const selectedBothSides = useAppSelector(selectBothSidesSelected);
	const baseAmountWei = useAppSelector(selectBaseAmountWei);
	const quoteAmountWei = useAppSelector(selectQuoteAmountWei);

	const dispatch = useAppDispatch();

	// TODO: these queries break when `txProvider` is not `synthetix` and should not be called.
	// however, condition would break rule of hooks here
	const feeReclaimPeriodQuery = useFeeReclaimPeriodQuery(quoteCurrencyKey ?? null, walletAddress);

	const feeReclaimPeriodInSeconds = feeReclaimPeriodQuery.data ?? 0;

	const submissionDisabledReason = useMemo(() => {
		const insufficientBalance = quoteBalance != null ? quoteAmountWei.gt(quoteBalance) : false;

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
		if (!isWalletConnected || baseAmountWei.lte(0) || quoteAmountWei.lte(0)) {
			return t('exchange.summary-info.button.enter-amount');
		}
		return null;
	}, [
		quoteBalance,
		selectedBothSides,
		isSubmitting,
		feeReclaimPeriodInSeconds,
		baseAmountWei,
		quoteAmountWei,
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
			dispatch(setBaseCurrencyKey({ currencyKey }));

			if (!!quoteCurrencyKey && quoteCurrencyKey !== currencyKey) {
				routeToMarketPair(currencyKey, quoteCurrencyKey);
			} else {
				routeToBaseCurrency(currencyKey);
			}

			dispatch(fetchRates());
			dispatch(fetchTxProvider());
		},
		[quoteCurrencyKey, routeToBaseCurrency, routeToMarketPair, dispatch]
	);

	const onQuoteCurrencyChange = useCallback(
		(currencyKey: string) => {
			dispatch(setQuoteCurrencyKey({ currencyKey }));

			if (baseCurrencyKey && baseCurrencyKey !== currencyKey) {
				routeToMarketPair(baseCurrencyKey, currencyKey);
			}

			dispatch(fetchRates());
			dispatch(fetchTxProvider());
		},
		[baseCurrencyKey, routeToMarketPair, dispatch]
	);

	// const monitorExchangeTxn = useCallback(
	// 	(hash: string | null) => {
	// 		if (hash) {
	// 			monitorTransaction({
	// 				txHash: hash,
	// 				onTxConfirmed: () => {
	// 					synthsWalletBalancesQuery.refetch();
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

	const onBaseCurrencyAmountChange = (value: string) => {
		dispatch(setBaseAmount({ value }));
	};

	const onBaseBalanceClick = () => {
		dispatch(setMaxBaseBalance());
	};

	const onQuoteCurrencyAmountChange = (value: string) => {
		dispatch(setQuoteAmount({ value }));
	};

	const onQuoteBalanceClick = () => {
		dispatch(setMaxQuoteBalance());
	};

	const onRatioChange = (ratio: SwapRatio) => {
		dispatch(setRatio({ ratio }));
	};

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
