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

export type PositionHistory = {
	id: number;
	transactionHash: string;
	timestamp: number;
	isOpen: boolean;
	isLiquidated: boolean;
	entryPrice: Wei;
	exitPrice: Wei;
	size: Wei;
	asset: string;
	margin: Wei;
	leverage: Wei;
	side: PositionSide;
	pnl: Wei;
};

export enum PositionSide {
	LONG = 'long',
	SHORT = 'short',
}
