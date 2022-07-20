import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import { calculateTradeVolumeForAllSynths } from 'queries/futures/utils';
import { appReadyState } from 'store/app';
import { networkState } from 'store/wallet';

import { SYNTHS_ENDPOINT_OPTIMISM_MAIN } from './constants';
import { SynthsVolumes } from './type';
import { getSynthsEndpoint } from './utils';

const useGetSynthsTradingVolumeForAllMarkets = (
	yesterday: number,
	options?: UseQueryOptions<SynthsVolumes | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const network = useRecoilValue(networkState);
	const synthsEndpoint =
		window.location.pathname === ROUTES.Home.Root
			? SYNTHS_ENDPOINT_OPTIMISM_MAIN
			: getSynthsEndpoint(network);

	return useQuery<SynthsVolumes | null>(
		QUERY_KEYS.Synths.TradingVolumeForAllSynths(network.id),
		async () => {
			try {
				const response = await request(
					synthsEndpoint,
					gql`
						query TradingVolumeForAllSynths($yesterday: BigInt!) {
							synthExchanges(where: { timestamp_gte: $yesterday }, first: 1000) {
								id
								fromSynth {
									symbol
								}
								fromAmountInUSD
								fromAmount
								toAmount
								toAmountInUSD
								feesInUSD
								timestamp
								gasPrice
							}
						}
					`,
					{ yesterday: yesterday }
				);
				return response ? calculateTradeVolumeForAllSynths(response) : null;
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{ enabled: isAppReady, ...options }
	);
};

export default useGetSynthsTradingVolumeForAllMarkets;
