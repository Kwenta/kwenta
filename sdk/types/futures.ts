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

export type FuturesMarket = {
	market: string;
	marketKey: FuturesMarketKey;
	marketName: string;
	asset: FuturesMarketAsset;
	assetHex: string;
	currentFundingRate: Wei;
	currentRoundId: Wei;
	feeRates: {
		makerFee: Wei;
		takerFee: Wei;
		makerFeeDelayedOrder: Wei;
		takerFeeDelayedOrder: Wei;
		makerFeeOffchainDelayedOrder: Wei;
		takerFeeOffchainDelayedOrder: Wei;
	};
	openInterest?: {
		shortPct: number;
		longPct: number;
		shortUSD: Wei;
		longUSD: Wei;
	};
	marketDebt: Wei;
	marketSkew: Wei;
	marketSize: Wei;
	maxLeverage: Wei;
	price: Wei;
	minInitialMargin: Wei;
	keeperDeposit: Wei;
	isSuspended: boolean;
	marketClosureReason: SynthSuspensionReason;
	marketLimit: Wei;
};

export type FuturesMarketSerialized = {
	market: string;
	marketKey: FuturesMarketKey;
	marketName: string;
	asset: FuturesMarketAsset;
	assetHex: string;
	currentFundingRate: string;
	currentRoundId: string;
	feeRates: {
		makerFee: string;
		takerFee: string;
		makerFeeDelayedOrder: string;
		takerFeeDelayedOrder: string;
		makerFeeOffchainDelayedOrder: string;
		takerFeeOffchainDelayedOrder: string;
	};
	openInterest?: {
		shortPct: number;
		longPct: number;
		shortUSD: string;
		longUSD: string;
	};
	marketDebt: string;
	marketSkew: string;
	marketSize: string;
	maxLeverage: string;
	price: string;
	minInitialMargin: string;
	keeperDeposit: string;
	isSuspended: boolean;
	marketClosureReason: SynthSuspensionReason;
	marketLimit: string;
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
	// perps v2
	pBTC = 'pBTC',
	pETH = 'pETH',

	// perps v1
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
	supports: 'mainnet' | 'testnet' | 'both' | 'none';
	disabled?: boolean;
}

export enum PositionSide {
	LONG = 'long',
	SHORT = 'short',
}

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

export type FuturesPosition<T = Wei> = {
	asset: FuturesMarketAsset;
	remainingMargin: T;
	accessibleMargin: T;
	position: {
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
	} | null;
};

export type FuturesPositionSerialized = {
	asset: FuturesMarketAsset;
	remainingMargin: string;
	accessibleMargin: string;
	position: {
		canLiquidatePosition: boolean;
		side: PositionSide;
		notionalValue: string;
		accruedFunding: string;
		initialMargin: string;
		profitLoss: string;
		fundingIndex: number;
		lastPrice: string;
		size: string;
		liquidationPrice: string;
		initialLeverage: string;
		leverage: string;
		pnl: string;
		pnlPct: string;
		marginRatio: string;
	} | null;
};
