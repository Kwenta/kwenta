import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import { FuturesCumulativeStats } from './types';
import { wei } from '@synthetixio/wei';

const useGetFuturesCumulativeStats = (options?: UseQueryOptions<FuturesCumulativeStats | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<FuturesCumulativeStats | null>(
		QUERY_KEYS.Futures.TotalTrades,
		async () => {
			try {
				const response = await request(
					FUTURES_ENDPOINT,
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
		{ enabled: isAppReady && isL2, ...options }
	);
};

export default useGetFuturesCumulativeStats;
