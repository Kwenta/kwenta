import Wei from '@synthetixio/wei';
import { useRecoilValue } from 'recoil';

import { priceCurrencyState } from 'store/app';
import { ratesState } from 'store/futures';

const useSelectedPriceCurrency = () => {
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const exchangeRates = useRecoilValue(ratesState);
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
