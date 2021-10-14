import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import { calculateTotalLiquidations } from './utils';

const useGetFuturesTotalLiquidations = (options?: UseQueryOptions<number | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	return useQuery<number | null>(
		QUERY_KEYS.Futures.TotalLiquidations,
		async () => {
			try {
				const response = await request(
					FUTURES_ENDPOINT,
					gql`
						query FuturesTotalLiquidations {
							futuresStats {
								liquidations
							}
						}
					`
				);

				return response ? calculateTotalLiquidations(response.futuresStats) : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2, ...options }
	);
};

export default useGetFuturesTotalLiquidations;
