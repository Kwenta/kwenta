import { useQuery, UseQueryOptions } from 'react-query';
import axios from 'axios';
import keyBy from 'lodash/keyBy';
import { NetworkId } from '@synthetixio/contracts-interface';

import QUERY_KEYS from 'constants/queryKeys';
import { CRYPTO_CURRENCY_MAP, ETH_ADDRESS } from 'constants/currency';

import ETHIcon from 'assets/svg/currencies/crypto/ETH.svg';

import { TokenListQueryResponse, ZapperTokenListResponse } from './types';
import { EXTERNAL_LINKS } from 'constants/links';

const ether = {
	address: ETH_ADDRESS,
	chainId: 1 as NetworkId,
	decimals: 18,
	logoURI: ETHIcon.src,
	name: 'Ethereum',
	symbol: CRYPTO_CURRENCY_MAP.ETH,
	tags: [],
};

const useZapperTokenList = (options?: UseQueryOptions<TokenListQueryResponse>) => {
	return useQuery<TokenListQueryResponse>(
		QUERY_KEYS.TokenLists.Zapper,
		async () => {
			const response = await axios.get<ZapperTokenListResponse>(EXTERNAL_LINKS.TokenLists.Zapper);

			const tokens = [ether, ...response.data.tokens];

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

export default useZapperTokenList;
