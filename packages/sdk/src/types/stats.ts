export type FuturesStat<T = string, K = string> = {
	account: string
	pnlWithFeesPaid: T
	liquidations: K
	totalTrades: K
	totalVolume: T
}

export type AccountStat<T = string, K = string> = FuturesStat<T, K> & {
	trader: string
	traderShort: string
	rank: number
	rankText: string
	traderEns?: string | null
}

export type Leaderboard<T = string, K = string> = {
	top: AccountStat<T, K>[]
	bottom: AccountStat<T, K>[]
	wallet: AccountStat<T, K>[]
	search: AccountStat<T, K>[]
	all: AccountStat<T, K>[]
}

export type FuturesCumulativeStats = {
	totalTrades: string
	totalTraders: string
	totalVolume: string
	totalLiquidations: string
	averageTradeSize: string
}

export enum FuturesAccountTypes {
	ISOLATED_MARGIN = 'isolated_margin',
	CROSS_MARGIN = 'cross_margin',
}

export type EnsInfo = {
	[account: string]: string
}
