import { NetworkId } from '@synthetixio/contracts-interface';
import { wei } from '@synthetixio/wei';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import logError from 'utils/logError';

import { FUTURES_ENDPOINT_OP_MAINNET } from './constants';
import { FuturesCumulativeStats } from './types';
import { getFuturesEndpoint } from './utils';

const useGetFuturesCumulativeStats = (options?: UseQueryOptions<FuturesCumulativeStats | null>) => {
	const { network } = Connector.useContainer();
	const isL2 = useIsL2();
	const homepage = window.location.pathname === ROUTES.Home.Root;
	const futuresEndpoint = homepage
		? FUTURES_ENDPOINT_OP_MAINNET
		: getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<FuturesCumulativeStats | null>(
		QUERY_KEYS.Futures.TotalTrades(network?.id as NetworkId),
		async () => {
			try {
				const response = await request(
					futuresEndpoint,
					gql`
						query FuturesCumulativeStats {
							futuresCumulativeStat(id: "0") {
								totalTrades
								totalTraders
								totalVolume
								totalLiquidations
								averageTradeSize
							}
						}
					`
				);

				return response
					? {
							totalVolume: wei(response.futuresCumulativeStat.totalVolume, 18, true).toString(),
							averageTradeSize: wei(
								response.futuresCumulativeStat.averageTradeSize,
								18,
								true
							).toString(),
							totalTraders: response.futuresCumulativeStat.totalTraders,
							totalTrades: response.futuresCumulativeStat.totalTrades,
							totalLiquidations: response.futuresCumulativeStat.totalLiquidations,
					  }
					: null;
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{ enabled: homepage || isL2, ...options }
	);
};

export default useGetFuturesCumulativeStats;
