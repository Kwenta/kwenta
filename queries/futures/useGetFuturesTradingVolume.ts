import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';
import request, { gql } from 'graphql-request';
import { utils as ethersUtils } from 'ethers';

import { appReadyState } from 'store/app';
import { isL2State, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { FUTURES_ENDPOINT } from './constants';
import { calculateTimestampForPeriod } from 'queries/rates/utils';

const PERIOD = 24 * 3600;

const useGetFuturesTradingVolume = (currencyKey: string | null, options?: UseQueryOptions<Wei>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const walletAddress = useRecoilValue(walletAddressState);
	return useQuery<Wei>(
		QUERY_KEYS.Futures.TradingVolume(currencyKey || null),
		async () => {
			if (!currencyKey) return null;
			try {
				const minTimestamp = calculateTimestampForPeriod(PERIOD);
				const response = await request(
					FUTURES_ENDPOINT,
					gql`
						query tradingVolume($currencyKey: String!, $minTimestamp: BigInt!) {
							futuresTrades(
								where: { asset: $currencyKey, timestamp_gte: $minTimestamp }
								orderBy: timestamp
								orderDirection: desc
							) {
								size
							}
						}
					`,
					{ currencyKey: ethersUtils.formatBytes32String(currencyKey), minTimestamp }
				);
				return (
					response?.futuresTrades?.reduce(
						(acc: Wei, { size }: { size: string }) => acc.add(new Wei(size, 18, true).abs()),
						wei(0)
					) ?? null
				);
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!walletAddress && !!currencyKey, ...options }
	);
};

export default useGetFuturesTradingVolume;
