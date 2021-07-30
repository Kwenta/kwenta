import Wei from '@synthetixio/wei';

export type PositionDetail = {
	remainingMargin: Wei;
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
};

export type FuturesFilledPosition = {
	canLiquidatePosition: boolean;
	side: PositionSide;
	notionalValue: Wei;
	accruedFunding: Wei;
	margin: Wei;
	profitLoss: Wei;
	fundingIndex: number;
	lastPrice: Wei;
	size: Wei;
	liquidationPrice: Wei;
	leverage: Wei;
};

export type FuturesPosition = {
	asset: string;
	order: FuturesOrder | null;
	remainingMargin: Wei;
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
};

export enum PositionSide {
	LONG = 'long',
	SHORT = 'short',
}
