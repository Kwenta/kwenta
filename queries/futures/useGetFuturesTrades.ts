import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { getFuturesEndpoint, mapTrades } from './utils';
import { FuturesTrade } from './types';
import { getFuturesTrades } from './subgraph';
import { DEFAULT_NUMBER_OF_TRADES } from 'constants/defaults';

const useGetFuturesTrades = (
	currencyKey: string | undefined,
	options?: UseQueryOptions<FuturesTrade[] | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);

	return useQuery<FuturesTrade[] | null>(
		QUERY_KEYS.Futures.Trades(network.id, currencyKey || null),
		async () => {
			if (!currencyKey) return null;
			try {
				const response = await getFuturesTrades(
					futuresEndpoint,
					{
						first: DEFAULT_NUMBER_OF_TRADES,
						where: {
							asset: `${ethersUtils.formatBytes32String(currencyKey)}`,
						},
						orderDirection: 'desc',
						orderBy: 'timestamp',
					},
					{
						size: true,
						price: true,
						id: true,
						timestamp: true,
						account: true,
						asset: true,
					}
				);
				return response ? mapTrades(response) : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!walletAddress, ...options }
	);
};

export default useGetFuturesTrades;
