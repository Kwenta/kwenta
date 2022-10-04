import { NetworkId } from '@synthetixio/contracts-interface';
import { useQuery, UseQueryOptions } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import logError from 'utils/logError';

import { getFuturesPositions } from './subgraph';
import { FuturesAccountTypes, PositionHistory, PositionHistoryState } from './types';
import { getFuturesEndpoint, mapFuturesPositions } from './utils';

const DEFAULT_POSITION_HISTORY: PositionHistoryState = {
	[FuturesAccountTypes.CROSS_MARGIN]: [],
	[FuturesAccountTypes.ISOLATED_MARGIN]: [],
};

const useGetFuturesPositionHistoryForAccount = (
	account: string | null,
	options?: UseQueryOptions<PositionHistoryState>
) => {
	const { network } = Connector.useContainer();

	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<PositionHistoryState>(
		QUERY_KEYS.Futures.PositionHistory(account, network.id as NetworkId),
		async () => {
			try {
				const response = await getFuturesPositions(
					futuresEndpoint,
					{
						where: {
							account: account,
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

				const positionHistoryByType = positionHistory.reduce(
					(acc: PositionHistoryState, position: PositionHistory) => {
						const accountType = position.accountType;

						return {
							...acc,
							[accountType]: [...acc[accountType], position],
						};
					},
					DEFAULT_POSITION_HISTORY
				);
				return positionHistoryByType;
			} catch (e) {
				logError(e);
				return DEFAULT_POSITION_HISTORY;
			}
		},
		{
			enabled: !!account,
			...options,
		}
	);
};

export default useGetFuturesPositionHistoryForAccount;
