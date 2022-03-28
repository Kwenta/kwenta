import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import Wei from '@synthetixio/wei';
import request, { gql } from 'graphql-request';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import { calculateTimestampForPeriod } from 'utils/formatters/date';
import { DAY_PERIOD } from './constants';
import { calculateTradeVolume } from './utils';

const useGetFuturesTradingVolume = (
	currencyKey: string | null,
	options?: UseQueryOptions<Wei | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	return useQuery<Wei | null>(
		QUERY_KEYS.Futures.TradingVolume(currencyKey || null),
		async () => {
			if (!currencyKey) return null;
			try {
				const minTimestamp = Math.floor(calculateTimestampForPeriod(DAY_PERIOD) / 1000);
				const response = await request(
					FUTURES_ENDPOINT,
					gql`
						query tradingVolume($currencyKey: String!, $minTimestamp: BigInt!) {
							futuresTrades(
								first: 1000
								where: { asset: $currencyKey, timestamp_gte: $minTimestamp }
								orderBy: timestamp
								orderDirection: desc
							) {
								size,
								price
							}
						}
					`,
					{ currencyKey: ethersUtils.formatBytes32String(currencyKey), minTimestamp: minTimestamp }
				);
				return response ? calculateTradeVolume(response.futuresTrades) : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!walletAddress && !!currencyKey, ...options }
	);
};

export default useGetFuturesTradingVolume;
