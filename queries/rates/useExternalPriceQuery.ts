import axios from 'axios';
import { UseQueryOptions, useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import { CG_BASE_API_URL } from './constants';
import { PriceResponse } from './types';
import { getMarketKey } from 'utils/futures';
import { synthToCoingeckoPriceId } from './utils';
import { useRecoilValue } from 'recoil';
import { Network, networkState } from 'store/wallet';
import { FIAT_SYNTHS, COMMODITY_SYNTHS, CurrencyKey } from 'constants/currency';

const getCoinGeckoPrice = async (currencyKey: CurrencyKey, network: Network) => {
	const marketKey = getMarketKey(currencyKey, network.id);
	const priceId = synthToCoingeckoPriceId(marketKey);

	const response = await axios.get<PriceResponse>(
		`${CG_BASE_API_URL}/simple/price?ids=${priceId}&vs_currencies=usd`
	);

	return response.status === 200 ? response.data[priceId].usd : null;
};

const useExternalPriceQuery = (
	baseCurrencyKey: CurrencyKey,
	options?: UseQueryOptions<number | null>
) => {
	const network = useRecoilValue(networkState);

	return useQuery<number | null>(
		QUERY_KEYS.Rates.ExternalPrice(baseCurrencyKey),
		async () => {
			return COMMODITY_SYNTHS.has(baseCurrencyKey)
				? null
				: FIAT_SYNTHS.has(baseCurrencyKey)
				? null
				: getCoinGeckoPrice(baseCurrencyKey, network);
		},
		{
			enabled: !!baseCurrencyKey,
			...options,
		}
	);
};

export default useExternalPriceQuery;
