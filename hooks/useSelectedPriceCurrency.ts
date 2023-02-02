import Wei from '@synthetixio/wei';

import { selectExchangeRates } from 'state/exchange/selectors';
import { useAppSelector } from 'state/hooks';
import { selectPreferredCurrency } from 'state/preferences/selectors';

const useSelectedPriceCurrency = () => {
	const selectedPriceCurrency = useAppSelector(selectPreferredCurrency);
	const exchangeRates = useAppSelector(selectExchangeRates);
	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];

	const getPriceAtCurrentRate = (price: Wei) =>
		selectPriceCurrencyRate != null ? price.div(selectPriceCurrencyRate) : price;

	return {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
		getPriceAtCurrentRate,
	};
};

export default useSelectedPriceCurrency;
