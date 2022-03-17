import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import { DAY_PERIOD } from './constants';
import { calculateTimestampForPeriod } from 'utils/formatters/date';

const useGetFuturesDailyTradeStatsForMarket = (
	currencyKey: string | null,
	options?: UseQueryOptions<number | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);

	return useQuery<number | null>(
		QUERY_KEYS.Futures.DayTradeStats,
		async () => {
			if (!currencyKey) return null;

			try {
				const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
				const response = await request(
					FUTURES_ENDPOINT,
					gql`
					query FuturesTradesDailyCount($currencyKey: String!) {
						futuresTrades(
							where: { asset: $currencyKey, timestamp_gte: ${minTimestamp} }
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
		{ enabled: isAppReady && isL2 && !!walletAddress && !!currencyKey, ...options }
	);
};

export default useGetFuturesDailyTradeStatsForMarket;
