import { useEffect } from 'react';

import { fetchBalances } from 'state/balances/actions';
import { sdk } from 'state/config';
import { fetchEarnTokenPrice } from 'state/earn/actions';
import { useAppDispatch, useAppSelector, usePollAction } from 'state/hooks';
import { updatePrices } from 'state/prices/actions';
import { setConnectionError } from 'state/prices/reducer';
import { selectWallet } from 'state/wallet/selectors';
import { serializePrices } from 'utils/futures';

export function useAppData(ready: boolean) {
	const dispatch = useAppDispatch();
	const wallet = useAppSelector(selectWallet);

	usePollAction('fetchBalances', fetchBalances, { dependencies: [wallet] });
	usePollAction('fetchEarnTokenPrice', fetchEarnTokenPrice, { intervalTime: 60000 });

	useEffect(() => {
		if (ready) {
			sdk.prices.startPriceUpdates(15000);
		}
	}, [ready]);

	useEffect(() => {
		sdk.prices.onPricesUpdated(({ prices, type }) => {
			dispatch(updatePrices(serializePrices(prices), type));
			if (type === 'off_chain') {
				// must be connected again, remove any error
				dispatch(setConnectionError(null));
			}
		});

		sdk.prices.onPricesConnectionUpdated(({ error }) => {
			dispatch(setConnectionError(error?.message));
		});

		return () => {
			sdk.prices.removePricesListeners();
			sdk.prices.removeConnectionListeners();
		};
	}, [dispatch]);
}
