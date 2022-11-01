import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { RATES_ENDPOINT_OP_MAINNET } from 'queries/rates/constants';
import logError from 'utils/logError';

const useGetSpotFeeForAccount = (
	walletAddress: string,
	options?: UseQueryOptions<Number | null>
) => {
	return useQuery<any>(
		QUERY_KEYS.Staking.SpotsFee(walletAddress),
		async () => {
			try {
				const response = await request(
					RATES_ENDPOINT_OP_MAINNET,
					gql`
						query WalletTrades($walletAddress: String!) {
							synthExchanges(
								where: { toAddress: $walletAddress }
								first: 1000
								orderBy: "timestamp"
								orderDirection: "desc"
							) {
								feesInUSD
								toAddress
								timestamp
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

export default useGetSpotFeeForAccount;
