import { useRouter } from 'next/router';
import { memo, useCallback } from 'react';
import { checkNeedsApproval, fetchRates, fetchTxProvider } from 'state/exchange/actions';
import { setBaseCurrencyKey, setOpenModal, setQuoteCurrencyKey } from 'state/exchange/reducer';
import { useAppDispatch, useAppSelector } from 'state/hooks';

import ROUTES from 'constants/routes';
import SelectCurrencyModal from 'sections/shared/modals/SelectCurrencyModal';

const ExchangeModals = memo(() => {
	const dispatch = useAppDispatch();

	const router = useRouter();

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

	const { openModal, quoteCurrencyKey, baseCurrencyKey } = useAppSelector(({ exchange }) => ({
		quoteCurrencyKey: exchange.quoteCurrencyKey,
		baseCurrencyKey: exchange.baseCurrencyKey,
		openModal: exchange.openModal,
	}));

	const closeModal = () => {
		dispatch(setOpenModal(undefined));
	};

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
			dispatch(checkNeedsApproval());
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
			dispatch(checkNeedsApproval());
		},
		[baseCurrencyKey, routeToMarketPair, dispatch]
	);

	return (
		<>
			{openModal === 'quote-select' && (
				<SelectCurrencyModal onDismiss={closeModal} onSelect={onQuoteCurrencyChange} />
			)}

			{openModal === 'base-select' && (
				<SelectCurrencyModal onDismiss={closeModal} onSelect={onBaseCurrencyChange} />
			)}
		</>
	);
});

export default ExchangeModals;
