import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { chain, useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import { calculateTradeVolumeForAllSynths } from 'queries/futures/utils';
import logError from 'utils/logError';

import { SYNTHS_ENDPOINT_OPTIMISM_MAIN } from './constants';
import { SynthsVolumes } from './type';
import { getSynthsEndpoint } from './utils';

const useGetSynthsTradingVolumeForAllMarkets = (
	yesterday: number,
	options?: UseQueryOptions<SynthsVolumes | null>
) => {
	const { chain: network } = useNetwork();
	const synthsEndpoint =
		window.location.pathname === ROUTES.Home.Root || network === undefined
			? SYNTHS_ENDPOINT_OPTIMISM_MAIN
			: getSynthsEndpoint(network?.id as NetworkId);

	return useQuery<SynthsVolumes | null>(
		QUERY_KEYS.Synths.TradingVolumeForAllSynths((network?.id ?? chain.optimism.id) as NetworkId),
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
				logError(e);
				return null;
			}
		}
	);
};

export default useGetSynthsTradingVolumeForAllMarkets;
