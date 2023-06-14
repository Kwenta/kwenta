import { wei } from '@synthetixio/wei';
import request, { gql } from 'graphql-request';
import KwentaSDK from 'sdk';

import { REQUIRES_L2 } from 'sdk/common/errors';
import { FUTURES_ENDPOINT_OP_MAINNET } from 'sdk/constants/futures';
import { ETH_UNIT } from 'sdk/constants/transactions';
import { AccountStat, FuturesStat } from 'sdk/types/stats';
import { weiFromWei } from 'sdk/utils/number';
import { truncateAddress } from 'sdk/utils/string';
import { getFuturesStats } from 'sdk/utils/subgraph';

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
});

type LeaderboardPart = 'top' | 'bottom' | 'wallet' | 'search' | 'all';

type LeaderboardResult = {
	[part in LeaderboardPart]: AccountStat[];
};

export const DEFAULT_LEADERBOARD_DATA = {
	top: [],
	bottom: [],
	wallet: [],
	search: [],
	all: [],
};

export default class StatsService {
	private sdk: KwentaSDK;

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk;
	}

	public async getStatsVolumes() {}

	public async getFuturesTradersStats() {}

	public async getFuturesStats() {
		try {
			const response = await getFuturesStats(
				this.sdk.futures.futuresGqlEndpoint,
				{
					first: 10,
					orderBy: 'pnlWithFeesPaid',
					orderDirection: 'desc',
				},
				{
					account: true,
					pnl: true,
					pnlWithFeesPaid: true,
					liquidations: true,
					totalTrades: true,
					totalVolume: true,
				}
			);

			const stats = response.map((stat: FuturesStat, i: number) => ({
				...stat,
				trader: stat.account,
				traderShort: truncateAddress(stat.account),
				pnl: stat.pnlWithFeesPaid.div(ETH_UNIT),
				totalVolume: stat.totalVolume.div(ETH_UNIT),
				totalTrades: stat.totalTrades.toNumber(),
				liquidations: stat.liquidations.toNumber(),
				rank: i + 1,
				rankText: (i + 1).toString(),
			}));

			return stats as AccountStat[];
		} catch (e) {
			this.sdk.context.logError(e);
			return [];
		}
	}

	public async getLeaderboard(searchTerm: string) {
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
			`;

			const response: Record<LeaderboardPart, FuturesStat[]> = await request(
				this.sdk.futures.futuresGqlEndpoint,
				query,
				{ account: this.sdk.context.walletAddress, searchTerm }
			);

			const stats: LeaderboardResult = {
				top: response.top.map(mapStat),
				bottom: response.bottom.map(mapStat),
				wallet: response.wallet.map(mapStat),
				search: response.search.map(mapStat),
				all: [],
			};

			stats.all = [...stats.top, ...stats.bottom, ...stats.wallet, ...stats.search];

			return stats;
		} catch (e) {
			this.sdk.context.logError(e);
			return DEFAULT_LEADERBOARD_DATA;
		}
	}

	public async getFuturesCumulativeStats(homepage: boolean) {
		if (!this.sdk.context.isL2 && !homepage) {
			throw new Error(REQUIRES_L2);
		}

		const futuresEndpoint = homepage
			? FUTURES_ENDPOINT_OP_MAINNET
			: this.sdk.futures.futuresGqlEndpoint;

		try {
			const response = await request(
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
			);

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
				: null;
		} catch (e) {
			this.sdk.context.logError(e);
			return null;
		}
	}
}
