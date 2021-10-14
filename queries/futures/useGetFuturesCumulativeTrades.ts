import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import { calculateCumulativeTrades } from './utils';

const useGetFuturesTradingVolume = (options?: UseQueryOptions<number | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	return useQuery<number | null>(
		QUERY_KEYS.Futures.TotalTrades,
		async () => {
			try {
				const response = await request(
					FUTURES_ENDPOINT,
					gql`
						query FuturesTotalTrades($currencyKey: String!, $minTimestamp: BigInt!) {
							futuresTrades {
								totalTrades
							}
						}
					`
				);

				return response ? calculateCumulativeTrades(response.futuresTrades) : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2, ...options }
	);
};

export default useGetFuturesTradingVolume;
