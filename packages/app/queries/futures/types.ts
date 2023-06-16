import Wei from '@synthetixio/wei';

export type FuturesStat = {
	account: string;
	pnlWithFeesPaid: Wei;
	liquidations: Wei;
	totalTrades: Wei;
	totalVolume: Wei;
	pnl?: Wei;
};

export type AccountStat = {
	rank: number;
	account: string;
	trader: string;
	traderShort: string;
	traderEns?: string | null;
	totalTrades: number;
	totalVolume: Wei;
	liquidations: number;
	pnl: Wei;
};

export type FuturesCumulativeStats = {
	totalTrades: string;
	totalTraders: string;
	totalVolume: string;
	totalLiquidations: string;
	averageTradeSize: string;
};

export enum FuturesAccountTypes {
	ISOLATED_MARGIN = 'isolated_margin',
	CROSS_MARGIN = 'cross_margin',
}
