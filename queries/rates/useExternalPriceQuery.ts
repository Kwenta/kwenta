import axios from 'axios';
import { UseQueryOptions, useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import { CG_BASE_API_URL } from './constants';
import { PriceResponse } from './types';
import { synthToCoingeckoPriceId } from './utils';
import { FIAT_SYNTHS, COMMODITY_SYNTHS, CurrencyKey } from 'constants/currency';

const getCoinGeckoPrice = async (currencyKey: CurrencyKey) => {
	const priceId = synthToCoingeckoPriceId(currencyKey);

	const response = await axios.get<PriceResponse>(
		`${CG_BASE_API_URL}/simple/price?ids=${priceId}&vs_currencies=usd`
	);

	return response.status === 200 ? response.data[priceId].usd : null;
};

const getCommodityPrice = async (currencyKey: CurrencyKey) => {
	const { data: externalPrice } = await axios.get('/api/commodityPrice', {
		params: {
			symbol: currencyKey,
		},
	});
	return externalPrice;
};

const getForexPrice = async (currencyKey: CurrencyKey) => {
	const { data: externalPrice } = await axios.get('/api/forexPrice', {
		params: {
			symbol: currencyKey,
		},
	});
	return externalPrice;
};

const useExternalPriceQuery = (
	baseCurrencyKey: CurrencyKey,
	options?: UseQueryOptions<number | null>
) => {
	return useQuery<number | null>(
		QUERY_KEYS.Rates.ExternalPrice(baseCurrencyKey),
		async () => {
			return COMMODITY_SYNTHS.has(baseCurrencyKey)
				? getCommodityPrice(baseCurrencyKey)
				: FIAT_SYNTHS.has(baseCurrencyKey)
				? getForexPrice(baseCurrencyKey)
				: getCoinGeckoPrice(baseCurrencyKey);
		},
		{
			enabled: !!baseCurrencyKey,
			refetchInterval: 60000,
			...options,
		}
	);
};

export default useExternalPriceQuery;
