import { useQuery, UseQueryOptions } from 'react-query';
import { useRecoilState, useRecoilValue } from 'recoil';
import { gql, request } from 'graphql-request';
import produce from 'immer';

import { appReadyState } from 'store/app';
import { walletAddressState, isWalletConnectedState, networkState } from 'store/wallet';
import QUERY_KEYS from 'constants/queryKeys';

import { HistoricalShortPosition } from './types';
import {
	formatShort,
	SHORT_GRAPH_ENDPOINT,
	SHORT_GRAPH_ENDPOINT_KOVAN,
	SHORT_GRAPH_ENDPOINT_OVM_KOVAN,
	SHORT_GRAPH_ENDPOINT_OVM,
} from './utils';
import { historicalShortsPositionState } from 'store/shorts';

const useShortHistoryQuery = (options?: UseQueryOptions<HistoricalShortPosition[]>) => {
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const walletAddress = useRecoilValue(walletAddressState);
	const network = useRecoilValue(networkState);
	const [historicalShortPositions, setHistoricalShortPositions] = useRecoilState(
		historicalShortsPositionState
	);
	const endpoint =
		network && network.name === 'kovan'
			? SHORT_GRAPH_ENDPOINT_KOVAN
			: network.id === 69
			? SHORT_GRAPH_ENDPOINT_OVM_KOVAN
			: network.id === 10
			? SHORT_GRAPH_ENDPOINT_OVM
			: SHORT_GRAPH_ENDPOINT;
	return useQuery<HistoricalShortPosition[]>(
		QUERY_KEYS.Collateral.ShortHistory(walletAddress ?? '', network?.id!),
		async () => {
			const response = await request(
				endpoint,
				gql`
					query shorts($account: String!) {
						shorts(where: { account: $account, isOpen: true }, orderBy: id, orderDirection: desc) {
							id
							txHash
							collateralLocked
							collateralLockedAmount
							synthBorrowed
							synthBorrowedAmount
							isOpen
							createdAt
							closedAt
						}
					}
				`,
				{
					account: walletAddress,
				}
			);

			const shorts = (response?.shorts ?? []).map(formatShort) as HistoricalShortPosition[];
			if (historicalShortPositions.length > 0) {
				const loanIndexesToDelete: number[] = [];
				historicalShortPositions.forEach((loan, index) => {
					if (shorts.find((short) => short.id === loan.id)) {
						loanIndexesToDelete.push(index);
					}
				});

				if (loanIndexesToDelete.length > 0) {
					setHistoricalShortPositions(
						produce(historicalShortPositions, (draftState) => {
							loanIndexesToDelete.forEach((index) => {
								draftState.splice(index, 1);
							});
						})
					);
				}
			}

			return shorts;
		},
		{
			enabled: isAppReady && isWalletConnected && !!network,
			...options,
		}
	);
};

export default useShortHistoryQuery;
