import { useQuery } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import { calculateAverageTradeSize } from './utils';

const useGetFuturesAverageTradeSize = () => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);

	return useQuery<string | null>(
		QUERY_KEYS.Futures.AverageLeverage,
		async () => {
			try {
				const response = await request(
					FUTURES_ENDPOINT,
					gql`
						query FuturesAverageTradeSize {
							futuresTrades {
								size
								price
							}
						}
					`
				);

				return response.futuresTrades ? calculateAverageTradeSize(response.futuresTrades) : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2,
		}
	);
};

export default useGetFuturesAverageTradeSize;
