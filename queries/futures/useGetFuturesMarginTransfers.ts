import { NetworkId } from '@synthetixio/contracts-interface';
import request, { gql } from 'graphql-request';
import { useQuery, UseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import useIsL2 from 'hooks/useIsL2';
import { selectFuturesAccount, selectFuturesType, selectMarketInfo } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';
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

const useGetFuturesMarginTransfers = (options?: UseQueryOptions<MarginTransfer[]>) => {
	const selectedFuturesAddress = useAppSelector(selectFuturesAccount);
	const marketInfo = useAppSelector(selectMarketInfo);
	const futuresAccountType = useAppSelector(selectFuturesType);
	const { defaultSynthetixjs: synthetixjs, network, isWalletConnected } = Connector.useContainer();
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);
	const isL2 = useIsL2();

	return useQuery<MarginTransfer[]>(
		QUERY_KEYS.Futures.MarginTransfers(
			network?.id as NetworkId,
			selectedFuturesAddress ?? '',
			marketInfo?.market || null
		),
		async () => {
			if (!selectedFuturesAddress || !marketInfo || !synthetixjs || !isL2 || !isWalletConnected)
				return [];

			try {
				if (futuresAccountType === 'isolated_margin' && !!marketInfo?.market) {
					const response = await request(futuresEndpoint, ISOLATED_MARGIN_FRAGMENT, {
						market: marketInfo.market,
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
			enabled: !!marketInfo && !!synthetixjs && !!selectedFuturesAddress,
			...options,
		}
	);
};

export default useGetFuturesMarginTransfers;
