import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import Wei from '@synthetixio/wei';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import { DAY_PERIOD } from './constants';
import { calculateTradeVolumeForAll } from './utils';
import { FuturesVolumes } from './types';

const useGetFuturesTradingVolumeForAllMarkets = (
	options?: UseQueryOptions<FuturesVolumes | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	return useQuery<FuturesVolumes | null>(
		QUERY_KEYS.Futures.TradingVolumeForAll,
		async () => {
			try {
				const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
				const response = await request(
					FUTURES_ENDPOINT,
					gql`
						query tradingVolume($minTimestamp: BigInt!) {
							futuresTrades(
								where: { timestamp_gte: $minTimestamp }
								orderBy: timestamp
								orderDirection: desc
							) {
								asset
								size
								price
							}
						}
					`,
					{ minTimestamp }
				);
				return response ? calculateTradeVolumeForAll(response.futuresTrades) : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!walletAddress, ...options }
	);
};

export default useGetFuturesTradingVolumeForAllMarkets;
