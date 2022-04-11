import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import Wei from '@synthetixio/wei';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { getFuturesEndpoint } from './utils';
import { getFuturesTrades } from './subgraph';

const useGetFuturesPastTrades = (
	currencyKey: string | null,
	options?: UseQueryOptions<Wei | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);

	return useQuery<any | null>(
		QUERY_KEYS.Futures.PastTrades(network.id, currencyKey || null),
		async () => {
			if (!currencyKey) return null;
			try {
				const response = await getFuturesTrades(
					futuresEndpoint,
					{
						first: 50,
						where: {
							asset: `${ethersUtils.formatBytes32String(currencyKey)}`,
						},
						orderBy: 'timestamp',
						orderDirection: 'desc',
					},
					{
						size: true,
						price: true,
						id: true,
						timestamp: true,
						asset: true,
					}
				);
				return response ?? null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!currencyKey, ...options }
	);
};

export default useGetFuturesPastTrades;
