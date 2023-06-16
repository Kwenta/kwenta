import { BigNumber } from '@ethersproject/bignumber';
import Wei from '@synthetixio/wei';
import { IContext } from '../context';
import { IPerpsV2MarketConsolidated } from '../contracts/types/PerpsV2Market';
import { NetworkId, PriceServer } from '../types/common';
import { DelayedOrder, SmartMarginOrderType, FundingRateUpdate, FuturesMarketAsset, FuturesMarketKey, ConditionalOrder, FuturesOrderType, FuturesOrderTypeDisplay, FuturesPosition, FuturesPositionHistory, FuturesPotentialTradeDetails, FuturesTrade, FuturesVolumes, PositionDetail, PositionSide, PostTradeDetailsResponse, PotentialTradeStatus, MarginTransfer, ConditionalOrderTypeEnum } from '../types/futures';
import { FuturesAggregateStatResult, FuturesPositionResult, FuturesTradeResult, FuturesMarginTransferResult, CrossMarginAccountTransferResult } from '../utils/subgraph';
export declare const getFuturesEndpoint: (networkId: number) => string;
export declare const getMainEndpoint: (networkId: number) => string;
export declare const calculateFundingRate: (minTimestamp: number, periodLength: number, fundingRates: FundingRateUpdate[], assetPrice: Wei, currentFundingRate: Wei) => Wei | null;
export declare const marketsForNetwork: (networkId: number, logError: IContext['logError']) => import("../types/futures").FuturesMarketConfig[];
export declare const getMarketName: (asset: FuturesMarketAsset | null) => string;
export declare const getDisplayAsset: (asset: string | null) => string | null;
export declare const calculateVolumes: (futuresHourlyStats: FuturesAggregateStatResult[]) => FuturesVolumes;
export declare const mapFuturesPosition: (positionDetail: PositionDetail, canLiquidatePosition: boolean, asset: FuturesMarketAsset, marketKey: FuturesMarketKey) => FuturesPosition;
export declare const mapFuturesPositions: (futuresPositions: FuturesPositionResult[]) => FuturesPositionHistory[];
export declare const serializePotentialTrade: (preview: FuturesPotentialTradeDetails) => FuturesPotentialTradeDetails<string>;
export declare const unserializePotentialTrade: (preview: FuturesPotentialTradeDetails<string>) => FuturesPotentialTradeDetails;
export declare const formatDelayedOrder: (account: string, marketAddress: string, order: IPerpsV2MarketConsolidated.DelayedOrderStructOutput) => DelayedOrder;
export declare const formatPotentialTrade: (preview: PostTradeDetailsResponse, skewAdjustedPrice: Wei, nativeSizeDelta: Wei, leverageSide: PositionSide) => {
    fee: Wei;
    liqPrice: Wei;
    margin: Wei;
    price: Wei;
    size: Wei;
    sizeDelta: Wei;
    side: PositionSide;
    leverage: Wei;
    notionalValue: Wei;
    status: number;
    showStatus: boolean;
    statusMessage: string;
    priceImpact: Wei;
    exceedsPriceProtection: boolean;
};
export declare const getTradeStatusMessage: (status: PotentialTradeStatus) => string;
export declare const POTENTIAL_TRADE_STATUS_TO_MESSAGE: {
    [key: string]: string;
};
export declare const getPythNetworkUrl: (networkId: NetworkId, server?: PriceServer) => "https://xc-testnet.pyth.network" | "https://price.kwenta.io" | "https://xc-mainnet.pyth.network";
export declare const normalizePythId: (id: string) => string;
export type ConditionalOrderResult = {
    conditionalOrderType: number;
    desiredFillPrice: BigNumber;
    gelatoTaskId: string;
    marginDelta: BigNumber;
    marketKey: string;
    reduceOnly: boolean;
    sizeDelta: BigNumber;
    targetPrice: BigNumber;
};
export declare const mapConditionalOrderFromContract: (orderDetails: ConditionalOrderResult & {
    id: number;
}, account: string) => ConditionalOrder;
export declare const OrderNameByType: Record<FuturesOrderType, FuturesOrderTypeDisplay>;
export declare const mapTrades: (futuresTrades: FuturesTradeResult[]) => FuturesTrade[];
export declare const mapMarginTransfers: (marginTransfers: FuturesMarginTransferResult[]) => MarginTransfer[];
export declare const mapSmartMarginTransfers: (marginTransfers: CrossMarginAccountTransferResult[]) => MarginTransfer[];
type TradeInputParams = {
    marginDelta: Wei;
    sizeDelta: Wei;
    price: Wei;
    desiredFillPrice: Wei;
};
export declare const encodeConditionalOrderParams: (marketKey: FuturesMarketKey, tradeInputs: TradeInputParams, type: ConditionalOrderTypeEnum, reduceOnly: boolean) => string;
export declare const encodeSubmitOffchainOrderParams: (marketAddress: string, sizeDelta: Wei, desiredFillPrice: Wei) => string;
export declare const encodeCloseOffchainOrderParams: (marketAddress: string, desiredFillPrice: Wei) => string;
export declare const encodeModidyMarketMarginParams: (marketAddress: string, marginDelta: Wei) => string;
export declare const formatOrderDisplayType: (orderType: ConditionalOrderTypeEnum, reduceOnly: boolean) => "Limit" | "Stop" | "Take Profit" | "Stop Loss";
export declare const calculateDesiredFillPrice: (sizeDelta: Wei, marketPrice: Wei, priceImpactPercent: Wei) => Wei;
export declare const getDefaultPriceImpact: (orderType: SmartMarginOrderType) => Wei;
export declare const appAdjustedLeverage: (marketLeverage: Wei) => Wei;
export declare const MarketAssetByKey: Record<FuturesMarketKey, FuturesMarketAsset>;
export declare const MarketKeyByAsset: Record<FuturesMarketAsset, FuturesMarketKey>;
export declare const AssetDisplayByAsset: Record<FuturesMarketAsset, string>;
export declare const marketOverrides: Partial<Record<FuturesMarketKey, Record<string, any>>>;
export {};