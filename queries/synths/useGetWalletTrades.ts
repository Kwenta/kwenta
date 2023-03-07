import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { NetworkId } from 'sdk/types/common';
import { getMainEndpoint } from 'sdk/utils/futures';
import logError from 'utils/logError';

import { SynthsVolumes } from './type';

const useGetWalletTrades = (
	walletAddress: string,
	options?: UseQueryOptions<SynthsVolumes | null>
) => {
	const { network } = Connector.useContainer();
	const synthsEndpoint = getMainEndpoint(network?.id as NetworkId);

	return useQuery<any>(
		QUERY_KEYS.Trades.WalletTrades(walletAddress, network?.id as NetworkId),
		async () => {
			try {
				const response = await request(
					synthsEndpoint,
					gql`
						query WalletTrades($walletAddress: String!) {
							synthExchanges(
								where: { account: $walletAddress }
								first: 1000
								orderBy: "timestamp"
								orderDirection: "desc"
							) {
								id
								fromAmount
								fromAmountInUSD
								fromSynth {
									name
									symbol
									id
								}
								toSynth {
									name
									symbol
									id
								}
								toAmount
								toAmountInUSD
								feesInUSD
								toAddress
								timestamp
								gasPrice
							}
						}
					`,
					{ walletAddress: walletAddress.toLowerCase() }
				);

				return response;
			} catch (e) {
				logError(e);
				return null;
			}
		},
		{ enabled: !!walletAddress, ...options }
	);
};

export default useGetWalletTrades;
