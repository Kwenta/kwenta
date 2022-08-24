import { NetworkId } from '@synthetixio/contracts-interface';
import axios from 'axios';
import keyBy from 'lodash/keyBy';
import { useQuery, UseQueryOptions } from 'react-query';
import { chain, useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import use1InchApiUrl from 'hooks/use1InchApiUrl';

import { TokenListQueryResponse, OneInchTokenListResponse } from './types';

const useOneInchTokenList = (options?: UseQueryOptions<TokenListQueryResponse>) => {
	const oneInchApiUrl = use1InchApiUrl();
	const { chain: network } = useNetwork();
	const isL2 =
		network !== undefined
			? [chain.optimism.id, chain.optimismGoerli.id].includes(network?.id)
			: false;

	return useQuery<TokenListQueryResponse>(
		QUERY_KEYS.TokenLists.OneInch(network?.id as NetworkId),
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
