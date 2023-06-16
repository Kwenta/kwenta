"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wei_1 = require("@synthetixio/wei");
const ethcall_1 = require("ethcall");
const ethers_1 = require("ethers");
const bignumber_1 = require("@ethersproject/bignumber");
const utils_1 = require("ethers/lib/utils");
const strings_1 = require("@ethersproject/strings");
const graphql_request_1 = __importStar(require("graphql-request"));
const lodash_1 = require("lodash");
const errors_1 = require("../common/errors");
const futures_1 = require("../constants/futures");
const period_1 = require("../constants/period");
const contracts_1 = require("../contracts");
const PerpsV2Market_json_1 = __importDefault(require("../contracts/abis/PerpsV2Market.json"));
const SmartMarginAccount_json_1 = __importDefault(require("../contracts/abis/SmartMarginAccount.json"));
const PerpsV2MarketInternalV2_1 = __importDefault(require("../contracts/PerpsV2MarketInternalV2"));
const types_1 = require("../contracts/types");
const futures_2 = require("../queries/futures");
const futures_3 = require("../types/futures");
const date_1 = require("../utils/date");
const futures_4 = require("../utils/futures");
const subgraph_1 = require("../utils/subgraph");
const synths_1 = require("../utils/synths");
class FuturesService {
    constructor(sdk) {
        this.internalFuturesMarkets = {};
        this.getSkewAdjustedPrice = (price, marketAddress, marketKey) => __awaiter(this, void 0, void 0, function* () {
            const marketContract = new ethcall_1.Contract(marketAddress, PerpsV2Market_json_1.default);
            const { PerpsV2MarketSettings } = this.sdk.context.multicallContracts;
            if (!PerpsV2MarketSettings)
                throw new Error(errors_1.UNSUPPORTED_NETWORK);
            const [marketSkew, skewScale] = yield this.sdk.context.multicallProvider.all([
                marketContract.marketSkew(),
                PerpsV2MarketSettings.skewScale((0, strings_1.formatBytes32String)(marketKey)),
            ]);
            const skewWei = (0, wei_1.wei)(marketSkew);
            const scaleWei = (0, wei_1.wei)(skewScale);
            return price.mul(skewWei.div(scaleWei).add(1));
        });
        this.sdk = sdk;
    }
    get futuresGqlEndpoint() {
        return (0, futures_4.getFuturesEndpoint)(this.sdk.context.networkId);
    }
    getMarkets(networkOverride) {
        return __awaiter(this, void 0, void 0, function* () {
            const enabledMarkets = (0, futures_4.marketsForNetwork)((networkOverride === null || networkOverride === void 0 ? void 0 : networkOverride.networkId) || this.sdk.context.networkId, this.sdk.context.logError);
            const contracts = networkOverride && (networkOverride === null || networkOverride === void 0 ? void 0 : networkOverride.networkId) !== this.sdk.context.networkId
                ? (0, contracts_1.getContractsByNetwork)(networkOverride.networkId, networkOverride.provider)
                : this.sdk.context.contracts;
            const { SystemStatus } = contracts;
            const { ExchangeRates, PerpsV2MarketData, PerpsV2MarketSettings, } = this.sdk.context.multicallContracts;
            if (!SystemStatus || !ExchangeRates || !PerpsV2MarketData || !PerpsV2MarketSettings) {
                throw new Error(errors_1.UNSUPPORTED_NETWORK);
            }
            const futuresData = yield this.sdk.context.multicallProvider.all([
                PerpsV2MarketData.allProxiedMarketSummaries(),
                PerpsV2MarketSettings.minInitialMargin(),
                PerpsV2MarketSettings.minKeeperFee(),
            ]);
            const { markets, minInitialMargin, minKeeperFee } = {
                markets: futuresData[0],
                minInitialMargin: futuresData[1],
                minKeeperFee: futuresData[2],
            };
            const filteredMarkets = markets.filter((m) => {
                const marketKey = (0, strings_1.parseBytes32String)(m.key);
                const market = enabledMarkets.find((market) => {
                    return marketKey === market.key;
                });
                return !!market;
            });
            const marketKeys = filteredMarkets.map((m) => {
                return m.key;
            });
            const parametersCalls = marketKeys.map((key) => PerpsV2MarketSettings.parameters(key));
            let marketParameters = [];
            if (this.sdk.context.isMainnet) {
                marketParameters = yield this.sdk.context.multicallProvider.all(parametersCalls);
            }
            else {
                const firstResponses = yield this.sdk.context.multicallProvider.all(parametersCalls.slice(0, 20));
                const secondResponses = yield this.sdk.context.multicallProvider.all(parametersCalls.slice(20, parametersCalls.length));
                marketParameters = [
                    ...firstResponses,
                    ...secondResponses,
                ];
            }
            const { suspensions, reasons } = yield SystemStatus.getFuturesMarketSuspensions(marketKeys);
            const futuresMarkets = filteredMarkets.map(({ market, key, asset, currentFundingRate, currentFundingVelocity, feeRates, marketDebt, marketSkew, maxLeverage, marketSize, price, }, i) => ({
                market,
                marketKey: (0, strings_1.parseBytes32String)(key),
                marketName: (0, futures_4.getMarketName)((0, strings_1.parseBytes32String)(asset)),
                asset: (0, strings_1.parseBytes32String)(asset),
                assetHex: asset,
                currentFundingRate: (0, wei_1.wei)(currentFundingRate).div(24),
                currentFundingVelocity: (0, wei_1.wei)(currentFundingVelocity).div(24 * 24),
                feeRates: {
                    makerFee: (0, wei_1.wei)(feeRates.makerFee),
                    takerFee: (0, wei_1.wei)(feeRates.takerFee),
                    makerFeeDelayedOrder: (0, wei_1.wei)(feeRates.makerFeeDelayedOrder),
                    takerFeeDelayedOrder: (0, wei_1.wei)(feeRates.takerFeeDelayedOrder),
                    makerFeeOffchainDelayedOrder: (0, wei_1.wei)(feeRates.makerFeeOffchainDelayedOrder),
                    takerFeeOffchainDelayedOrder: (0, wei_1.wei)(feeRates.takerFeeOffchainDelayedOrder),
                },
                openInterest: {
                    shortPct: (0, wei_1.wei)(marketSize).eq(0)
                        ? 0
                        : (0, wei_1.wei)(marketSize).sub(marketSkew).div('2').div(marketSize).toNumber(),
                    longPct: (0, wei_1.wei)(marketSize).eq(0)
                        ? 0
                        : (0, wei_1.wei)(marketSize).add(marketSkew).div('2').div(marketSize).toNumber(),
                    shortUSD: (0, wei_1.wei)(marketSize).eq(0)
                        ? (0, wei_1.wei)(0)
                        : (0, wei_1.wei)(marketSize).sub(marketSkew).div('2').mul(price),
                    longUSD: (0, wei_1.wei)(marketSize).eq(0)
                        ? (0, wei_1.wei)(0)
                        : (0, wei_1.wei)(marketSize).add(marketSkew).div('2').mul(price),
                    long: (0, wei_1.wei)(marketSize).add(marketSkew).div('2'),
                    short: (0, wei_1.wei)(marketSize).sub(marketSkew).div('2'),
                },
                marketDebt: (0, wei_1.wei)(marketDebt),
                marketSkew: (0, wei_1.wei)(marketSkew),
                contractMaxLeverage: (0, wei_1.wei)(maxLeverage),
                appMaxLeverage: (0, futures_4.appAdjustedLeverage)((0, wei_1.wei)(maxLeverage)),
                marketSize: (0, wei_1.wei)(marketSize),
                marketLimitUsd: (0, wei_1.wei)(marketParameters[i].maxMarketValue).mul((0, wei_1.wei)(price)),
                marketLimitNative: (0, wei_1.wei)(marketParameters[i].maxMarketValue),
                minInitialMargin: (0, wei_1.wei)(minInitialMargin),
                keeperDeposit: (0, wei_1.wei)(minKeeperFee),
                isSuspended: suspensions[i],
                marketClosureReason: (0, synths_1.getReasonFromCode)(reasons[i]),
                settings: {
                    maxMarketValue: (0, wei_1.wei)(marketParameters[i].maxMarketValue),
                    skewScale: (0, wei_1.wei)(marketParameters[i].skewScale),
                    delayedOrderConfirmWindow: (0, wei_1.wei)(marketParameters[i].delayedOrderConfirmWindow, 0).toNumber(),
                    offchainDelayedOrderMinAge: (0, wei_1.wei)(marketParameters[i].offchainDelayedOrderMinAge, 0).toNumber(),
                    offchainDelayedOrderMaxAge: (0, wei_1.wei)(marketParameters[i].offchainDelayedOrderMaxAge, 0).toNumber(),
                    minDelayTimeDelta: (0, wei_1.wei)(marketParameters[i].minDelayTimeDelta, 0).toNumber(),
                    maxDelayTimeDelta: (0, wei_1.wei)(marketParameters[i].maxDelayTimeDelta, 0).toNumber(),
                },
            }));
            return futuresMarkets;
        });
    }
    // TODO: types
    // TODO: Improve the API for fetching positions
    getFuturesPositions(address, // Cross margin or EOA address
    futuresMarkets) {
        return __awaiter(this, void 0, void 0, function* () {
            const marketDataContract = this.sdk.context.multicallContracts.PerpsV2MarketData;
            if (!this.sdk.context.isL2 || !marketDataContract) {
                throw new Error(errors_1.UNSUPPORTED_NETWORK);
            }
            const positionCalls = [];
            const liquidationCalls = [];
            for (const { address: marketAddress, marketKey } of futuresMarkets) {
                positionCalls.push(marketDataContract.positionDetailsForMarketKey((0, strings_1.formatBytes32String)(marketKey), address));
                const marketContract = new ethcall_1.Contract(marketAddress, PerpsV2Market_json_1.default);
                liquidationCalls.push(marketContract.canLiquidate(address));
            }
            // TODO: Combine these two?
            const positionDetails = (yield this.sdk.context.multicallProvider.all(positionCalls));
            const canLiquidateState = (yield this.sdk.context.multicallProvider.all(liquidationCalls));
            // map the positions using the results
            const positions = yield Promise.all(positionDetails.map((position, ind) => __awaiter(this, void 0, void 0, function* () {
                const canLiquidate = canLiquidateState[ind];
                const marketKey = futuresMarkets[ind].marketKey;
                const asset = futuresMarkets[ind].asset;
                return (0, futures_4.mapFuturesPosition)(position, canLiquidate, asset, marketKey);
            })));
            return positions;
        });
    }
    getMarketFundingRatesHistory(marketAsset, periodLength = period_1.PERIOD_IN_SECONDS.TWO_WEEKS) {
        return __awaiter(this, void 0, void 0, function* () {
            const minTimestamp = Math.floor(Date.now() / 1000) - periodLength;
            return (0, futures_2.queryFundingRateHistory)(this.sdk, marketAsset, minTimestamp);
        });
    }
    getAverageFundingRates(markets, prices, period) {
        return __awaiter(this, void 0, void 0, function* () {
            const fundingRateInputs = markets.map(({ asset, market, currentFundingRate }) => {
                const price = prices[asset];
                return {
                    marketAddress: market,
                    marketKey: futures_4.MarketKeyByAsset[asset],
                    price: price,
                    currentFundingRate: currentFundingRate,
                };
            });
            const fundingRateQueries = fundingRateInputs.map(({ marketAddress, marketKey }) => {
                return (0, graphql_request_1.gql) `
					# last before timestamp
					${marketKey}_first: fundingRateUpdates(
						first: 1
						where: { market: "${marketAddress}", timestamp_lt: $minTimestamp }
						orderBy: sequenceLength
						orderDirection: desc
					) {
						timestamp
						funding
					}

					# first after timestamp
					${marketKey}_next: fundingRateUpdates(
						first: 1
						where: { market: "${marketAddress}", timestamp_gt: $minTimestamp }
						orderBy: sequenceLength
						orderDirection: asc
					) {
						timestamp
						funding
					}

					# latest update
					${marketKey}_latest: fundingRateUpdates(
						first: 1
						where: { market: "${marketAddress}" }
						orderBy: sequenceLength
						orderDirection: desc
					) {
						timestamp
						funding
					}
				`;
            });
            const periodLength = period_1.PERIOD_IN_SECONDS[period];
            const minTimestamp = Math.floor(Date.now() / 1000) - periodLength;
            const marketFundingResponses = yield (0, graphql_request_1.default)(this.futuresGqlEndpoint, (0, graphql_request_1.gql) `
			query fundingRateUpdates($minTimestamp: BigInt!) {
				${fundingRateQueries.reduce((acc, curr) => {
                return acc + curr;
            })}
			}
		`, { minTimestamp: minTimestamp });
            const periodTitle = period === period_1.Period.ONE_HOUR ? '1H Funding Rate' : 'Funding Rate';
            const fundingRateResponses = fundingRateInputs.map(({ marketKey, currentFundingRate, price }) => {
                if (!price)
                    return null;
                const marketResponses = [
                    marketFundingResponses[`${marketKey}_first`],
                    marketFundingResponses[`${marketKey}_next`],
                    marketFundingResponses[`${marketKey}_latest`],
                ];
                const responseFilt = marketResponses
                    .filter((value) => value.length > 0)
                    .map((entry) => entry[0])
                    .sort((a, b) => a.timestamp - b.timestamp);
                const fundingRate = responseFilt && !!currentFundingRate
                    ? (0, futures_4.calculateFundingRate)(minTimestamp, periodLength, responseFilt, price, currentFundingRate)
                    : currentFundingRate !== null && currentFundingRate !== void 0 ? currentFundingRate : null;
                const fundingPeriod = responseFilt && !!currentFundingRate ? periodTitle : 'Inst. Funding Rate';
                const fundingRateResponse = {
                    asset: marketKey,
                    fundingTitle: fundingPeriod,
                    fundingRate: fundingRate,
                };
                return fundingRateResponse;
            });
            return fundingRateResponses.filter((funding) => !!funding);
        });
    }
    getDailyVolumes() {
        return __awaiter(this, void 0, void 0, function* () {
            const minTimestamp = Math.floor((0, date_1.calculateTimestampForPeriod)(period_1.PERIOD_IN_HOURS.ONE_DAY) / 1000);
            const response = yield (0, subgraph_1.getFuturesAggregateStats)(this.futuresGqlEndpoint, {
                first: 999999,
                where: {
                    period: `${period_1.PERIOD_IN_SECONDS.ONE_HOUR}`,
                    timestamp_gte: `${minTimestamp}`,
                },
            }, {
                id: true,
                marketKey: true,
                asset: true,
                volume: true,
                trades: true,
                timestamp: true,
                period: true,
                feesCrossMarginAccounts: true,
                feesKwenta: true,
                feesSynthetix: true,
            });
            return response ? (0, futures_4.calculateVolumes)(response) : {};
        });
    }
    getCrossMarginAccounts(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = walletAddress !== null && walletAddress !== void 0 ? walletAddress : this.sdk.context.walletAddress;
            return yield (0, futures_2.queryCrossMarginAccounts)(this.sdk, address);
        });
    }
    getIsolatedMarginTransfers(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = walletAddress !== null && walletAddress !== void 0 ? walletAddress : this.sdk.context.walletAddress;
            return (0, futures_2.queryIsolatedMarginTransfers)(this.sdk, address);
        });
    }
    getCrossMarginTransfers(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const address = walletAddress !== null && walletAddress !== void 0 ? walletAddress : this.sdk.context.walletAddress;
            return (0, futures_2.querySmartMarginTransfers)(this.sdk, address);
        });
    }
    getCrossMarginAccountBalance(crossMarginAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const crossMarginAccountContract = types_1.SmartMarginAccount__factory.connect(crossMarginAddress, this.sdk.context.provider);
            const freeMargin = yield crossMarginAccountContract.freeMargin();
            return (0, wei_1.wei)(freeMargin);
        });
    }
    getCrossMarginBalanceInfo(walletAddress, crossMarginAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const crossMarginAccountContract = types_1.SmartMarginAccount__factory.connect(crossMarginAddress, this.sdk.context.provider);
            const { SUSD } = this.sdk.context.contracts;
            if (!SUSD)
                throw new Error(errors_1.UNSUPPORTED_NETWORK);
            // TODO: EthCall
            const [freeMargin, keeperEthBal, walletEthBal, allowance] = yield Promise.all([
                crossMarginAccountContract.freeMargin(),
                this.sdk.context.provider.getBalance(crossMarginAddress),
                this.sdk.context.provider.getBalance(walletAddress),
                SUSD.allowance(walletAddress, crossMarginAccountContract.address),
            ]);
            return {
                freeMargin: (0, wei_1.wei)(freeMargin),
                keeperEthBal: (0, wei_1.wei)(keeperEthBal),
                walletEthBal: (0, wei_1.wei)(walletEthBal),
                allowance: (0, wei_1.wei)(allowance),
            };
        });
    }
    getConditionalOrders(account) {
        return __awaiter(this, void 0, void 0, function* () {
            const crossMarginAccountMultiCall = new ethcall_1.Contract(account, SmartMarginAccount_json_1.default);
            const crossMarginAccountContract = types_1.SmartMarginAccount__factory.connect(account, this.sdk.context.provider);
            const orders = [];
            const orderIdBigNum = yield crossMarginAccountContract.conditionalOrderId();
            const orderId = orderIdBigNum.toNumber();
            // Limit to the latest 500
            const start = orderId > futures_1.ORDERS_FETCH_SIZE ? orderId - futures_1.ORDERS_FETCH_SIZE : 0;
            const orderCalls = Array(orderId)
                .fill(0)
                .map((_, i) => crossMarginAccountMultiCall.getConditionalOrder(start + i));
            const contractOrders = (yield this.sdk.context.multicallProvider.all(orderCalls));
            for (let i = 0; i < orderId; i++) {
                const contractOrder = contractOrders[i];
                // Checks if the order is still pending
                // Orders are never removed but all values set to zero so we check a zero value on price to filter pending
                if (contractOrder && contractOrder.targetPrice.gt(0)) {
                    const order = (0, futures_4.mapConditionalOrderFromContract)(Object.assign(Object.assign({}, contractOrder), { id: start + i }), account);
                    orders.push(order);
                }
            }
            return (0, lodash_1.orderBy)(orders, ['id'], 'desc');
        });
    }
    // Perps V2 read functions
    getDelayedOrder(account, marketAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = types_1.PerpsV2Market__factory.connect(marketAddress, this.sdk.context.provider);
            const order = yield market.delayedOrders(account);
            return (0, futures_4.formatDelayedOrder)(account, marketAddress, order);
        });
    }
    getDelayedOrders(account, marketAddresses) {
        return __awaiter(this, void 0, void 0, function* () {
            const marketContracts = marketAddresses.map(contracts_1.getPerpsV2MarketMulticall);
            const orders = (yield this.sdk.context.multicallProvider.all(marketContracts.map((market) => market.delayedOrders(account))));
            return orders.map((order, ind) => {
                return (0, futures_4.formatDelayedOrder)(account, marketAddresses[ind], order);
            });
        });
    }
    getIsolatedTradePreview(marketAddress, marketKey, orderType, inputs) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = types_1.PerpsV2Market__factory.connect(marketAddress, this.sdk.context.provider);
            const details = yield market.postTradeDetails(inputs.sizeDelta.toBN(), inputs.price.toBN(), orderType, this.sdk.context.walletAddress);
            const skewAdjustedPrice = yield this.getSkewAdjustedPrice(inputs.price, marketAddress, marketKey);
            return (0, futures_4.formatPotentialTrade)(details, skewAdjustedPrice, inputs.sizeDelta, inputs.leverageSide);
        });
    }
    getCrossMarginTradePreview(crossMarginAccount, marketKey, marketAddress, tradeParams) {
        return __awaiter(this, void 0, void 0, function* () {
            const marketInternal = this.getInternalFuturesMarket(marketAddress, marketKey);
            const preview = yield marketInternal.getTradePreview(crossMarginAccount, tradeParams.sizeDelta.toBN(), tradeParams.marginDelta.toBN(), tradeParams.orderPrice.toBN());
            const skewAdjustedPrice = yield this.getSkewAdjustedPrice(tradeParams.orderPrice, marketAddress, marketKey);
            return (0, futures_4.formatPotentialTrade)(preview, skewAdjustedPrice, tradeParams.sizeDelta, tradeParams.leverageSide);
        });
    }
    getCrossMarginKeeperBalance(account) {
        return __awaiter(this, void 0, void 0, function* () {
            const bal = yield this.sdk.context.provider.getBalance(account);
            return (0, wei_1.wei)(bal);
        });
    }
    getPositionHistory(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, futures_2.queryPositionHistory)(this.sdk, walletAddress);
            return response ? (0, futures_4.mapFuturesPositions)(response) : [];
        });
    }
    getCompletePositionHistory(walletAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, futures_2.queryCompletePositionHistory)(this.sdk, walletAddress);
            return response ? (0, futures_4.mapFuturesPositions)(response) : [];
        });
    }
    // TODO: Support pagination
    getTradesForMarket(marketAsset, walletAddress, accountType, pageLength = 16) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, futures_2.queryTrades)(this.sdk, {
                marketAsset,
                walletAddress,
                accountType,
                pageLength,
            });
            return response ? (0, futures_4.mapTrades)(response) : [];
        });
    }
    getAllTrades(walletAddress, accountType, pageLength = 16) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, futures_2.queryTrades)(this.sdk, {
                walletAddress,
                accountType,
                pageLength,
            });
            return response ? (0, futures_4.mapTrades)(response) : [];
        });
    }
    getIdleMarginInMarkets(accountOrEoa) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const markets = (_a = this.markets) !== null && _a !== void 0 ? _a : (yield this.getMarkets());
            const filteredMarkets = markets.filter((m) => !m.isSuspended);
            const marketParams = (_b = filteredMarkets === null || filteredMarkets === void 0 ? void 0 : filteredMarkets.map((m) => ({
                asset: m.asset,
                marketKey: m.marketKey,
                address: m.market,
            }))) !== null && _b !== void 0 ? _b : [];
            const positions = yield this.getFuturesPositions(accountOrEoa, marketParams);
            const positionsWithIdleMargin = positions.filter((p) => { var _a; return !((_a = p.position) === null || _a === void 0 ? void 0 : _a.size.abs().gt(0)) && p.remainingMargin.gt(0); });
            const idleInMarkets = positionsWithIdleMargin.reduce((acc, p) => acc.add(p.remainingMargin), (0, wei_1.wei)(0));
            return {
                totalIdleInMarkets: idleInMarkets,
                marketsWithIdleMargin: positionsWithIdleMargin.reduce((acc, p) => {
                    const market = filteredMarkets.find((m) => m.marketKey === p.marketKey);
                    if (market) {
                        acc.push({
                            marketAddress: market.market,
                            marketKey: market.marketKey,
                            position: p,
                        });
                    }
                    return acc;
                }, []),
            };
        });
    }
    getIdleMargin(eoa, account) {
        return __awaiter(this, void 0, void 0, function* () {
            const idleMargin = yield this.getIdleMarginInMarkets(account || eoa);
            const { susdWalletBalance } = yield this.sdk.synths.getSynthBalances(eoa);
            return {
                total: idleMargin.totalIdleInMarkets.add(susdWalletBalance),
                marketsTotal: idleMargin.totalIdleInMarkets,
                walletTotal: susdWalletBalance,
                marketsWithMargin: idleMargin.marketsWithIdleMargin,
            };
        });
    }
    // This is on an interval of 15 seconds.
    getFuturesTrades(marketKey, minTs, maxTs) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, futures_2.queryFuturesTrades)(this.sdk, marketKey, minTs, maxTs);
            return response ? (0, futures_4.mapTrades)(response) : null;
        });
    }
    // TODO: Get delayed order fee
    getOrderFee(marketAddress, size) {
        return __awaiter(this, void 0, void 0, function* () {
            const marketContract = types_1.PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
            const orderFee = yield marketContract.orderFee(size.toBN(), 0);
            return (0, wei_1.wei)(orderFee.fee);
        });
    }
    // Contract mutations
    approveCrossMarginDeposit(crossMarginAddress, amount = bignumber_1.BigNumber.from(ethers_1.ethers.constants.MaxUint256)) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.contracts.SUSD)
                throw new Error(errors_1.UNSUPPORTED_NETWORK);
            return this.sdk.transactions.createContractTxn(this.sdk.context.contracts.SUSD, 'approve', [
                crossMarginAddress,
                amount,
            ]);
        });
    }
    depositCrossMarginAccount(crossMarginAddress, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const crossMarginAccountContract = types_1.SmartMarginAccount__factory.connect(crossMarginAddress, this.sdk.context.signer);
            return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [
                [futures_3.AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN],
                [utils_1.defaultAbiCoder.encode(['int256'], [amount.toBN()])],
            ]);
        });
    }
    withdrawCrossMarginAccount(crossMarginAddress, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const crossMarginAccountContract = types_1.SmartMarginAccount__factory.connect(crossMarginAddress, this.sdk.context.signer);
            const { commands, inputs } = yield this.batchIdleMarketMarginSweeps(crossMarginAddress);
            commands.push(futures_3.AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN);
            inputs.push(utils_1.defaultAbiCoder.encode(['int256'], [amount.neg().toBN()]));
            return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [
                commands,
                inputs,
            ]);
        });
    }
    modifySmartMarginMarketMargin(crossMarginAddress, marketAddress, marginDelta) {
        return __awaiter(this, void 0, void 0, function* () {
            const crossMarginAccountContract = types_1.SmartMarginAccount__factory.connect(crossMarginAddress, this.sdk.context.signer);
            const commands = [];
            const inputs = [];
            if (marginDelta.gt(0)) {
                const freeMargin = yield this.getCrossMarginAccountBalance(crossMarginAddress);
                if (marginDelta.gt(freeMargin)) {
                    // Margin delta bigger than account balance,
                    // need to pull some from the users wallet or idle margin
                    const { commands: sweepCommands, inputs: sweepInputs, idleMargin, } = yield this.batchIdleMarketMarginSweeps(crossMarginAddress);
                    commands.push(...sweepCommands);
                    inputs.push(...sweepInputs);
                    const totalFreeMargin = idleMargin.totalIdleInMarkets.add(freeMargin);
                    const depositAmount = marginDelta.gt(totalFreeMargin)
                        ? marginDelta.sub(totalFreeMargin).abs()
                        : (0, wei_1.wei)(0);
                    if (depositAmount.gt(0)) {
                        // If we don't have enough from idle market margin then we pull from the wallet
                        commands.push(futures_3.AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN);
                        inputs.push(utils_1.defaultAbiCoder.encode(['int256'], [depositAmount.toBN()]));
                    }
                }
            }
            commands.push(futures_3.AccountExecuteFunctions.PERPS_V2_MODIFY_MARGIN);
            inputs.push((0, futures_4.encodeModidyMarketMarginParams)(marketAddress, marginDelta));
            return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [
                commands,
                inputs,
            ]);
        });
    }
    modifySmartMarginPositionSize(crossMarginAddress, market, sizeDelta, desiredFillPrice, cancelPendingReduceOrders) {
        return __awaiter(this, void 0, void 0, function* () {
            const commands = [];
            const inputs = [];
            if (cancelPendingReduceOrders) {
                const existingOrders = yield this.getConditionalOrders(crossMarginAddress);
                const existingOrdersForMarket = existingOrders.filter((o) => o.marketKey === market.key && o.reduceOnly);
                // Remove all pending reduce only orders if instructed
                existingOrdersForMarket.forEach((o) => {
                    commands.push(futures_3.AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER);
                    inputs.push(utils_1.defaultAbiCoder.encode(['uint256'], [o.id]));
                });
            }
            const crossMarginAccountContract = types_1.SmartMarginAccount__factory.connect(crossMarginAddress, this.sdk.context.signer);
            commands.push(futures_3.AccountExecuteFunctions.PERPS_V2_SUBMIT_OFFCHAIN_DELAYED_ORDER);
            inputs.push((0, futures_4.encodeSubmitOffchainOrderParams)(market.address, sizeDelta, desiredFillPrice));
            return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [
                commands,
                inputs,
            ]);
        });
    }
    depositIsolatedMargin(marketAddress, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = types_1.PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
            const txn = this.sdk.transactions.createContractTxn(market, 'transferMargin', [amount.toBN()]);
            return txn;
        });
    }
    withdrawIsolatedMargin(marketAddress, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = types_1.PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
            const txn = this.sdk.transactions.createContractTxn(market, 'transferMargin', [
                amount.neg().toBN(),
            ]);
            return txn;
        });
    }
    closeIsolatedPosition(marketAddress, priceImpactDelta) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = types_1.PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
            return market.closePositionWithTracking(priceImpactDelta.toBN(), futures_1.KWENTA_TRACKING_CODE);
        });
    }
    submitIsolatedMarginOrder(marketAddress, sizeDelta, priceImpactDelta) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = types_1.PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
            return this.sdk.transactions.createContractTxn(market, 'submitOffchainDelayedOrderWithTracking', [sizeDelta.toBN(), priceImpactDelta.toBN(), futures_1.KWENTA_TRACKING_CODE]);
        });
    }
    cancelDelayedOrder(marketAddress, account, isOffchain) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = types_1.PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
            return isOffchain
                ? market.cancelOffchainDelayedOrder(account)
                : market.cancelDelayedOrder(account);
        });
    }
    executeDelayedOrder(marketAddress, account) {
        return __awaiter(this, void 0, void 0, function* () {
            const market = types_1.PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
            return market.executeDelayedOrder(account);
        });
    }
    executeDelayedOffchainOrder(marketKey, marketAddress, account) {
        return __awaiter(this, void 0, void 0, function* () {
            const { Pyth } = this.sdk.context.contracts;
            const market = types_1.PerpsV2Market__factory.connect(marketAddress, this.sdk.context.signer);
            if (!Pyth)
                throw new Error(errors_1.UNSUPPORTED_NETWORK);
            // get price update data
            const priceUpdateData = yield this.sdk.prices.getPythPriceUpdateData(marketKey);
            const updateFee = yield Pyth.getUpdateFee(priceUpdateData);
            return market.executeOffchainDelayedOrder(account, priceUpdateData, { value: updateFee });
        });
    }
    createCrossMarginAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.contracts.SmartMarginAccountFactory)
                throw new Error(errors_1.UNSUPPORTED_NETWORK);
            return this.sdk.transactions.createContractTxn(this.sdk.context.contracts.SmartMarginAccountFactory, 'newAccount', []);
        });
    }
    submitCrossMarginOrder(market, walletAddress, crossMarginAddress, order, options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const crossMarginAccountContract = types_1.SmartMarginAccount__factory.connect(crossMarginAddress, this.sdk.context.signer);
            const commands = [];
            const inputs = [];
            if (options === null || options === void 0 ? void 0 : options.cancelExpiredDelayedOrders) {
                commands.push(futures_3.AccountExecuteFunctions.PERPS_V2_CANCEL_OFFCHAIN_DELAYED_ORDER);
                inputs.push(utils_1.defaultAbiCoder.encode(['address'], [market.address]));
            }
            const idleMargin = yield this.getIdleMargin(walletAddress, crossMarginAddress);
            const freeMargin = yield this.getCrossMarginAccountBalance(crossMarginAddress);
            // Sweep idle margin from other markets to account
            if (idleMargin.marketsTotal.gt(0)) {
                idleMargin.marketsWithMargin.forEach((m) => {
                    commands.push(futures_3.AccountExecuteFunctions.PERPS_V2_WITHDRAW_ALL_MARGIN);
                    inputs.push(utils_1.defaultAbiCoder.encode(['address'], [m.marketAddress]));
                });
            }
            if (order.marginDelta.gt(0)) {
                const totalFreeMargin = freeMargin.add(idleMargin.marketsTotal);
                const depositAmount = order.marginDelta.gt(totalFreeMargin)
                    ? order.marginDelta.sub(totalFreeMargin).abs()
                    : (0, wei_1.wei)(0);
                if (depositAmount.gt(0)) {
                    // If there's not enough idle margin to cover the margin delta we pull it from the wallet
                    commands.push(futures_3.AccountExecuteFunctions.ACCOUNT_MODIFY_MARGIN);
                    inputs.push(utils_1.defaultAbiCoder.encode(['int256'], [depositAmount.toBN()]));
                }
            }
            if (order.sizeDelta.abs().gt(0)) {
                if (!order.conditionalOrderInputs) {
                    commands.push(futures_3.AccountExecuteFunctions.PERPS_V2_MODIFY_MARGIN);
                    inputs.push((0, futures_4.encodeModidyMarketMarginParams)(market.address, order.marginDelta));
                    commands.push(futures_3.AccountExecuteFunctions.PERPS_V2_SUBMIT_OFFCHAIN_DELAYED_ORDER);
                    inputs.push((0, futures_4.encodeSubmitOffchainOrderParams)(market.address, order.sizeDelta, order.desiredFillPrice));
                }
                else {
                    commands.push(futures_3.AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER);
                    const params = (0, futures_4.encodeConditionalOrderParams)(market.key, {
                        marginDelta: order.marginDelta,
                        sizeDelta: order.sizeDelta,
                        price: order.conditionalOrderInputs.price,
                        desiredFillPrice: order.desiredFillPrice,
                    }, order.conditionalOrderInputs.orderType, order.conditionalOrderInputs.reduceOnly);
                    inputs.push(params);
                }
            }
            const existingOrders = yield this.getConditionalOrders(crossMarginAddress);
            const existingOrdersForMarket = existingOrders.filter((o) => o.marketKey === market.key && o.reduceOnly);
            if (order.takeProfit || order.stopLoss) {
                if (order.takeProfit) {
                    commands.push(futures_3.AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER);
                    const encodedParams = (0, futures_4.encodeConditionalOrderParams)(market.key, {
                        marginDelta: (0, wei_1.wei)(0),
                        sizeDelta: order.takeProfit.sizeDelta,
                        price: order.takeProfit.price,
                        desiredFillPrice: order.takeProfit.desiredFillPrice,
                    }, futures_3.ConditionalOrderTypeEnum.LIMIT, true);
                    inputs.push(encodedParams);
                }
                if (order.stopLoss) {
                    commands.push(futures_3.AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER);
                    const encodedParams = (0, futures_4.encodeConditionalOrderParams)(market.key, {
                        marginDelta: (0, wei_1.wei)(0),
                        sizeDelta: order.stopLoss.sizeDelta,
                        price: order.stopLoss.price,
                        desiredFillPrice: order.stopLoss.desiredFillPrice,
                    }, futures_3.ConditionalOrderTypeEnum.STOP, true);
                    inputs.push(encodedParams);
                }
            }
            if (options === null || options === void 0 ? void 0 : options.cancelPendingReduceOrders) {
                // Remove all pending reduce only orders if instructed
                existingOrdersForMarket.forEach((o) => {
                    commands.push(futures_3.AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER);
                    inputs.push(utils_1.defaultAbiCoder.encode(['uint256'], [o.id]));
                });
            }
            else {
                if (order.takeProfit) {
                    // Remove only existing take profit to overwrite
                    const existingTakeProfits = existingOrdersForMarket.filter((o) => o.size.abs().eq(futures_1.SL_TP_MAX_SIZE) && o.orderType === futures_3.ConditionalOrderTypeEnum.LIMIT);
                    if (existingTakeProfits.length) {
                        existingTakeProfits.forEach((tp) => {
                            commands.push(futures_3.AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER);
                            inputs.push(utils_1.defaultAbiCoder.encode(['uint256'], [tp.id]));
                        });
                    }
                }
                if (order.stopLoss) {
                    // Remove only existing stop loss to overwrite
                    const existingStopLosses = existingOrdersForMarket.filter((o) => o.size.abs().eq(futures_1.SL_TP_MAX_SIZE) && o.orderType === futures_3.ConditionalOrderTypeEnum.STOP);
                    if (existingStopLosses.length) {
                        existingStopLosses.forEach((sl) => {
                            commands.push(futures_3.AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER);
                            inputs.push(utils_1.defaultAbiCoder.encode(['uint256'], [sl.id]));
                        });
                    }
                }
            }
            return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [commands, inputs], {
                value: (_b = (_a = order.keeperEthDeposit) === null || _a === void 0 ? void 0 : _a.toBN()) !== null && _b !== void 0 ? _b : '0',
            });
        });
    }
    closeCrossMarginPosition(market, crossMarginAddress, desiredFillPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            const crossMarginAccountContract = types_1.SmartMarginAccount__factory.connect(crossMarginAddress, this.sdk.context.signer);
            const commands = [];
            const inputs = [];
            const existingOrders = yield this.getConditionalOrders(crossMarginAddress);
            const existingOrdersForMarket = existingOrders.filter((o) => o.marketKey === market.key && o.reduceOnly);
            existingOrdersForMarket.forEach((o) => {
                commands.push(futures_3.AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER);
                inputs.push(utils_1.defaultAbiCoder.encode(['uint256'], [o.id]));
            });
            commands.push(futures_3.AccountExecuteFunctions.PERPS_V2_SUBMIT_CLOSE_OFFCHAIN_DELAYED_ORDER);
            inputs.push((0, futures_4.encodeCloseOffchainOrderParams)(market.address, desiredFillPrice));
            return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [
                commands,
                inputs,
            ]);
        });
    }
    cancelConditionalOrder(crossMarginAddress, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            const crossMarginAccountContract = types_1.SmartMarginAccount__factory.connect(crossMarginAddress, this.sdk.context.signer);
            return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [
                [futures_3.AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER],
                [utils_1.defaultAbiCoder.encode(['uint256'], [orderId])],
            ]);
        });
    }
    withdrawAccountKeeperBalance(crossMarginAddress, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const crossMarginAccountContract = types_1.SmartMarginAccount__factory.connect(crossMarginAddress, this.sdk.context.signer);
            return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [
                [futures_3.AccountExecuteFunctions.ACCOUNT_WITHDRAW_ETH],
                [utils_1.defaultAbiCoder.encode(['uint256'], [amount.toBN()])],
            ]);
        });
    }
    updateStopLossAndTakeProfit(marketKey, crossMarginAddress, params) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const crossMarginAccountContract = types_1.SmartMarginAccount__factory.connect(crossMarginAddress, this.sdk.context.signer);
            const commands = [];
            const inputs = [];
            if (params.takeProfit || params.stopLoss) {
                const existingOrders = yield this.getConditionalOrders(crossMarginAddress);
                const existingOrdersForMarket = existingOrders.filter((o) => o.marketKey === marketKey);
                const existingStopLosses = existingOrdersForMarket.filter((o) => o.size.abs().eq(futures_1.SL_TP_MAX_SIZE) &&
                    o.reduceOnly &&
                    o.orderType === futures_3.ConditionalOrderTypeEnum.STOP);
                const existingTakeProfits = existingOrdersForMarket.filter((o) => o.size.abs().eq(futures_1.SL_TP_MAX_SIZE) &&
                    o.reduceOnly &&
                    o.orderType === futures_3.ConditionalOrderTypeEnum.LIMIT);
                if (params.takeProfit) {
                    if (existingTakeProfits.length) {
                        existingTakeProfits.forEach((tp) => {
                            commands.push(futures_3.AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER);
                            inputs.push(utils_1.defaultAbiCoder.encode(['uint256'], [tp.id]));
                        });
                    }
                    if (!params.takeProfit.isCancelled) {
                        commands.push(futures_3.AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER);
                        const encodedParams = (0, futures_4.encodeConditionalOrderParams)(marketKey, {
                            marginDelta: (0, wei_1.wei)(0),
                            sizeDelta: params.takeProfit.sizeDelta,
                            price: params.takeProfit.price,
                            desiredFillPrice: params.takeProfit.desiredFillPrice,
                        }, futures_3.ConditionalOrderTypeEnum.LIMIT, true);
                        inputs.push(encodedParams);
                    }
                }
                if (params.stopLoss) {
                    if (existingStopLosses.length) {
                        existingStopLosses.forEach((sl) => {
                            commands.push(futures_3.AccountExecuteFunctions.GELATO_CANCEL_CONDITIONAL_ORDER);
                            inputs.push(utils_1.defaultAbiCoder.encode(['uint256'], [sl.id]));
                        });
                    }
                    if (!params.stopLoss.isCancelled) {
                        commands.push(futures_3.AccountExecuteFunctions.GELATO_PLACE_CONDITIONAL_ORDER);
                        const encodedParams = (0, futures_4.encodeConditionalOrderParams)(marketKey, {
                            marginDelta: (0, wei_1.wei)(0),
                            sizeDelta: params.stopLoss.sizeDelta,
                            price: params.stopLoss.price,
                            desiredFillPrice: params.stopLoss.desiredFillPrice,
                        }, futures_3.ConditionalOrderTypeEnum.STOP, true);
                        inputs.push(encodedParams);
                    }
                }
            }
            return this.sdk.transactions.createContractTxn(crossMarginAccountContract, 'execute', [commands, inputs], {
                value: (_b = (_a = params.keeperEthDeposit) === null || _a === void 0 ? void 0 : _a.toBN()) !== null && _b !== void 0 ? _b : '0',
            });
        });
    }
    // Private methods
    getInternalFuturesMarket(marketAddress, marketKey) {
        var _a;
        let market = (_a = this.internalFuturesMarkets[this.sdk.context.networkId]) === null || _a === void 0 ? void 0 : _a[marketAddress];
        if (market)
            return market;
        market = new PerpsV2MarketInternalV2_1.default(this.sdk, this.sdk.context.provider, marketKey, marketAddress);
        this.internalFuturesMarkets = {
            [this.sdk.context.networkId]: Object.assign(Object.assign({}, this.internalFuturesMarkets[this.sdk.context.networkId]), { [marketAddress]: market }),
        };
        return market;
    }
    batchIdleMarketMarginSweeps(crossMarginAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const idleMargin = yield this.getIdleMarginInMarkets(crossMarginAddress);
            const commands = [];
            const inputs = [];
            // Sweep idle margin from other markets to account
            if (idleMargin.totalIdleInMarkets.gt(0)) {
                idleMargin.marketsWithIdleMargin.forEach((m) => {
                    commands.push(futures_3.AccountExecuteFunctions.PERPS_V2_WITHDRAW_ALL_MARGIN);
                    inputs.push(utils_1.defaultAbiCoder.encode(['address'], [m.marketAddress]));
                });
            }
            return { commands, inputs, idleMargin };
        });
    }
}
exports.default = FuturesService;
