import axios from 'axios';
import { QueryConfig, useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import { CG_BASE_API_URL } from './constants';
import { PriceResponse } from './types';

const useCoinGeckoPricesQuery = (priceIds: string[], options?: QueryConfig<PriceResponse>) => {
	return useQuery<PriceResponse>(
		QUERY_KEYS.CoinGecko.Prices(priceIds),
		async () => {
			const response = await axios.get<PriceResponse>(
				`${CG_BASE_API_URL}/simple/price?ids=${priceIds.join(',')}&vs_currencies=usd`
			);

			return response.data;
		},
		{
			enabled: priceIds.length,
			...options,
		}
	);
};

export default useCoinGeckoPricesQuery;
