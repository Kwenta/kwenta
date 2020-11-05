import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import { useRecoilValue } from 'recoil';
import { priceCurrencyState } from 'store/app';

const useSelectedPriceCurrency = () => {
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.data ?? null;
	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];

	return {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
	};
};

export default useSelectedPriceCurrency;
