import axios from 'axios';
import keyBy from 'lodash/keyBy';
import { UseQueryOptions, useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import { CG_BASE_API_URL } from './constants';

type CoinListItem = {
	id: string;
	symbol: string;
	name: string;
};

type CoinListMap = Record<string, CoinListItem>;

const useCoinGeckoCoinListQuery = (options?: UseQueryOptions<CoinListMap>) => {
	return useQuery<CoinListMap>(
		QUERY_KEYS.CoinGecko.CoinList,
		async () => {
			const response = await axios.get<CoinListItem[]>(`${CG_BASE_API_URL}/coins/list`);

			return keyBy(response.data, (item) => item.symbol.toLowerCase());
		},
		{
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			...options,
		}
	);
};

export default useCoinGeckoCoinListQuery;
