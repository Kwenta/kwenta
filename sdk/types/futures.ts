import Wei from '@synthetixio/wei';
import { BigNumber } from 'ethers';

import { FuturesAccountType } from 'queries/futures/subgraph';

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
	marketKey: FuturesMarketKey;
	marketName: string;
	asset: FuturesMarketAsset;
	assetHex: string;
	currentFundingRate: T;
	currentRoundId: T;
	feeRates: {
		makerFee: T;
		takerFee: T;
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
	marketKey: FuturesMarketKey;
	remainingMargin: T;
	accessibleMargin: T;
	position: FuturesFilledPosition<T> | null;
};

// This type exists to rename enum types from the subgraph to display-friendly types
export type FuturesOrderTypeDisplay = 'Limit' | 'Stop Market' | 'Market' | 'Liquidation';

export type FuturesOrder<T = Wei> = {
	id: string; // formatted subgraph id
	contractId: number;
	account: string;
	asset: FuturesMarketAsset;
	market: string;
	marketKey: FuturesMarketKey;
	size: T;
	targetPrice: T | null;
	marginDelta: T;
	targetRoundId: T | null;
	orderType: FuturesOrderTypeDisplay;
	sizeTxt?: string;
	targetPriceTxt?: string;
	side?: PositionSide;
	isStale?: boolean;
	isExecutable?: boolean;
	isCancelling?: boolean;
};

export type FuturesPotentialTradeDetails<T = Wei> = {
	size: T;
	sizeDelta: T;
	liqPrice: T;
	margin: T;
	price: T;
	fee: T;
	leverage: T;
	notionalValue: T;
	side: PositionSide;
	status: PotentialTradeStatus;
	showStatus: boolean;
	statusMessage: string;
};

// https://github.com/Synthetixio/synthetix/blob/4d2add4f74c68ac4f1106f6e7be4c31d4f1ccc76/contracts/interfaces/IFuturesMarketBaseTypes.sol#L6-L19
export enum PotentialTradeStatus {
	// Contract status mapping
	OK = 0,
	INVALID_PRICE = 1,
	PRICE_OUT_OF_BOUNDS = 2,
	CAN_LIQUIDATE = 3,
	CANNOT_LIQUIDATE = 4,
	MAX_MARKET_SIZE_EXCEEDED = 5,
	MAX_LEVERAGE_EXCEEDED = 6,
	INSUFFICIENT_MARGIN = 7,
	NOT_PERMITTED = 8,
	NIL_ORDER = 9,
	NO_POSITION_OPEN = 10,
	PRICE_TOO_VOLATILE = 11,

	// Our own local status
	INSUFFICIENT_FREE_MARGIN = 100,
}

export type PostTradeDetailsResponse = {
	margin: BigNumber;
	size: BigNumber;
	price: BigNumber;
	liqPrice: BigNumber;
	fee: BigNumber;
	status: number;
};

export type IsolatedMarginOrderType = 'market';
export type CrossMarginOrderType = 'market' | 'stop market' | 'limit';

export type FuturesTrade<T = Wei> = {
	size: T;
	asset: string;
	price: T;
	txnHash: string;
	timestamp: T;
	positionId?: string;
	positionSize: T;
	positionClosed: boolean;
	side: PositionSide;
	pnl: T;
	feesPaid: T;
	orderType: FuturesOrderTypeDisplay;
	accountType: FuturesAccountType;
};
