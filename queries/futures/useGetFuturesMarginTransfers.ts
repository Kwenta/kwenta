import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';
import { getDisplayAsset } from 'utils/futures';

import { MarginTransfer } from './types';
import { getFuturesEndpoint, mapMarginTransfers } from './utils';

const useGetFuturesMarginTransfers = (
	currencyKey: string | null,
	options?: UseQueryOptions<MarginTransfer[]>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const futuresEndpoint = getFuturesEndpoint(network);
	const { synthetixjs } = Connector.useContainer();

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
		QUERY_KEYS.Futures.MarginTransfers(network.id, walletAddress ?? '', currencyKey || null),
		async () => {
			if (!currencyKey || !synthetixjs) return [];
			const { contracts } = synthetixjs!;
			const marketAddress = contracts[`FuturesMarket${getDisplayAsset(currencyKey)}`].address;
			if (!marketAddress) return [];

			try {
				const response = await request(futuresEndpoint, gqlQuery, {
					market: marketAddress,
					walletAddress: walletAddress ?? '',
				});

				return response ? mapMarginTransfers(response.futuresMarginTransfers) : [];
			} catch (e) {
				console.log(e);
				return [];
			}
		},
		{
			enabled: isAppReady && isL2 && !!currencyKey && !!synthetixjs && !!walletAddress,
			...options,
		}
	);
};

export default useGetFuturesMarginTransfers;
