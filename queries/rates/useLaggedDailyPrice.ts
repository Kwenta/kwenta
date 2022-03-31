import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { CANDLES_ENDPOINT } from './constants';
import { mapLaggedDailyPrices } from './utils';

const useLaggedDailyPrice = (synths: string[], options?: UseQueryOptions<any | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);

	const minTimestamp = Math.floor(Date.now() / 1000) - 60*60*24;
	const maxTimestamp = minTimestamp + 60*60;

	return useQuery(
		QUERY_KEYS.Futures.AllPositionHistory(network.id, walletAddress || ''),
		async () => {
			try {
				const response = await request(
					CANDLES_ENDPOINT,
					gql`
						query candles($synths: [String!]!, $minTimestamp: BigInt!, $maxTimestamp: BigInt!) {
							candles(
								where: {
									period: "3600",
									synth_in: $synths,
									timestamp_gt: $minTimestamp,
									timestamp_lt: $maxTimestamp
								}
							) {
								id
								synth
								open
								high
								low
								average
								close
								timestamp
							}
						}
					`,
					{
						synths: synths,
						maxTimestamp: maxTimestamp,
						minTimestamp: minTimestamp,
					}
				);
				return response ? mapLaggedDailyPrices(response.candles) : [];
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady && isL2 && !!walletAddress && synths.length > 0, ...options }
	);
};

export default useLaggedDailyPrice;
