import { useEffect } from 'react';

import { fetchBalances } from 'state/balances/actions';
import { sdk } from 'state/config';
import { fetchMarkets } from 'state/futures/actions';
import { selectMarkets } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector, usePollAction } from 'state/hooks';
import { fetchPreviousDayPrices, updatePrices } from 'state/prices/actions';
import { setConnectionError } from 'state/prices/reducer';
import { selectWallet } from 'state/wallet/selectors';
import { serializePrices } from 'utils/futures';

export function useAppData(ready: boolean) {
	const dispatch = useAppDispatch();
	const wallet = useAppSelector(selectWallet);
	const markets = useAppSelector(selectMarkets);

	usePollAction('fetchMarkets', fetchMarkets, { dependencies: [wallet] });

	usePollAction('fetchBalances', fetchBalances, { dependencies: [wallet] });

	usePollAction('fetchPreviousDayPrices', fetchPreviousDayPrices, {
		intervalTime: 60000 * 15,
		dependencies: [markets.length],
		disabled: !markets.length,
	});

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
