import { useQuery, UseQueryOptions } from 'react-query';
import axios from 'axios';
import keyBy from 'lodash/keyBy';
import { TokenListResponse } from '@synthetixio/queries';

import { TokenListQueryResponse } from './types';
import { EXTERNAL_LINKS } from 'constants/links';
import QUERY_KEYS from 'constants/queryKeys';

const useSynthetixTokenList = (options?: UseQueryOptions<TokenListQueryResponse>) => {
	return useQuery<TokenListQueryResponse>(
		QUERY_KEYS.TokenLists.Synthetix,
		async () => {
			const response = await axios.get<TokenListResponse>(EXTERNAL_LINKS.TokenLists.Synthetix);

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
