import Wei from '@synthetixio/wei';

export type FundingRateInput = {
	marketAddress: string | undefined;
	marketKey: FuturesMarketKey;
	price: Wei | undefined;
	currentFundingRate: Wei | undefined;
};

export type SynthSuspensionReason =
	| 'system-upgrade'
	| 'market-closure'
	| 'circuit-breaker'
	| 'emergency';

export type MarketClosureReason = SynthSuspensionReason;

export type FuturesMarket<T = Wei> = {
	market: string;
	marketKey?: FuturesMarketKey;
	marketName: string;
	asset: FuturesMarketAsset;
	assetHex: string;
	currentFundingRate: T;
	currentRoundId: T;
	feeRates: {
		makerFee: T;
		takerFee: T;
		makerFeeNextPrice: T;
		takerFeeNextPrice: T;
	};
	openInterest?: {
		shortPct: number;
		longPct: number;
		shortUSD: T;
		longUSD: T;
	};
	marketDebt: T;
	marketSkew: T;
	marketSize: T;
	maxLeverage: T;
	price: T;
	minInitialMargin: T;
	keeperDeposit: T;
	isSuspended: boolean;
	marketClosureReason: SynthSuspensionReason;
	marketLimit: T;
};

export type FundingRateUpdate = {
	funding: Wei;
	timestamp: number;
};

export type FundingRateResponse = {
	asset: FuturesMarketKey;
	fundingTitle: string;
	fundingRate: Wei | null;
};

export enum FuturesMarketKey {
	sBTC = 'sBTC',
	sETH = 'sETH',
	sLINK = 'sLINK',
	sSOL = 'sSOL',
	sAVAX = 'sAVAX',
	sAAVE = 'sAAVE',
	sUNI = 'sUNI',
	sMATIC = 'sMATIC',
	sXAU = 'sXAU',
	sXAG = 'sXAG',
	sEUR = 'sEUR',
	sAPE = 'sAPE',
	sDYDX = 'sDYDX',
	sBNB = 'sBNB',
	sDOGE = 'sDOGE',
	sDebtRatio = 'sDebtRatio',
	sXMR = 'sXMR',
	sOP = 'sOP',
}

export enum FuturesMarketAsset {
	sBTC = 'sBTC',
	sETH = 'sETH',
	sLINK = 'sLINK',
	SOL = 'SOL',
	AVAX = 'AVAX',
	AAVE = 'AAVE',
	UNI = 'UNI',
	MATIC = 'MATIC',
	XAU = 'XAU',
	XAG = 'XAG',
	EUR = 'EUR',
	APE = 'APE',
	DYDX = 'DYDX',
	BNB = 'BNB',
	DOGE = 'DOGE',
	DebtRatio = 'DebtRatio',
	XMR = 'XMR',
	OP = 'OP',
}

export interface FuturesMarketConfig {
	key: FuturesMarketKey;
	asset: FuturesMarketAsset;
	supports: 'mainnet' | 'testnet' | 'both';
	disabled?: boolean;
}

export type FuturesVolumes<T = Wei> = {
	[asset: string]: {
		volume: T;
		trades: T;
	};
};

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

export enum PositionSide {
	LONG = 'long',
	SHORT = 'short',
}

export type FuturesFilledPosition<T = Wei> = {
	canLiquidatePosition: boolean;
	side: PositionSide;
	notionalValue: T;
	accruedFunding: T;
	initialMargin: T;
	profitLoss: T;
	fundingIndex: number;
	lastPrice: T;
	size: T;
	liquidationPrice: T;
	initialLeverage: T;
	leverage: T;
	pnl: T;
	pnlPct: T;
	marginRatio: T;
};

export type FuturesPosition<T = Wei> = {
	asset: FuturesMarketAsset;
	remainingMargin: T;
	accessibleMargin: T;
	position: FuturesFilledPosition<T> | null;
};
