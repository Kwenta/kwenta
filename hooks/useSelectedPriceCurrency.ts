import Wei from '@synthetixio/wei';
import { useRecoilValue } from 'recoil';

import { useAppSelector } from 'state/hooks';
import { selectPrices } from 'state/prices/selectors';
import { priceCurrencyState } from 'store/app';

const useSelectedPriceCurrency = () => {
	// TODO: Move to redux
	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const prices = useAppSelector(selectPrices);
	const selectPriceCurrencyRate = prices && prices[selectedPriceCurrency.name]?.onChain;

	const getPriceAtCurrentRate = (price: Wei) =>
		selectPriceCurrencyRate ? price.div(selectPriceCurrencyRate) : price;

	return {
		selectPriceCurrencyRate,
		selectedPriceCurrency,
		getPriceAtCurrentRate,
	};
};

export default useSelectedPriceCurrency;
