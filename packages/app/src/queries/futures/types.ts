import Wei from '@synthetixio/wei'

export type AccountStat = {
	rank: number
	account: string
	trader: string
	traderShort: string
	traderEns?: string | null
	totalTrades: number
	totalVolume: Wei
	liquidations: number
	pnl: number
	pnl_pct: number
	volume: number
	trades: number
	tier: 'gold' | 'silver' | 'bronze'
}

export type FuturesCumulativeStats = {
	totalTrades: string
	totalTraders: string
	totalVolume: string
	totalLiquidations: string
	averageTradeSize: string
}
