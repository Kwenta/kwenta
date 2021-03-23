import { useQuery, QueryConfig } from 'react-query';
import axios from 'axios';
import keyBy from 'lodash/keyBy';

import QUERY_KEYS from 'constants/queryKeys';
import { CurrencyKey } from 'constants/currency';

import { Token, TokenListResponse } from './types';

const useSynthetixTokenList = (options?: QueryConfig<Record<CurrencyKey, Token>>) => {
	return useQuery<Record<CurrencyKey, Token>>(
		QUERY_KEYS.TokenLists.Synthetix,
		async () => {
			const response = await axios.get<TokenListResponse>('https://synths.snx.eth.link');

			return keyBy(response.data.tokens, 'symbol');
		},
		{
			refetchInterval: false,
			refetchOnWindowFocus: false,
			...options,
		}
	);
};

export default useSynthetixTokenList;
