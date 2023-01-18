import Wei from '@synthetixio/wei';

import { FuturesAccountType } from 'queries/futures/types';
import { Prices } from 'queries/rates/types';
import {
	CrossMarginOrderType,
	FuturesMarket,
	FuturesOrder,
	FuturesPosition,
	FuturesPotentialTradeDetails,
	FuturesVolumes,
	IsolatedMarginOrderType,
} from 'sdk/types/futures';
import { PositionSide } from 'sections/futures/types';
import { QueryStatus } from 'state/types';
import { FuturesMarketAsset, FuturesMarketKey } from 'utils/futures';

export type TradeSizeInputs<T = Wei> = {
	nativeSize: T;
	susdSize: T;
};

export type CrossMarginTradeInputs<T = Wei> = TradeSizeInputs<T> & {
	leverage: string;
};

export type CrossMarginTradeInputsWithDelta<T = Wei> = CrossMarginTradeInputs<T> & {
	nativeSizeDelta: T;
	susdSizeDelta: T;
};

export type IsolatedMarginTradeInputs<T = Wei> = TradeSizeInputs<T>;

export type FundingRateSerialized = {
	asset: FuturesMarketKey;
	fundingTitle: string;
	fundingRate: string | null;
};

export type FundingRate<T = Wei> = {
	asset: FuturesMarketKey;
	fundingTitle: string;
	fundingRate: T | null;
};

export type FuturesQueryStatuses = {
	markets: QueryStatus;
	crossMarginBalanceInfo: QueryStatus;
	dailyVolumes: QueryStatus;
	crossMarginPositions: QueryStatus;
	isolatedPositions: QueryStatus;
	openOrders: QueryStatus;
	crossMarginSettings: QueryStatus;
	isolatedTradePreview: QueryStatus;
	crossMarginTradePreview: QueryStatus;
	crossMarginAccount: QueryStatus;
	previousDayRates: QueryStatus;
	positionHistory: QueryStatus;
	selectedTraderPositionHistory: QueryStatus;
};

export type FuturesTransactionType =
	| 'deposit_cross_margin'
	| 'withdraw_cross_margin'
	| 'approve_cross_margin'
	| 'deposit_isolated'
	| 'withdraw_isolated'
	| 'modify_isolated'
	| 'close_isolated'
	| 'close_cross_margin'
	| 'submit_cross_order'
	| 'cancel_cross_margin_order'
	| 'withdraw_keeper_balance';

export type TransactionEstimation<T = Wei> = {
	error?: string | null | undefined;
	limit: T;
	cost: T;
};

export type TransactionEstimations = Record<FuturesTransactionType, TransactionEstimation<string>>;

export type TransactionEstimationPayload = {
	type: FuturesTransactionType;
	limit: string;
	cost: string;
	error?: string | null | undefined;
};

export type CrossMarginBalanceInfo<T = Wei> = {
	freeMargin: T;
	keeperEthBal: T;
	allowance: T;
};

export type CrossMarginSettings<T = Wei> = {
	tradeFee: T;
	limitOrderFee: T;
	stopOrderFee: T;
};

export type CrossMarginTradeFees<T = Wei> = {
	staticFee: T;
	crossMarginFee: T;
	limitStopOrderFee: T;
	keeperEthDeposit: T;
	total: T;
};

type FuturesErrors = {
	tradePreview?: string | undefined | null;
};

type CrossMarginNetwork = number;

export type CrossMarginAccount = {
	account: string;
	position?: FuturesPosition<string>;
	balanceInfo: CrossMarginBalanceInfo<string>;
	positions: FuturesPosition<string>[];
	openOrders: FuturesOrder<string>[];
	positionHistory: PositionHistory<string>[];
};

// TODO: Separate in some way by network and wallet
// so we can have persisted state between switching

export type FuturesState = {
	selectedType: FuturesAccountType;
	confirmationModalOpen: boolean;
	isolatedMargin: IsolatedMarginState;
	crossMargin: CrossMarginState;
	markets: FuturesMarket<string>[];
	fundingRates: FundingRateSerialized[];
	queryStatuses: FuturesQueryStatuses;
	dailyMarketVolumes: FuturesVolumes<string>;
	previousDayRates: Prices;
	transactionEstimations: TransactionEstimations;
	dynamicFeeRate: string;
	errors: FuturesErrors;
	leaderboard: {
		selectedTrader: string | undefined;
		selectedTraderPositionHistory: Record<
			CrossMarginNetwork,
			{
				[wallet: string]: PositionHistory<string>[];
			}
		>;
	};
};

export type CrossMarginState = {
	tradeInputs: CrossMarginTradeInputs<string>;
	marginDelta: string;
	orderType: CrossMarginOrderType;
	orderFeeCap: string;
	selectedLeverageByAsset: Partial<Record<FuturesMarketKey, string>>;
	leverageSide: PositionSide;
	selectedMarketKey: FuturesMarketKey;
	selectedMarketAsset: FuturesMarketAsset;
	showCrossMarginOnboard: boolean;
	tradePreview: FuturesPotentialTradeDetails<string> | null;
	settings: CrossMarginSettings<string>;
	fees: CrossMarginTradeFees<string>;
	depositApproved: boolean;
	cancellingOrder: string | undefined;
	showOnboard: boolean;
	accounts: Record<
		CrossMarginNetwork,
		{
			[wallet: string]: CrossMarginAccount;
		}
	>;

	orderPrice: {
		price?: string | undefined | null;
		invalidLabel: string | undefined | null;
	};
};

export type IsolatedMarginState = {
	tradeInputs: IsolatedMarginTradeInputs<string>;
	orderType: IsolatedMarginOrderType;
	tradePreview: FuturesPotentialTradeDetails<string> | null;
	leverageSide: PositionSide;
	selectedMarketKey: FuturesMarketKey;
	selectedMarketAsset: FuturesMarketAsset;
	position?: FuturesPosition<string>;
	leverageInput: string;
	tradeFee: string;
	// TODO: Update to map by network similar to cross margin
	positionHistory: {
		[account: string]: PositionHistory<string>[];
	};
	positions: {
		[account: string]: FuturesPosition<string>[];
	};
	openOrders: {
		[account: string]: FuturesOrder<string>[];
	};
};

export type ModifyIsolatedPositionInputs = {
	sizeDelta: Wei;
};

export const futuresPositionKeys = new Set([
	'remainingMargin',
	'accessibleMargin',
	'order.fee',
	'order.leverage',
	'position.notionalValue',
	'position.accruedFunding',
	'position.initialMargin',
	'position.profitLoss',
	'position.lastPrice',
	'position.size',
	'position.liquidationPrice',
	'position.initialLeverage',
	'position.leverage',
	'position.pnl',
	'position.pnlPct',
	'position.marginRatio',
]);

export type PositionHistory<T = Wei> = {
	id: Number;
	transactionHash: string;
	timestamp: number;
	openTimestamp: number;
	closeTimestamp: number | undefined;
	market: string;
	asset: FuturesMarketAsset;
	account: string;
	abstractAccount: string;
	accountType: FuturesAccountType;
	isOpen: boolean;
	isLiquidated: boolean;
	size: T;
	feesPaid: T;
	netFunding: T;
	netTransfers: T;
	totalDeposits: T;
	initialMargin: T;
	margin: T;
	entryPrice: T;
	avgEntryPrice: T;
	exitPrice: T;
	leverage: T;
	side: PositionSide;
	pnl: T;
	pnlWithFeesPaid: T;
	totalVolume: T;
	trades: number;
};
