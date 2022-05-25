import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import request, { gql } from 'graphql-request';

import { appReadyState } from 'store/app';
import { networkState, walletAddressState } from 'store/wallet';

import QUERY_KEYS from 'constants/queryKeys';
import { getRatesEndpoint, mapLaggedDailyPrices } from './utils';

const useLaggedDailyPrice = (synths: string[], options?: UseQueryOptions<any | null>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);

	const minTimestamp = Math.floor(Date.now() / 1000) - 60 * 60 * 24;
	const maxTimestamp = minTimestamp + 60 * 60;

	const ratesEndpoint = getRatesEndpoint(network.id);

	return useQuery<any | null>(
		QUERY_KEYS.Futures.AllPositionHistory(network.id, walletAddress || ''),
		async () => {
			try {
				const response = await request(
					ratesEndpoint,
					gql`
						query candles($synths: [String!]!, $minTimestamp: BigInt!, $maxTimestamp: BigInt!) {
							candles(
								where: {
									period: "3600"
									synth_in: $synths
									timestamp_gt: $minTimestamp
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
		{ enabled: isAppReady && synths.length > 0, refetchInterval: 60000, ...options }
	);
};

export default useLaggedDailyPrice;
