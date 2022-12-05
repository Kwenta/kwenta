import { useEffect } from 'react';

import { fetchBalances } from 'state/balances/actions';
import { sdk } from 'state/config';
import { setExchangeRates } from 'state/exchange/actions';
import { useAppDispatch, useAppSelector, usePollAction } from 'state/hooks';
import { selectWallet } from 'state/wallet/selectors';

export function useAppData(ready: boolean) {
	const dispatch = useAppDispatch();
	const wallet = useAppSelector(selectWallet);

	usePollAction('fetchBalances', fetchBalances, { dependencies: [wallet] });

	useEffect(() => {
		if (ready) {
			sdk.exchange.startRateUpdates(15000);
		}
	}, [ready]);

	useEffect(() => {
		sdk.exchange.onRatesUpdated((exchangeRates) => {
			dispatch(setExchangeRates(exchangeRates));
		});

		return () => {
			sdk.exchange.removeRatesListeners();
		};
	}, [dispatch]);
}
