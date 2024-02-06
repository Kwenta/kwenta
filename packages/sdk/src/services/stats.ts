import { wei } from '@synthetixio/wei'
import request, { gql } from 'graphql-request'
import { Contract } from 'ethers'
import axios from 'axios'

import KwentaSDK from '..'
import { REQUIRES_L2 } from '../common/errors'
import { FUTURES_ENDPOINT_OP_MAINNET } from '../constants/futures'
import {
	ADDRESSES_PER_LOOKUP,
	DEFAULT_LEADERBOARD_DATA,
	ENS_REVERSE_LOOKUP,
} from '../constants/stats'
import { ETH_UNIT } from '../constants/transactions'
import { EnsInfo, FuturesStat, Leaderboard } from '../types/stats'
import { mapStat } from '../utils/stats'
import { truncateAddress } from '../utils/string'
import { getFuturesStats } from '../utils/subgraph'
import { API_URL } from '../constants'

type LeaderboardPart = 'top' | 'bottom' | 'wallet' | 'search' | 'all'

export default class StatsService {
	private sdk: KwentaSDK

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk
	}

	public async getStatsVolumes() {}

	public async getFuturesTradersStats() {}

	public async getFuturesStats() {
		try {
			// const response = await getFuturesStats(
			// 	this.sdk.futures.futuresGqlEndpoint,
			// 	{
			// 		first: 10,
			// 		orderBy: 'pnlWithFeesPaid',
			// 		orderDirection: 'desc',
			// 	},
			// 	{
			// 		account: true,
			// 		pnl: true,
			// 		pnlWithFeesPaid: true,
			// 		liquidations: true,
			// 		totalTrades: true,
			// 		totalVolume: true,
			// 	}
			// )

			// const stats = response.map((stat, i) => ({
			// 	trader: stat.account,
			// 	traderShort: truncateAddress(stat.account),
			// 	pnl: stat.pnlWithFeesPaid.div(ETH_UNIT).toString(),
			// 	totalVolume: stat.totalVolume.div(ETH_UNIT).toString(),
			// 	totalTrades: stat.totalTrades.toNumber(),
			// 	liquidations: stat.liquidations.toNumber(),
			// 	rank: i + 1,
			// 	rankText: (i + 1).toString(),
			// }))

			type Stats = {
				trader: string
				traderShort: string
				pnl: string
				totalVolume: string
				totalTrades: number
				liquidations: number
				rank: number
				rankText: string
			}

			const { data: stats } = await axios.get<Stats[]>(`${API_URL}/stats/futures-stats`)

			return stats
		} catch (e) {
			this.sdk.context.logError(e)
			return []
		}
	}

	public async getLeaderboard(searchTerm: string): Promise<Leaderboard> {
		try {
			const query = gql`
				fragment StatsBody on FuturesStat {
					account
					pnl
					pnlWithFeesPaid
					liquidations
					totalTrades
					totalVolume
				}

				query leaderboardStats($account: String!, $searchTerm: String!) {
					top: futuresStats(orderBy: pnlWithFeesPaid, orderDirection: desc, first: 100) {
						...StatsBody
					}
					bottom: futuresStats(orderBy: pnlWithFeesPaid, orderDirection: asc, first: 100) {
						...StatsBody
					}
					wallet: futuresStats(where: { account: $account }) {
						...StatsBody
					}
					search: futuresStats(where: { account_contains: $searchTerm }) {
						...StatsBody
					}
				}
			`

			const response: Record<LeaderboardPart, FuturesStat[]> = await request(
				this.sdk.futures.futuresGqlEndpoint,
				query,
				{ account: this.sdk.context.walletAddress, searchTerm }
			)

			// TODO: Improve the time complexity of this operation.
			// We *should* be able to add the ENS and merge at the same time.

			const ensInfo = await this.batchGetENS(
				Object.values(response)
					.flat(1)
					.map(({ account }) => account)
			)

			const statTransform = mapStat(ensInfo)

			const stats = {
				top: response.top.map(statTransform),
				bottom: response.bottom.map(statTransform),
				wallet: response.wallet.map(statTransform),
				search: response.search.map(statTransform),
			}

			return { ...stats, all: [...stats.top, ...stats.bottom, ...stats.wallet, ...stats.search] }
		} catch (e) {
			this.sdk.context.logError(e)
			return DEFAULT_LEADERBOARD_DATA
		}
	}

	public async getFuturesCumulativeStats(homepage: boolean) {
		if (!this.sdk.context.isL2 && !homepage) {
			throw new Error(REQUIRES_L2)
		}

		const futuresEndpoint = homepage
			? FUTURES_ENDPOINT_OP_MAINNET
			: this.sdk.futures.futuresGqlEndpoint

		try {
			const response: any = await request(
				futuresEndpoint,
				gql`
					query FuturesCumulativeStats {
						futuresCumulativeStat(id: "0") {
							totalTrades
							totalTraders
							totalVolume
							totalLiquidations
							averageTradeSize
						}
					}
				`
			)

			return response
				? {
						totalVolume: wei(response.futuresCumulativeStat.totalVolume, 18, true).toString(),
						averageTradeSize: wei(
							response.futuresCumulativeStat.averageTradeSize,
							18,
							true
						).toString(),
						totalTraders: response.futuresCumulativeStat.totalTraders,
						totalTrades: response.futuresCumulativeStat.totalTrades,
						totalLiquidations: response.futuresCumulativeStat.totalLiquidations,
				  }
				: null
		} catch (e) {
			this.sdk.context.logError(e)
			return null
		}
	}

	private async batchGetENS(addresses: string[]) {
		const ReverseLookup = new Contract(
			ENS_REVERSE_LOOKUP,
			['function getNames(address[] addresses) external view returns (string[] r)'],
			this.sdk.context.l1MainnetProvider
		)

		let ensPromises = []
		for (let i = 0; i < addresses.length; i += ADDRESSES_PER_LOOKUP) {
			const addressesToLookup = addresses.slice(i, i + ADDRESSES_PER_LOOKUP)
			const ensNamesPromise = ReverseLookup.getNames(addressesToLookup)
			ensPromises.push(ensNamesPromise)
		}

		let ensInfo: EnsInfo = {}

		const ensPromiseResult = await Promise.all(ensPromises)
		ensPromiseResult.flat(1).forEach((val: string, ind: number) => {
			if (val !== '') {
				ensInfo[addresses[ind]] = val
			}
		})

		return ensInfo
	}
}
