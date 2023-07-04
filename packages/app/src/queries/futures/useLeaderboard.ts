import { NetworkId } from '@kwenta/sdk/types'
import { getFuturesEndpoint, weiFromWei, truncateAddress } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import request, { gql } from 'graphql-request'
import { useQuery, UseQueryOptions } from 'react-query'

import QUERY_KEYS from 'constants/queryKeys'
import Connector from 'containers/Connector'
import logError from 'utils/logError'

import { AccountStat, FuturesStat } from './types'

const mapStat = (stat: FuturesStat, i: number) => ({
	...stat,
	trader: stat.account,
	traderShort: truncateAddress(stat.account),
	pnl: weiFromWei(stat.pnlWithFeesPaid),
	totalVolume: weiFromWei(stat.totalVolume),
	totalTrades: wei(stat.totalTrades).toNumber(),
	liquidations: wei(stat.liquidations).toNumber(),
	rank: i + 1,
	rankText: (i + 1).toString(),
})

type LeaderboardPart = 'top' | 'bottom' | 'wallet' | 'search' | 'all'

type LeaderboardResult = {
	[part in LeaderboardPart]: AccountStat[]
}

export const DEFAULT_LEADERBOARD_DATA = {
	top: [],
	bottom: [],
	wallet: [],
	search: [],
	all: [],
}

const useLeaderboard = (searchTerm: string, options?: UseQueryOptions<any>) => {
	const { network, walletAddress } = Connector.useContainer()
	const futuresEndpoint = getFuturesEndpoint(network?.id as NetworkId)

	return useQuery(
		QUERY_KEYS.Futures.Leaderboard(network?.id as NetworkId, searchTerm),
		async () => {
			try {
				const qry = gql`
					query leaderboardStats($account: String!, $searchTerm: String!) {
						top: futuresStats(orderBy: pnlWithFeesPaid, orderDirection: desc, first: 100) {
							account
							pnl
							pnlWithFeesPaid
							liquidations
							totalTrades
							totalVolume
						}
						bottom: futuresStats(orderBy: pnlWithFeesPaid, orderDirection: asc, first: 100) {
							account
							pnl
							pnlWithFeesPaid
							liquidations
							totalTrades
							totalVolume
						}
						wallet: futuresStats(where: { account: $account }) {
							account
							pnl
							pnlWithFeesPaid
							liquidations
							totalTrades
							totalVolume
						}
						search: futuresStats(where: { account_contains: $searchTerm }) {
							account
							pnl
							pnlWithFeesPaid
							liquidations
							totalTrades
							totalVolume
						}
					}
				`

				const response: Record<LeaderboardPart, FuturesStat[]> = await request(
					futuresEndpoint,
					qry,
					{
						account: walletAddress ?? '',
						searchTerm,
					}
				)

				const stats = {
					top: response.top.map(mapStat),
					bottom: response.bottom.map(mapStat),
					wallet: response.wallet.map(mapStat),
					search: response.search.map(mapStat),
					all: [],
				}

				return { ...stats, all: [...stats.top, ...stats.bottom, ...stats.wallet, ...stats.search] }
			} catch (e) {
				logError(e)
				return DEFAULT_LEADERBOARD_DATA
			}
		},
		// @ts-ignore
		{ ...options }
	)
}

export default useLeaderboard
