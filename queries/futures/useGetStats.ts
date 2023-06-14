import { useQuery, UseQueryOptions } from 'react-query';

import { ETH_UNIT } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { FUTURES_ENDPOINT_OP_MAINNET } from 'sdk/constants/futures';
import { NetworkId } from 'sdk/types/common';
import { getFuturesEndpoint } from 'sdk/utils/futures';
import { truncateAddress } from 'sdk/utils/string';
import logError from 'utils/logError';

import { getFuturesStats } from '../../sdk/utils/subgraph';

import { AccountStat } from './types';

const useGetStats = (homepage?: boolean, options?: UseQueryOptions<any>) => {
	const { network } = Connector.useContainer();
	const isL2 = useIsL2();
	const futuresEndpoint = homepage
		? FUTURES_ENDPOINT_OP_MAINNET
		: getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<AccountStat[]>(
		QUERY_KEYS.Futures.Stats(network?.id as NetworkId),
		async () => {
			try {
				const response = await getFuturesStats(
					futuresEndpoint,
					{
						first: 10,
						orderBy: 'pnlWithFeesPaid',
						orderDirection: 'desc',
					},
					{
						account: true,
						pnl: true,
						pnlWithFeesPaid: true,
						liquidations: true,
						totalTrades: true,
						totalVolume: true,
					}
				);

				const stats = response.map((stat, i) => ({
					...stat,
					trader: stat.account,
					traderShort: truncateAddress(stat.account),
					pnl: stat.pnlWithFeesPaid.div(ETH_UNIT),
					totalVolume: stat.totalVolume.div(ETH_UNIT),
					totalTrades: stat.totalTrades.toNumber(),
					liquidations: stat.liquidations.toNumber(),
					rank: i + 1,
					rankText: (i + 1).toString(),
				}));

				return stats as AccountStat[];
			} catch (e) {
				logError(e);
				return [];
			}
		},
		{
			enabled: homepage || isL2,
			...options,
		}
	);
};

export default useGetStats;
