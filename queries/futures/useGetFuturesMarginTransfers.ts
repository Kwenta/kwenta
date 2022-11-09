import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilValue } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { futuresAccountTypeState, selectedFuturesAddressState } from 'store/futures';
import { getDisplayAsset } from 'utils/futures';
import logError from 'utils/logError';

import { MarginTransfer } from './types';
import { getFuturesEndpoint, mapCrossMarginTransfers, mapMarginTransfers } from './utils';

const ISOLATED_MARGIN_FRAGMENT = gql`
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

const CROSS_MARGIN_FRAGMENT = gql`
	query userCrossMarginTransfers($walletAddress: String!) {
		crossMarginAccountTransfers(
			where: { abstractAccount: $walletAddress }
			orderBy: timestamp
			orderDirection: desc
			first: 1000
		) {
			id
			timestamp
			account
			size
			txHash
		}
	}
`;

const useGetFuturesMarginTransfers = (
	currencyKey: string | null,
	options?: UseQueryOptions<MarginTransfer[]>
) => {
	const selectedFuturesAddress = useRecoilValue(selectedFuturesAddressState);
	const futuresAccountType = useRecoilValue(futuresAccountTypeState);
	const { defaultSynthetixjs: synthetixjs, network, isWalletConnected } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);
	const isL2 = useIsL2();

	return useQuery<MarginTransfer[]>(
		QUERY_KEYS.Futures.MarginTransfers(
			network?.id as NetworkId,
			selectedFuturesAddress ?? '',
			currencyKey || null
		),
		async () => {
			if (!selectedFuturesAddress || !currencyKey || !synthetixjs || !isL2 || !isWalletConnected)
				return [];
			const { contracts } = synthetixjs!;
			const marketAddress = contracts[`FuturesMarket${getDisplayAsset(currencyKey)}`].address;

			try {
				if (futuresAccountType === 'isolated_margin' && !!marketAddress) {
					const response = await request(futuresEndpoint, ISOLATED_MARGIN_FRAGMENT, {
						market: marketAddress,
						walletAddress: selectedFuturesAddress,
					});
					return response ? mapMarginTransfers(response.futuresMarginTransfers) : [];
				} else if (futuresAccountType === 'cross_margin') {
					const response = await request(futuresEndpoint, CROSS_MARGIN_FRAGMENT, {
						walletAddress: selectedFuturesAddress,
					});
					return response ? mapCrossMarginTransfers(response.crossMarginAccountTransfers) : [];
				} else {
					return [];
				}
			} catch (e) {
				logError(e);
				return [];
			}
		},
		{
			enabled: !!currencyKey && !!synthetixjs && !!selectedFuturesAddress,
			...options,
		}
	);
};

export default useGetFuturesMarginTransfers;
