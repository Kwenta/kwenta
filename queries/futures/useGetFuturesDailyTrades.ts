import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, networkState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { DAY_PERIOD } from './constants';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import { getFuturesEndpoint } from './utils';

const useGetFuturesDailyTradeStatsForMarket = (
	currencyKey: string | null,
	options?: UseQueryOptions<number | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const futuresEndpoint = getFuturesEndpoint(network);

	return useQuery<number | null>(
		QUERY_KEYS.Futures.DayTradeStats(network.id, currencyKey),
		async () => {
			if (!currencyKey) return null;

			try {
				const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
				const response = await request(
					futuresEndpoint,
					gql`
					query FuturesTradesDailyCount($currencyKey: String!) {
						futuresTrades(
							where: { asset: $currencyKey, timestamp_gte: ${minTimestamp} }
							first: 1000
						) {
							id
						}
					}
				`,
					{ currencyKey: ethersUtils.formatBytes32String(currencyKey) }
				);

				return response ? response.futuresTrades.length : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!currencyKey, ...options }
	);
};

export default useGetFuturesDailyTradeStatsForMarket;
