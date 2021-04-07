import { useQuery, QueryConfig } from 'react-query';
import axios from 'axios';
import keyBy from 'lodash/keyBy';

import QUERY_KEYS from 'constants/queryKeys';

import { TokenListQueryResponse, TokenListResponse } from './types';

const useSynthetixTokenList = (options?: QueryConfig<TokenListQueryResponse>) => {
	return useQuery<TokenListQueryResponse>(
		QUERY_KEYS.TokenLists.Synthetix,
		async () => {
			const response = await axios.get<TokenListResponse>('https://synths.snx.eth.link');

			return {
				tokens: response.data.tokens,
				tokensMap: keyBy(response.data.tokens, 'symbol'),
				symbols: response.data.tokens.map((token) => token.symbol),
			};
		},
		{
			refetchInterval: false,
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			...options,
		}
	);
};

export default useSynthetixTokenList;
