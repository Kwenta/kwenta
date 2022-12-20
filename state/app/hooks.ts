import { useEffect } from 'react';

import { fetchBalances } from 'state/balances/actions';
import { sdk } from 'state/config';
import { useAppDispatch, useAppSelector, usePollAction } from 'state/hooks';
import { updatePrices } from 'state/prices/actions';
import { selectWallet } from 'state/wallet/selectors';
import { serializePrices } from 'utils/futures';

export function useAppData(ready: boolean) {
	const dispatch = useAppDispatch();
	const wallet = useAppSelector(selectWallet);

	usePollAction('fetchBalances', fetchBalances, { dependencies: [wallet] });

	useEffect(() => {
		if (ready) {
			sdk.prices.startPriceUpdates(15000);
		}
	}, [ready]);

	useEffect(() => {
		sdk.prices.onPricesUpdated(({ prices, type }) => {
			dispatch(updatePrices(serializePrices(prices), type));
		});

		return () => {
			sdk.prices.removePricesListeners();
		};
	}, [dispatch]);
}
