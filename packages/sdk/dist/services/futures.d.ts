import Wei from '@synthetixio/wei';
import { ethers } from 'ethers';
import { BigNumber } from '@ethersproject/bignumber';
import KwentaSDK from '..';
import { Period } from '../constants/period';
import PerpsV2MarketInternal from '../contracts/PerpsV2MarketInternalV2';
import { NetworkId, NetworkOverrideOptions } from '../types/common';
import { FundingRateResponse, FuturesMarket, FuturesMarketAsset, FuturesMarketKey, FuturesVolumes, ContractOrderType, PositionSide, MarginTransfer, MarketWithIdleMargin, SmartMarginOrderInputs, FuturesAccountType, SLTPOrderInputs } from '../types/futures';
import { PricesMap } from '../types/prices';
export default class FuturesService {
    private sdk;
    markets: FuturesMarket[] | undefined;
    internalFuturesMarkets: Partial<Record<NetworkId, {
        [marketAddress: string]: PerpsV2MarketInternal;
    }>>;
    constructor(sdk: KwentaSDK);
    get futuresGqlEndpoint(): string;
    getMarkets(networkOverride?: NetworkOverrideOptions): Promise<FuturesMarket[]>;
    getFuturesPositions(address: string, // Cross margin or EOA address
    futuresMarkets: {
        asset: FuturesMarketAsset;
        marketKey: FuturesMarketKey;
        address: string;
    }[]): Promise<import("../types/futures").FuturesPosition[]>;
    getMarketFundingRatesHistory(marketAsset: FuturesMarketAsset, periodLength?: number): Promise<any>;
    getAverageFundingRates(markets: FuturesMarket[], prices: PricesMap, period: Period): Promise<FundingRateResponse[]>;
    getDailyVolumes(): Promise<FuturesVolumes>;
    getCrossMarginAccounts(walletAddress?: string | null): Promise<string[]>;
    getIsolatedMarginTransfers(walletAddress?: string | null): Promise<MarginTransfer[]>;
    getCrossMarginTransfers(walletAddress?: string | null): Promise<MarginTransfer[]>;
    getCrossMarginAccountBalance(crossMarginAddress: string): Promise<Wei>;
    getCrossMarginBalanceInfo(walletAddress: string, crossMarginAddress: string): Promise<{
        freeMargin: Wei;
        keeperEthBal: Wei;
        walletEthBal: Wei;
        allowance: Wei;
    }>;
    getConditionalOrders(account: string): Promise<import("../types/futures").ConditionalOrder[]>;
    getDelayedOrder(account: string, marketAddress: string): Promise<import("../types/futures").DelayedOrder>;
    getDelayedOrders(account: string, marketAddresses: string[]): Promise<import("../types/futures").DelayedOrder[]>;
    getIsolatedTradePreview(marketAddress: string, marketKey: FuturesMarketKey, orderType: ContractOrderType, inputs: {
        sizeDelta: Wei;
        price: Wei;
        leverageSide: PositionSide;
    }): Promise<{
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
    }>;
    getCrossMarginTradePreview(crossMarginAccount: string, marketKey: FuturesMarketKey, marketAddress: string, tradeParams: {
        sizeDelta: Wei;
        marginDelta: Wei;
        orderPrice: Wei;
        leverageSide: PositionSide;
    }): Promise<{
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
    }>;
    getCrossMarginKeeperBalance(account: string): Promise<Wei>;
    getPositionHistory(walletAddress: string): Promise<import("../types/futures").FuturesPositionHistory[]>;
    getCompletePositionHistory(walletAddress: string): Promise<import("../types/futures").FuturesPositionHistory[]>;
    getTradesForMarket(marketAsset: FuturesMarketAsset, walletAddress: string, accountType: FuturesAccountType, pageLength?: number): Promise<import("../types/futures").FuturesTrade[]>;
    getAllTrades(walletAddress: string, accountType: FuturesAccountType, pageLength?: number): Promise<import("../types/futures").FuturesTrade[]>;
    getIdleMarginInMarkets(accountOrEoa: string): Promise<{
        totalIdleInMarkets: Wei;
        marketsWithIdleMargin: MarketWithIdleMargin[];
    }>;
    getIdleMargin(eoa: string, account?: string): Promise<{
        total: Wei;
        marketsTotal: Wei;
        walletTotal: Wei;
        marketsWithMargin: MarketWithIdleMargin[];
    }>;
    getFuturesTrades(marketKey: FuturesMarketKey, minTs: number, maxTs: number): Promise<import("../types/futures").FuturesTrade[] | null>;
    getOrderFee(marketAddress: string, size: Wei): Promise<Wei>;
    approveCrossMarginDeposit(crossMarginAddress: string, amount?: BigNumber): Promise<ethers.providers.TransactionResponse>;
    depositCrossMarginAccount(crossMarginAddress: string, amount: Wei): Promise<ethers.providers.TransactionResponse>;
    withdrawCrossMarginAccount(crossMarginAddress: string, amount: Wei): Promise<ethers.providers.TransactionResponse>;
    modifySmartMarginMarketMargin(crossMarginAddress: string, marketAddress: string, marginDelta: Wei): Promise<ethers.providers.TransactionResponse>;
    modifySmartMarginPositionSize(crossMarginAddress: string, market: {
        key: FuturesMarketKey;
        address: string;
    }, sizeDelta: Wei, desiredFillPrice: Wei, cancelPendingReduceOrders?: boolean): Promise<ethers.providers.TransactionResponse>;
    depositIsolatedMargin(marketAddress: string, amount: Wei): Promise<ethers.providers.TransactionResponse>;
    withdrawIsolatedMargin(marketAddress: string, amount: Wei): Promise<ethers.providers.TransactionResponse>;
    closeIsolatedPosition(marketAddress: string, priceImpactDelta: Wei): Promise<ethers.ContractTransaction>;
    submitIsolatedMarginOrder(marketAddress: string, sizeDelta: Wei, priceImpactDelta: Wei): Promise<ethers.providers.TransactionResponse>;
    cancelDelayedOrder(marketAddress: string, account: string, isOffchain: boolean): Promise<ethers.ContractTransaction>;
    executeDelayedOrder(marketAddress: string, account: string): Promise<ethers.ContractTransaction>;
    executeDelayedOffchainOrder(marketKey: FuturesMarketKey, marketAddress: string, account: string): Promise<ethers.ContractTransaction>;
    createCrossMarginAccount(): Promise<ethers.providers.TransactionResponse>;
    submitCrossMarginOrder(market: {
        key: FuturesMarketKey;
        address: string;
    }, walletAddress: string, crossMarginAddress: string, order: SmartMarginOrderInputs, options?: {
        cancelPendingReduceOrders?: boolean;
        cancelExpiredDelayedOrders?: boolean;
    }): Promise<ethers.providers.TransactionResponse>;
    closeCrossMarginPosition(market: {
        address: string;
        key: FuturesMarketKey;
    }, crossMarginAddress: string, desiredFillPrice: Wei): Promise<ethers.providers.TransactionResponse>;
    cancelConditionalOrder(crossMarginAddress: string, orderId: number): Promise<ethers.providers.TransactionResponse>;
    withdrawAccountKeeperBalance(crossMarginAddress: string, amount: Wei): Promise<ethers.providers.TransactionResponse>;
    updateStopLossAndTakeProfit(marketKey: FuturesMarketKey, crossMarginAddress: string, params: SLTPOrderInputs): Promise<ethers.providers.TransactionResponse>;
    getSkewAdjustedPrice: (price: Wei, marketAddress: string, marketKey: string) => Promise<Wei>;
    private getInternalFuturesMarket;
    private batchIdleMarketMarginSweeps;
}
