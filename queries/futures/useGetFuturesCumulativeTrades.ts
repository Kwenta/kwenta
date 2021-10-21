import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import { calculateCumulativeTrades } from './utils';

const PAGE_SIZE = 500;

const useGetFuturesCumulativeTrades = (options?: UseQueryOptions<number | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	return useQuery<number | null>(
		QUERY_KEYS.Futures.TotalTrades,
		async () => {
			try {
				const response = await request(
					FUTURES_ENDPOINT,
					gql`
						query FuturesTotalTrades(page: ${PAGE_SIZE}) {
							futuresStats(first: ${PAGE_SIZE}) {
								totalTrades
							}
						}
					`
				);

				return response ? calculateCumulativeTrades(response.futuresStats) : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2, ...options }
	);
};

export default useGetFuturesCumulativeTrades;
