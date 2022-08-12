import { utils as ethersUtils } from 'ethers';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import { DEFAULT_NUMBER_OF_TRADES, MAX_TIMESTAMP } from 'constants/defaults';
import QUERY_KEYS from 'constants/queryKeys';
import { appReadyState } from 'store/app';
import { isL2State, isWalletConnectedState, networkState } from 'store/wallet';
import logError from 'utils/logError';

import { getFuturesTrades } from './subgraph';
import { FuturesTrade } from './types';
import { getFuturesEndpoint, mapTrades } from './utils';

const useGetFuturesTrades = (
	currencyKey: string | undefined,
	options?: UseInfiniteQueryOptions<FuturesTrade[] | null> & { forceAccount: boolean }
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);

	return useInfiniteQuery<FuturesTrade[] | null>(
		QUERY_KEYS.Futures.Trades(network.id, currencyKey || null),
		async ({ pageParam = { maxTs: Math.floor(Date.now() / 1000), minTs: 0 } }) => {
			if (!currencyKey) return null;

			try {
				const response = await getFuturesTrades(
					futuresEndpoint,
					{
						first: DEFAULT_NUMBER_OF_TRADES,
						where: {
							asset: `${ethersUtils.formatBytes32String(currencyKey)}`,
							timestamp_gt: pageParam.minTs,
							timestamp_lt: pageParam.maxTs,
						},
						orderDirection: 'desc',
						orderBy: 'timestamp',
					},
					{
						id: true,
						timestamp: true,
						account: true,
						abstractAccount: true,
						accountType: true,
						margin: true,
						size: true,
						asset: true,
						price: true,
						positionId: true,
						positionSize: true,
						positionClosed: true,
						pnl: true,
						feesPaid: true,
						orderType: true,
					}
				);
				return response ? mapTrades(response) : null;
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{
			...options,
			enabled: isWalletConnected ? isL2 && isAppReady : isAppReady,
			refetchInterval: 15000,
			getNextPageParam: (lastPage, _) => {
				return lastPage
					? {
							minTs: 0,
							maxTs: lastPage[lastPage.length - 1].timestamp.toNumber(),
					  }
					: null;
			},
			getPreviousPageParam: (firstPage, _) => {
				return firstPage
					? {
							minTs: firstPage[0].timestamp.toNumber(),
							maxTs: MAX_TIMESTAMP,
					  }
					: null;
			},
		}
	);
};

export default useGetFuturesTrades;
