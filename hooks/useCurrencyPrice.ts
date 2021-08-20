import { useRecoilValue } from 'recoil';

import useSynthetixQueries from '@synthetixio/queries';
import { CurrencyKey } from 'constants/currency';
import { priceCurrencyState } from 'store/app';
import { zeroBN } from 'utils/formatters/number';
import { wei } from '@synthetixio/wei';

const useCurrencyPrice = (currencyKey: CurrencyKey) => {
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
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
