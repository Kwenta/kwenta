import { wei } from '@synthetixio/wei';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import { isL2State, networkState } from 'store/wallet';
import logError from 'utils/logError';

import { FUTURES_ENDPOINT_MAINNET } from './constants';
import { FuturesCumulativeStats } from './types';
import { getFuturesEndpoint } from './utils';

const useGetFuturesCumulativeStats = (options?: UseQueryOptions<FuturesCumulativeStats | null>) => {
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const homepage = window.location.pathname === ROUTES.Home.Root;
	const futuresEndpoint = homepage ? FUTURES_ENDPOINT_MAINNET : getFuturesEndpoint(network?.id);

	return useQuery<FuturesCumulativeStats | null>(
		QUERY_KEYS.Futures.TotalTrades(network.id),
		async () => {
			try {
				const response = await request(
					futuresEndpoint,
					gql`
						query FuturesCumulativeStats {
							futuresCumulativeStat(id: "0") {
								totalTrades
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
