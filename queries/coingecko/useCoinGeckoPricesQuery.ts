import axios from 'axios';
import { QueryConfig, useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import { CG_BASE_API_URL } from './constants';

type PriceResponse = Record<string, { usd: number }>;

const useCoinGeckoPricesQuery = (
	tokenAddresses: string[],
	options?: QueryConfig<PriceResponse>
) => {
	return useQuery<PriceResponse>(
		QUERY_KEYS.CoinGecko.TokenPrices(tokenAddresses),
		async () => {
			const response = await axios.get<PriceResponse>(
				`${CG_BASE_API_URL}/simple/token_price/ethereum?contract_addresses=${tokenAddresses.join(
					','
				)}&vs_currencies=usd`
			);

			return response.data;
		},
		{
			enabled: tokenAddresses.length,
			...options,
		}
	);
};

export default useCoinGeckoPricesQuery;
