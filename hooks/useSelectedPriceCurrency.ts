import Wei from '@synthetixio/wei';
import { useRecoilValue } from 'recoil';

import { selectExchangeRates } from 'state/exchange/selectors';
import { useAppSelector } from 'state/hooks';
import { priceCurrencyState } from 'store/app';

const useSelectedPriceCurrency = () => {
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
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
