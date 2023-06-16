import KwentaSDK from '..';
import { FuturesMarketAsset, FuturesMarketKey } from '../types/futures';
import { FuturesAccountType } from '../utils/subgraph';
export declare const queryAccountsFromSubgraph: (sdk: KwentaSDK, walletAddress: string | null) => Promise<string[]>;
export declare const queryCrossMarginAccounts: (sdk: KwentaSDK, walletAddress: string) => Promise<string[]>;
export declare const queryTrades: (sdk: KwentaSDK, params: {
    walletAddress: string;
    accountType: FuturesAccountType;
    marketAsset?: string;
    pageLength: number;
}) => Promise<Pick<import("../utils/subgraph").FuturesTradeResult, "account" | "trackingCode" | "timestamp" | "marketKey" | "id" | "size" | "price" | "margin" | "orderType" | "pnl" | "asset" | "abstractAccount" | "accountType" | "positionId" | "positionSize" | "positionClosed" | "feesPaid" | "fundingAccrued" | "keeperFeesPaid">[]>;
export declare const queryPositionHistory: (sdk: KwentaSDK, account: string) => Promise<Pick<import("../utils/subgraph").FuturesPositionResult, "account" | "timestamp" | "marketKey" | "id" | "size" | "margin" | "lastPrice" | "fundingIndex" | "netFunding" | "pnl" | "market" | "asset" | "trades" | "abstractAccount" | "accountType" | "feesPaid" | "lastTxHash" | "openTimestamp" | "closeTimestamp" | "isOpen" | "isLiquidated" | "netTransfers" | "totalDeposits" | "initialMargin" | "entryPrice" | "exitPrice" | "pnlWithFeesPaid" | "totalVolume" | "avgEntryPrice">[]>;
export declare const queryCompletePositionHistory: (sdk: KwentaSDK, account: string) => Promise<Pick<import("../utils/subgraph").FuturesPositionResult, "account" | "timestamp" | "marketKey" | "id" | "size" | "margin" | "lastPrice" | "fundingIndex" | "netFunding" | "pnl" | "market" | "asset" | "trades" | "abstractAccount" | "accountType" | "feesPaid" | "lastTxHash" | "openTimestamp" | "closeTimestamp" | "isOpen" | "isLiquidated" | "netTransfers" | "totalDeposits" | "initialMargin" | "entryPrice" | "exitPrice" | "pnlWithFeesPaid" | "totalVolume" | "avgEntryPrice">[]>;
export declare const queryIsolatedMarginTransfers: (sdk: KwentaSDK, account: string) => Promise<import("../types/futures").MarginTransfer[]>;
export declare const querySmartMarginTransfers: (sdk: KwentaSDK, account: string) => Promise<import("../types/futures").MarginTransfer[]>;
export declare const queryFuturesTrades: (sdk: KwentaSDK, marketKey: FuturesMarketKey, minTs: number, maxTs: number) => Promise<Pick<import("../utils/subgraph").FuturesTradeResult, "account" | "trackingCode" | "timestamp" | "marketKey" | "id" | "size" | "price" | "margin" | "orderType" | "pnl" | "asset" | "abstractAccount" | "accountType" | "positionId" | "positionSize" | "positionClosed" | "feesPaid" | "fundingAccrued" | "keeperFeesPaid">[]>;
export declare const queryFundingRateHistory: (sdk: KwentaSDK, marketAsset: FuturesMarketAsset, minTimestamp: number, period?: 'Hourly' | 'Daily') => Promise<any>;
