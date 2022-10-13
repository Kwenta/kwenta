import axios from 'axios';
import { UseQueryOptions, useQuery } from 'react-query';

import { ETH_ADDRESS, ETH_COINGECKO_ADDRESS } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import useIsL2 from 'hooks/useIsL2';

import { CG_BASE_API_URL } from './constants';
import { PriceResponse } from './types';

const useCoinGeckoTokenPricesQuery = (
	tokenAddresses: string[],
	options?: UseQueryOptions<PriceResponse>
) => {
	const isL2 = useIsL2();

	const platform = isL2 ? 'optimistic-ethereum' : 'ethereum';
	return useQuery<PriceResponse>(
		QUERY_KEYS.CoinGecko.TokenPrices(tokenAddresses, platform),
		async () => {
			const response = await axios.get<PriceResponse>(
				`${CG_BASE_API_URL}/simple/token_price/${platform}?contract_addresses=${tokenAddresses
					.join(',')
					.replace(ETH_ADDRESS, ETH_COINGECKO_ADDRESS)}&vs_currencies=usd`
			);
			return response.data;
		},
		{
			enabled: tokenAddresses.length > 0,
			...options,
		}
	);
};

export default useCoinGeckoTokenPricesQuery;
