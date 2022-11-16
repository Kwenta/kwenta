import { FC } from 'react';
import { useEffect } from 'react';

import { sdk } from 'state/config';
import { setExchangeRates } from 'state/exchange/actions';
import { useAppDispatch } from 'state/hooks';

const AppData: FC = ({ children }) => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		sdk.exchange.onRatesUpdated((exchangeRates) => {
			dispatch(setExchangeRates(exchangeRates));
		});

		return () => {
			sdk.exchange.removeRatesListeners();
		};
	}, [dispatch]);

	return <>{children}</>;
};

export default AppData;
