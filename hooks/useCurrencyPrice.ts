import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

import { CurrencyKey } from 'constants/currency';
import { useAppSelector } from 'state/hooks';
import { selectPreferredCurrency } from 'state/preferences/selectors';
import { zeroBN } from 'utils/formatters/number';

const useCurrencyPrice = (currencyKey: CurrencyKey) => {
	const selectedPriceCurrency = useAppSelector(selectPreferredCurrency);
	const { useExchangeRatesQuery } = useSynthetixQueries();
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
	const selectPriceCurrencyRate = exchangeRates && exchangeRates[selectedPriceCurrency.name];
	const currencyUSDPrice = exchangeRates && exchangeRates[currencyKey];
	return !(currencyUSDPrice && selectPriceCurrencyRate)
		? zeroBN
		: wei(currencyUSDPrice).div(selectPriceCurrencyRate);
};

export default useCurrencyPrice;
