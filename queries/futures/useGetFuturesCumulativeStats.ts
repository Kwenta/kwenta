import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FuturesCumulativeStats } from './types';
import { getFuturesEndpoint } from './utils';
import { wei } from '@synthetixio/wei';
import { FUTURES_ENDPOINT_MAINNET } from './constants';

const useGetFuturesCumulativeStats = (
	homepage?: boolean,
	options?: UseQueryOptions<FuturesCumulativeStats | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = homepage ? FUTURES_ENDPOINT_MAINNET : getFuturesEndpoint(network);

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
				console.log(e);
				return null;
			}
		},
		{ enabled: homepage ? isAppReady : isAppReady && isL2, ...options }
	);
};

export default useGetFuturesCumulativeStats;
