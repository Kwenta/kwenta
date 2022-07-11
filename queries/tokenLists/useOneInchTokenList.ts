import { useQuery, UseQueryOptions } from 'react-query';
import axios from 'axios';
import keyBy from 'lodash/keyBy';
import { useRecoilValue } from 'recoil';
import { NetworkId } from '@synthetixio/contracts-interface';

import QUERY_KEYS from 'constants/queryKeys';
import { TokenListQueryResponse, OneInchTokenListResponse } from './types';
import { isL2State, networkState } from 'store/wallet';
import use1InchApiUrl from 'hooks/use1InchApiUrl';

const useOneInchTokenList = (options?: UseQueryOptions<TokenListQueryResponse>) => {
	const isL2 = useRecoilValue(isL2State);
	const oneInchApiUrl = use1InchApiUrl();
	const network = useRecoilValue(networkState);

	return useQuery<TokenListQueryResponse>(
		QUERY_KEYS.TokenLists.OneInch(network.id),
		async () => {
			const response = await axios.get<OneInchTokenListResponse>(oneInchApiUrl + 'tokens');

			const tokensMap = response.data.tokens || {};
			const chainId: NetworkId = isL2 ? 10 : 1;
			const tokens = Object.values(tokensMap).map((t) => ({ ...t, chainId, tags: [] }));

			return {
				tokens,
				tokensMap: keyBy(tokens, 'symbol'),
				symbols: tokens.map((token) => token.symbol),
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

export default useOneInchTokenList;
