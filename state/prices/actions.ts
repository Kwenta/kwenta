import { Prices, PricesMap, PriceType } from 'sdk/types/common';
import { AppThunk } from 'state/store';
import { setOffChainPrices, setOnChainPrices } from './reducer';

export const updatePrices = (prices: PricesMap<string>, type: PriceType): AppThunk => (
	dispatch
) => {
	if (type === 'off_chain') {
		dispatch(setOffChainPrices(prices));
	} else {
		dispatch(setOnChainPrices(prices));
	}
};
