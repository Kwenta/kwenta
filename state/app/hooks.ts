import { useEffect } from 'react';
import { sdk } from 'state/config';
import { setExchangeRates } from 'state/exchange/actions';
import { useAppDispatch } from 'state/hooks';

export function useAppData(ready: boolean) {
	const dispatch = useAppDispatch();

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
