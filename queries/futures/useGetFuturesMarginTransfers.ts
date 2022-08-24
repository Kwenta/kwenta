import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { chain, useNetwork } from 'wagmi';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { futuresAccountState } from 'store/futures';
import { getDisplayAsset } from 'utils/futures';
import logError from 'utils/logError';

import { MarginTransfer } from './types';
import { getFuturesEndpoint, mapMarginTransfers } from './utils';

const useGetFuturesMarginTransfers = (
	currencyKey: string | null,
	options?: UseQueryOptions<MarginTransfer[]>
) => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);

	const { chain: network } = useNetwork();
	const isL2 =
		network !== undefined
			? [chain.optimism.id, chain.optimismGoerli.id].includes(network?.id)
			: false;
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);
	const { defaultSynthetixjs: synthetixjs } = Connector.useContainer();

	const gqlQuery = gql`
		query userFuturesMarginTransfers($market: String!, $walletAddress: String!) {
			futuresMarginTransfers(
				where: { account: $walletAddress, market: $market }
				orderBy: timestamp
				orderDirection: desc
				first: 1000
			) {
				id
				timestamp
				account
				market
				size
				asset
				txHash
			}
		}
	`;

	return useQuery<MarginTransfer[]>(
		QUERY_KEYS.Futures.MarginTransfers(
			network?.id as NetworkId,
			selectedFuturesAddress ?? '',
			currencyKey || null
		),
		async () => {
			if (!currencyKey || !synthetixjs) return [];
			const { contracts } = synthetixjs!;
			const marketAddress = contracts[`FuturesMarket${getDisplayAsset(currencyKey)}`].address;
			if (!marketAddress) return [];

			try {
				const response = await request(futuresEndpoint, gqlQuery, {
					market: marketAddress,
					walletAddress: selectedFuturesAddress ?? '',
				});

				return response ? mapMarginTransfers(response.futuresMarginTransfers) : [];
			} catch (e) {
				logError(e);
				return [];
			}
		},
		{
			enabled: isL2 && !!currencyKey && !!synthetixjs && !!selectedFuturesAddress,
			...options,
		}
	);
};

export default useGetFuturesMarginTransfers;
