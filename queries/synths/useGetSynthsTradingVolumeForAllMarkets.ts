import request, { gql } from 'graphql-request';
import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import ROUTES from 'constants/routes';
import Connector from 'containers/Connector';
import { chain } from 'containers/Connector/config';
import { calculateTradeVolumeForAllSynths } from 'queries/futures/utils';
import { MAIN_ENDPOINT_OP_MAINNET } from 'sdk/constants/futures';
import { NetworkId } from 'sdk/types/common';
import { getMainEndpoint } from 'sdk/utils/futures';
import logError from 'utils/logError';

import { SynthsVolumes } from './type';

const useGetSynthsTradingVolumeForAllMarkets = (yesterday: number) => {
	const { network } = Connector.useContainer();
	const synthsEndpoint =
		window.location.pathname === ROUTES.Home.Root || network === undefined
			? MAIN_ENDPOINT_OP_MAINNET
			: getMainEndpoint(network?.id as NetworkId);

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
					{ yesterday }
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
