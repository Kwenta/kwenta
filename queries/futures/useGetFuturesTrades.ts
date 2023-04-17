import { utils as ethersUtils } from 'ethers';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';

import { DEFAULT_NUMBER_OF_TRADES, MAX_TIMESTAMP } from 'constants/defaults';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { notNill } from 'queries/synths/utils';
import { NetworkId } from 'sdk/types/common';
import { FuturesTrade } from 'sdk/types/futures';
import { getFuturesEndpoint, mapTrades } from 'sdk/utils/futures';
import logError from 'utils/logError';

import { getFuturesTrades } from './subgraph';

const useGetFuturesTrades = (
	currencyKey: string | undefined,
	options?: UseInfiniteQueryOptions<FuturesTrade[] | null> & { forceAccount: boolean }
) => {
	const { network } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useInfiniteQuery<FuturesTrade[] | null>(
		QUERY_KEYS.Futures.Trades(network?.id as NetworkId, currencyKey || null),
		async ({ pageParam = { maxTs: Math.floor(Date.now() / 1000), minTs: 0 } }) => {
			if (!currencyKey) return null;

			try {
				const response = await getFuturesTrades(
					futuresEndpoint,
					{
						first: DEFAULT_NUMBER_OF_TRADES,
						where: {
							marketKey: `${ethersUtils.formatBytes32String(currencyKey as string)}`,
							timestamp_gt: pageParam?.minTs ?? 0,
							timestamp_lt: pageParam?.maxTs ?? Math.floor(Date.now() / 1000),
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
						marketKey: true,
						price: true,
						positionId: true,
						positionSize: true,
						positionClosed: true,
						pnl: true,
						feesPaid: true,
						keeperFeesPaid: true,
						orderType: true,
						fundingAccrued: true,
						trackingCode: true,
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
			refetchInterval: 15000,
			getNextPageParam: (lastPage) => {
				return notNill(lastPage) && lastPage?.length > 0
					? {
							minTs: 0,
							maxTs: lastPage[lastPage.length - 1].timestamp,
					  }
					: null;
			},
			getPreviousPageParam: (firstPage) => {
				return notNill(firstPage) && firstPage?.length > 0
					? {
							minTs: firstPage[0].timestamp,
							maxTs: MAX_TIMESTAMP,
					  }
					: null;
			},
		}
	);
};

export default useGetFuturesTrades;
