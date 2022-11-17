import { FC } from 'react';
import { useEffect } from 'react';
import { sdk } from 'state/config';
import { setExchangeRates } from 'state/exchange/actions';
import { useAppDispatch } from 'state/hooks';

import Connector from 'containers/Connector';

const AppData: FC = ({ children }) => {
	const dispatch = useAppDispatch();
	const { provider } = Connector.useContainer();

	useEffect(() => {
		if (provider) {
			sdk.exchange.startRateUpdates();
		}
	}, [provider]);

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
