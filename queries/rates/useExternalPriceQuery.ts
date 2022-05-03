import axios from 'axios';
import { UseQueryOptions, useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';

import { CG_BASE_API_URL } from './constants';
import { PriceResponse } from './types';
import { getMarketKey } from 'utils/futures';
import { synthToCoingeckoPriceId } from './utils';
import { useRecoilValue } from 'recoil';
import { networkState } from 'store/wallet';

const useExternalPriceQuery = (
	baseCurrencyKey: string,
	options?: UseQueryOptions<number | null>
) => {
	const network = useRecoilValue(networkState);

	const marketKey = getMarketKey(baseCurrencyKey, network.id);
	const priceId = synthToCoingeckoPriceId(marketKey);

	return useQuery<number | null>(
		QUERY_KEYS.CoinGecko.Price(priceId),
		async () => {
			const response = await axios.get<PriceResponse>(
				`${CG_BASE_API_URL}/simple/price?ids=${priceId}&vs_currencies=usd`
			);

			return response.status === 200 ? response.data[priceId].usd : null;
		},
		{
			enabled: !!priceId,
			...options,
		}
	);
};

export default useExternalPriceQuery;
