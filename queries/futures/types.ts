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

export type FuturesPosition = {
	asset: string;
	order: { pending: boolean; fee: Wei; leverage: Wei } | null;
	margin: Wei;
	position: {
		canLiquidatePosition: boolean;
		isLong: boolean;
		notionalValue: Wei;
		accruedFunding: Wei;
		remainingMargin: Wei;
		profitLoss: Wei;
		fundingIndex: number;
		lastPrice: Wei;
		size: Wei;
		liquidationPrice: Wei;
		leverage: Wei;
	} | null;
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
