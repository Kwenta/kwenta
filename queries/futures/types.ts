import Wei from '@synthetixio/wei';
import { FuturesClosureReason } from 'hooks/useFuturesMarketClosed';
import { PotentialTradeStatus } from 'sections/futures/types';
import { FuturesMarketAsset } from 'utils/futures';

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
	asset: FuturesMarketAsset;
	order: FuturesOrder | null;
	remainingMargin: Wei;
	accessibleMargin: Wei;
	position: FuturesFilledPosition | null;
};

export type FuturesMarket = {
	market: string;
	asset: FuturesMarketAsset;
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
	isSuspended: boolean;
	marketClosureReason: FuturesClosureReason;
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
	openTimestamp: number;
	closeTimestamp: number;
	market: string;
	asset: string;
	account: string;
	isOpen: boolean;
	isLiquidated: boolean;
	size: Wei;
	feesPaid: Wei;
	netFunding: Wei;
	netTransfers: Wei;
	totalDeposits: Wei;
	initialMargin: Wei;
	margin: Wei;
	entryPrice: Wei;
	avgEntryPrice: Wei;
	exitPrice: Wei;
	pnl: Wei;
	pnlWithFeesPaid: Wei;
	totalVolume: Wei;
	trades: number;
};

export type MarginTransfer = {
	timestamp: number;
	market: string;
	account: string;
	size: Wei;
	txHash: string;
	action: string;
	amount: string;
	isPositive: boolean;
	asset: string;
};

export type PositionHistory = {
	id: Number;
	transactionHash: string;
	timestamp: number;
	openTimestamp: number;
	closeTimestamp: number;
	market: string;
	asset: FuturesMarketAsset;
	account: string;
	isOpen: boolean;
	isLiquidated: boolean;
	size: Wei;
	feesPaid: Wei;
	netFunding: Wei;
	netTransfers: Wei;
	totalDeposits: Wei;
	initialMargin: Wei;
	margin: Wei;
	entryPrice: Wei;
	avgEntryPrice: Wei;
	exitPrice: Wei;
	leverage: Wei;
	side: PositionSide;
	pnl: Wei;
	pnlWithFeesPaid: Wei;
	totalVolume: Wei;
	trades: number;
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
	size: Wei;
	asset: string;
	price?: Wei;
	txnHash: string;
	timestamp: Wei;
	positionId?: string;
	positionSize: Wei;
	positionClosed: boolean;
	side?: PositionSide | null;
	pnl: Wei;
	feesPaid: Wei;
	orderType: 'NextPrice' | 'Limit' | 'Market' | 'Liquidation';
};

export type FuturesVolumes = {
	[asset: string]: Wei;
};

export type FuturesStat = {
	account: string;
	pnlWithFeesPaid: string;
	liquidations: number;
	totalTrades: number;
	totalVolume: number;
	pnl?: number;
};

export type FuturesCumulativeStats = {
	totalTrades: string;
	totalVolume: string;
	totalLiquidations: string;
	averageTradeSize: string;
};

export type FundingRateUpdate = {
	funding: Wei;
	timestamp: number;
};

export type FuturesPotentialTradeDetails = {
	size: Wei;
	liqPrice: Wei;
	margin: Wei;
	price: Wei;
	fee: Wei;
	leverage: Wei;
	notionalValue: Wei;
	minInitialMargin: Wei;
	side: PositionSide;
	status: PotentialTradeStatus;
	showStatus: boolean;
	statusMessage: string;
};

export type FuturesAccountType = 'cross_margin' | 'isolated_margin' | 'pending';

export type FuturesAccountState = {
	selectedType: FuturesAccountType;
	selectedFuturesAddress: string | null;
	crossMarginAddress: string | null;
	walletAddress: string | null;
};
