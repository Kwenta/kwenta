import { NetworkId } from '@synthetixio/contracts-interface';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { positionHistoryState } from 'store/futures';
import logError from 'utils/logError';

import { getFuturesPositions } from './subgraph';
import { PositionHistory } from './types';
import { getFuturesEndpoint, mapFuturesPositions } from './utils';

const useGetFuturesPositionForAccount = (account?: string, options?: UseQueryOptions<any>) => {
	const { network, walletAddress } = Connector.useContainer();

	const setPositionHistory = useSetRecoilState(positionHistoryState);
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<PositionHistory[]>(
		QUERY_KEYS.Futures.AccountPositions(account ?? walletAddress, network.id as NetworkId),
		async () => {
			if (!walletAddress) {
				if (!account) setPositionHistory([]);
				return [];
			}

			try {
				const response = await getFuturesPositions(
					futuresEndpoint,
					{
						where: {
							account: account ?? walletAddress,
						},
					},
					{
						id: true,
						lastTxHash: true,
						openTimestamp: true,
						closeTimestamp: true,
						timestamp: true,
						market: true,
						asset: true,
						account: true,
						abstractAccount: true,
						accountType: true,
						isOpen: true,
						isLiquidated: true,
						trades: true,
						totalVolume: true,
						size: true,
						initialMargin: true,
						margin: true,
						pnl: true,
						feesPaid: true,
						netFunding: true,
						pnlWithFeesPaid: true,
						netTransfers: true,
						totalDeposits: true,
						fundingIndex: true,
						entryPrice: true,
						avgEntryPrice: true,
						lastPrice: true,
						exitPrice: true,
					}
				);
				const positionHistory = response ? mapFuturesPositions(response) : [];
				if (!account) setPositionHistory(positionHistory);
				return positionHistory;
			} catch (e) {
				logError(e);
				if (!account) setPositionHistory([]);
				return [];
			}
		},
		{
			enabled: !!walletAddress,
			...options,
		}
	);
};

export default useGetFuturesPositionForAccount;
