import useSynthetixQueries from '@synthetixio/queries';
import Wei from '@synthetixio/wei';

import { useRecoilValue } from 'recoil';
import { priceCurrencyState } from 'store/app';
import { networkState } from 'store/wallet';

const useSelectedPriceCurrency = () => {
	const network = useRecoilValue(networkState);
	const { useExchangeRatesQuery } = useSynthetixQueries({
		networkId: network.id,
	});

	const selectedPriceCurrency = useRecoilValue(priceCurrencyState);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const exchangeRates = exchangeRatesQuery.isSuccess ? exchangeRatesQuery.data ?? null : null;
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
