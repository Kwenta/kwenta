import QUERY_KEYS from 'constants/queryKeys';
import { utils as ethersUtils } from 'ethers';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { isL2State, networkState, walletAddressState } from 'store/wallet';

import { getFuturesMarginTransfers } from './subgraph';
import { MarginTransfer } from './types';
import { getFuturesEndpoint, mapMarginTransfers } from './utils';

const useGetFuturesMarginTransfers = (
	currencyKey: string | null,
	options?: UseQueryOptions<number | null>
) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isL2 = useRecoilValue(isL2State);
	const network = useRecoilValue(networkState);
	const walletAddress = useRecoilValue(walletAddressState);
	const futuresEndpoint = getFuturesEndpoint(network);

	const gqlQuery = gql`
		query userFuturesMarginTransfers($currencyKey: String!, $walletAddress: String!) {
			futuresMarginTransfers(
				where: { account: "0xb0cffE0260BF4eA7b59915fBEa17273a8B9209F6" }
				orderBy: timestamp
				orderDirection: desc
				first: 1000
			) {
				id
				timestamp
				account
				market
				size
			}
		}
	`;

	return useQuery<MarginTransfer[] | null>(
		QUERY_KEYS.Futures.MarginTransfers(network.id, currencyKey || null),
		async () => {
			if (!currencyKey) return null;
			try {
				const response = await request(futuresEndpoint, gqlQuery, {
					currencyKey: ethersUtils.formatBytes32String(currencyKey),
					walletAddress,
				});

				return response ? mapMarginTransfers(response.futuresMarginTransfers) : [];
			} catch (e) {
				console.log(e);
				return null;
			}
		},
		{
			enabled: isAppReady && isL2 && !!currencyKey && !!walletAddress,
			...options,
		}
	);
};

export default useGetFuturesMarginTransfers;
