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

export type PositionHistory = {
	id: number;
	transactionHash: string;
	timestamp: number;
	isOpen: boolean;
	isLiquidated: boolean;
	entryPrice: Wei;
	exitPrice: Wei;
	size: Wei;
	asset?: string;
	margin: Wei;
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

export type FuturesTrade = {
	size: string;
};

export type FuturesDayTradeStats = {
	volume: Wei;
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

export type FuturesStat = {
	account: string;
	pnlWithFeesPaid: string;
	liquidations: number;
	totalTrades: number;
};
