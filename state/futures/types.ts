import Wei from '@synthetixio/wei';

import { FuturesAccountType } from 'queries/futures/types';
import { Prices } from 'queries/rates/types';
import { TransactionStatus } from 'sdk/types/common';
import {
	DelayedOrder,
	CrossMarginOrderType,
	FuturesMarket,
	FuturesPosition,
	FuturesPositionHistory,
	FuturesPotentialTradeDetails,
	FuturesTrade,
	FuturesVolumes,
	IsolatedMarginOrderType,
	PositionSide,
	FuturesOrder,
} from 'sdk/types/futures';
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
	crossMarginPositionHistory: QueryStatus;
	isolatedPositions: QueryStatus;
	isolatedPositionHistory: QueryStatus;
	openOrders: QueryStatus;
	crossMarginSettings: QueryStatus;
	isolatedTradePreview: QueryStatus;
	crossMarginTradePreview: QueryStatus;
	crossMarginAccount: QueryStatus;
	previousDayRates: QueryStatus;
	positionHistory: QueryStatus;
	trades: QueryStatus;
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
	| 'cancel_delayed_isolated'
	| 'execute_delayed_isolated'
	| 'close_cross_margin'
	| 'submit_cross_order'
	| 'cancel_cross_margin_order'
	| 'withdraw_keeper_balance';

export type FuturesTransaction = {
	type: FuturesTransactionType;
	status: TransactionStatus;
	error?: string;
	hash: string | null;
};

export type TransactionEstimation<T = Wei> = {
	error?: string | null;
	limit: T;
	cost: T;
};

export type TransactionEstimations = Record<FuturesTransactionType, TransactionEstimation<string>>;

export type TransactionEstimationPayload = {
	type: FuturesTransactionType;
	limit: string;
	cost: string;
	error?: string | null;
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

export type InputCurrencyDenomination = 'usd' | 'native';

export type CrossMarginAccount = {
	account: string;
	position?: FuturesPosition<string>;
	balanceInfo: CrossMarginBalanceInfo<string>;
	positions: FuturesPosition<string>[];
	openOrders: FuturesOrder<string>[];
	positionHistory: FuturesPositionHistory<string>[];
	trades: FuturesTrade<string>[];
};

// TODO: Separate in some way by network and wallet
// so we can have persisted state between switching

export type FuturesState = {
	selectedType: FuturesAccountType;
	confirmationModalOpen: boolean;
	isolatedMargin: IsolatedMarginState;
	fundingRates: FundingRate<string>[];
	crossMargin: CrossMarginState;
	markets: FuturesMarket<string>[];
	queryStatuses: FuturesQueryStatuses;
	dailyMarketVolumes: FuturesVolumes<string>;
	previousDayRates: Prices;
	transactionEstimations: TransactionEstimations;
	errors: FuturesErrors;
	selectedInputDenomination: InputCurrencyDenomination;
	leaderboard: {
		selectedTrader: string | undefined;
		selectedTraderPositionHistory: Record<
			CrossMarginNetwork,
			{
				[wallet: string]: FuturesPositionHistory<string>[];
			}
		>;
	};
};

export type TradePreviewResult = {
	data: FuturesPotentialTradeDetails<string> | null;
	error: string | null;
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
	priceImpact: string;
	tradeFee: string;
	// TODO: Update to map by network similar to cross margin
	positions: {
		[account: string]: FuturesPosition<string>[];
	};
	positionHistory: {
		[account: string]: FuturesPositionHistory<string>[];
	};
	openOrders: {
		[account: string]: DelayedOrder<string>[];
	};
	trades: {
		[account: string]: FuturesTrade<string>[];
	};
};

export type ModifyIsolatedPositionInputs = {
	sizeDelta: Wei;
	delayed: boolean;
	offchain: boolean;
};

export type CancelDelayedOrderInputs = {
	marketAddress: string;
	isOffchain: boolean;
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

export const futuresPositionHistoryKeys = new Set([
	'size',
	'feesPaid',
	'netFunding',
	'netTransfers',
	'totalDeposits',
	'initialMargin',
	'margin',
	'entryPrice',
	'avgEntryPrice',
	'exitPrice',
	'leverage',
	'pnl',
	'pnlWithFeesPaid',
	'totalVolume',
]);
