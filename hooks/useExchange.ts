import { useRouter } from 'next/router';
import { useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { resetCurrencies, submitExchange } from 'state/exchange/actions';
import { setOpenModal } from 'state/exchange/reducer';
import {
	selectBaseAmountWei,
	selectBothSidesSelected,
	selectInsufficientBalance,
	selectQuoteAmountWei,
} from 'state/exchange/selectors';
import { useAppDispatch, useAppSelector } from 'state/store';

// import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import logError from 'utils/logError';
// import TransactionNotifier from 'containers/TransactionNotifier';

type ExchangeCardProps = {
	showNoSynthsCard?: boolean;
};

export type SwapRatio = 25 | 50 | 75 | 100;

const useExchange = ({ showNoSynthsCard = false }: ExchangeCardProps) => {
	const { t } = useTranslation();
	// const { monitorTransaction } = TransactionNotifier.useContainer();

	const { isWalletConnected, network } = Connector.useContainer();

	const router = useRouter();

	const { txProvider, isApproving, isSubmitting, feeReclaimPeriod } = useAppSelector(
		({ exchange }) => exchange
	);

	const selectedBothSides = useAppSelector(selectBothSidesSelected);
	const baseAmountWei = useAppSelector(selectBaseAmountWei);
	const quoteAmountWei = useAppSelector(selectQuoteAmountWei);
	const insufficientBalance = useAppSelector(selectInsufficientBalance);

	const dispatch = useAppDispatch();

	const submissionDisabledReason = useMemo(() => {
		if (feeReclaimPeriod > 0) {
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
		selectedBothSides,
		isSubmitting,
		feeReclaimPeriod,
		baseAmountWei,
		quoteAmountWei,
		isWalletConnected,
		isApproving,
		t,
		txProvider,
		insufficientBalance,
	]);

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
		dispatch(setOpenModal(undefined));
	};

	const handleSubmit = useCallback(() => {
		try {
			dispatch(setOpenModal('confirm'));
			dispatch(submitExchange());
			// setTxError(null);
			// if (tx?.hash) monitorExchangeTxn(tx.hash);
		} catch (error) {
			// setTxError(e.message);
			logError(error);
		}

		// setOpenModal(undefined);
	}, [
		// monitorExchangeTxn,
		// setTxError,
		dispatch,
	]);

	useEffect(() => {
		const quoteCurrencyFromQuery = router.query.quote as string | undefined;
		const baseCurrencyFromQuery = router.query.base as string | undefined;

		if (!!quoteCurrencyFromQuery || !!baseCurrencyFromQuery) {
			dispatch(resetCurrencies({ quoteCurrencyFromQuery, baseCurrencyFromQuery }));
		}
	}, [router.query.quote, router.query.base, network.id, dispatch]);

	return {
		handleSubmit,
		handleDismiss,
		showNoSynthsCard,
		submissionDisabledReason,
	};
};

export default useExchange;
