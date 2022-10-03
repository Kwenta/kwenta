import { NetworkId } from '@synthetixio/contracts-interface';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSetRecoilState } from 'recoil';

import QUERY_KEYS from 'constants/queryKeys';
import Connector from 'containers/Connector';
import { positionHistoryState } from 'store/futures';
import logError from 'utils/logError';

import { getFuturesPositions } from './subgraph';
import { FuturesAccountTypes, PositionHistory, PositionHistoryState } from './types';
import { getFuturesEndpoint, mapFuturesPositions } from './utils';

const DEFAULT_POSITION_HISTORY: PositionHistoryState = {
	[FuturesAccountTypes.CROSS_MARGIN]: [],
	[FuturesAccountTypes.ISOLATED_MARGIN]: [],
};

const useGetFuturesPositionForAccount = (account?: string, options?: UseQueryOptions<any>) => {
	const { network, walletAddress } = Connector.useContainer();

	const setPositionHistory = useSetRecoilState(positionHistoryState);
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId);

	return useQuery<PositionHistoryState>(
		QUERY_KEYS.Futures.AccountPositions(account ?? walletAddress, network.id as NetworkId),
		async () => {
			if (!walletAddress) {
				if (!account) setPositionHistory(DEFAULT_POSITION_HISTORY);
				return DEFAULT_POSITION_HISTORY;
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

				const positionHistoryByType = positionHistory.reduce(
					(acc: PositionHistoryState, position: PositionHistory) => {
						const accountType = position.accountType;

						// make sure it's not a duplicate before adding to the list
						const existingPositionId = acc[accountType].findIndex((pos) => pos.id === position.id);
						if (
							existingPositionId === -1 ||
							position.timestamp > acc[accountType][existingPositionId].timestamp
						)
							acc[accountType] = [
								position,
								...acc[accountType].filter(({ id }) => id !== existingPositionId),
							];
						return acc;
					},
					DEFAULT_POSITION_HISTORY
				);

				if (!account) setPositionHistory(positionHistoryByType);
				return positionHistoryByType;
			} catch (e) {
				logError(e);
				if (!account) setPositionHistory(DEFAULT_POSITION_HISTORY);
				return DEFAULT_POSITION_HISTORY;
			}
		},
		{
			enabled: !!walletAddress,
			...options,
		}
	);
};

export default useGetFuturesPositionForAccount;
