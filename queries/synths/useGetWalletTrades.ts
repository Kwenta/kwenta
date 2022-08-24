import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import logError from 'utils/logError';

import { SynthsVolumes } from './type';
import { getSynthsEndpoint } from './utils';

const useGetWalletTrades = (
	walletAddress: string,
	options?: UseQueryOptions<SynthsVolumes | null>
) => {
	const { chain: network } = useNetwork();
	const synthsEndpoint = getSynthsEndpoint(network?.id as NetworkId);

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
