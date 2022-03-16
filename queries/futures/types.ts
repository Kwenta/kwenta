import { CurrencyKey } from '@synthetixio/contracts-interface';
import Wei from '@synthetixio/wei';

export type PositionDetail = {
	remainingMargin: Wei;
	accessibleMargin: Wei;
	orderPending: boolean;
	order: {
		pending: boolean;
		fee: Wei;
		leverage: Wei;
	};
	position: {
		fundingIndex: Wei;
		lastPrice: Wei;
		size: Wei;
		margin: Wei;
	};
	accruedFunding: Wei;
	notionalValue: Wei;
	liquidationPrice: Wei;
	profitLoss: Wei;
};

export type FuturesOrder = {
	pending: boolean;
	fee: Wei;
	leverage: Wei;
	side: PositionSide;
};

export type FuturesFilledPosition = {
	canLiquidatePosition: boolean;
	side: PositionSide;
	notionalValue: Wei;
	accruedFunding: Wei;
	initialMargin: Wei;
	profitLoss: Wei;
	fundingIndex: number;
	lastPrice: Wei;
	size: Wei;
	liquidationPrice: Wei;
	initialLeverage: Wei;
	leverage: Wei;
	roi: Wei;
	roiChange: Wei;
	marginRatio: Wei;
};

export type FuturesPosition = {
	asset: string;
	order: FuturesOrder | null;
	remainingMargin: Wei;
	accessibleMargin: Wei;
	position: FuturesFilledPosition | null;
};

export type FuturesMarket = {
	market: string;
	asset: string;
	assetHex: string;
	currentFundingRate: Wei;
	feeRates: {
		makerFee: Wei;
		takerFee: Wei;
	};
	marketDebt: Wei;
	marketSkew: Wei;
	marketSize: Wei;
	maxLeverage: Wei;
	price: Wei;
	minInitialMargin: Wei;
};

export type FuturesOpenInterest = {
	asset: string;
	ratio: {
		short: number;
		long: number;
	};
};

export type RawPosition = {
	id: string;
	lastTxHash: string;
	timestamp: number;
	market: string;
	asset: string;
	account: string;
	isOpen: boolean;
	isLiquidated: boolean;
	size: Wei;
	margin: Wei;
	entryPrice: Wei;
	exitPrice: Wei;
};

export type PositionHistory = {
	id: Number;
	transactionHash: string;
	timestamp: number;
	market: string;
	asset: string;
	account: string;
	isOpen: boolean;
	isLiquidated: boolean;
	size: Wei;
	margin: Wei;
	entryPrice: Wei;
	exitPrice: Wei;
	leverage: Wei;
	side: PositionSide;
	pnl: Wei;
};

export enum PositionSide {
	LONG = 'long',
	SHORT = 'short',
}

export type Participant = {
	username: string;
	address: string;
};

export type FuturesOneMinuteStat = {
	trades: string;
	volume: string;
};

export type FuturesDailyTradeStats = {
	totalVolume: Wei;
	totalTrades: number;
};

export type FuturesTotalTrades = {
	totalTrades: string;
};

export type FuturesLiquidations = {
	liquidations: string;
};

export type FuturesTradeWithPrice = {
	size: string;
	price: string;
};

export type FuturesTrade = {
	size: string;
	asset: string;
	price?: string;
};

export type FuturesVolumes = {
	[asset: string]: Wei
};

export type FuturesStat = {
	account: string;
	pnlWithFeesPaid: string;
	liquidations: number;
	totalTrades: number;
	totalVolume: number;
};

export type FuturesCumulativeStats = {
	totalTrades: string;
	totalVolume: string;
	totalLiquidations: string;
	averageTradeSize: string;
};
