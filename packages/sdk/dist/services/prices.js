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
Object.defineProperty(exports, "__esModule", { value: true });
const pyth_evm_js_1 = require("@pythnetwork/pyth-evm-js");
const wei_1 = require("@synthetixio/wei");
const utils_js_1 = require("ethers/lib/utils.js");
const strings_1 = require("@ethersproject/strings");
const graphql_request_1 = __importStar(require("graphql-request"));
const lodash_1 = require("lodash");
const futures_1 = require("../constants/futures");
const period_1 = require("../constants/period");
const prices_1 = require("../constants/prices");
const futures_2 = require("../types/futures");
const futures_3 = require("../utils/futures");
const interval_1 = require("../utils/interval");
const number_1 = require("../utils/number");
const prices_2 = require("../utils/prices");
const sdkErrors = __importStar(require("../common/errors"));
const DEBUG_WS = false;
const LOG_WS = process.env.NODE_ENV !== 'production' && DEBUG_WS;
const DEFAULT_PRICE_SERVER = process.env.NEXT_PUBLIC_DEFAULT_PRICE_SERVICE === 'KWENTA' ? 'KWENTA' : 'PYTH';
class PricesService {
    constructor(sdk) {
        this.offChainPrices = {};
        this.onChainPrices = {};
        this.lastConnectionTime = Date.now();
        this.wsConnected = false;
        this.server = DEFAULT_PRICE_SERVER;
        this.throttleOffChainPricesUpdate = (0, lodash_1.throttle)((offChainPrices) => {
            this.sdk.context.events.emit('prices_updated', {
                prices: offChainPrices,
                type: 'off_chain',
                source: 'stream',
            });
        }, prices_1.PRICE_UPDATE_THROTTLE);
        this.sdk = sdk;
        this.setEventListeners();
        this.connectToPyth(sdk.context.networkId, this.server);
    }
    get currentPrices() {
        return {
            onChain: this.onChainPrices,
            offChain: this.offChainPrices,
        };
    }
    get pythIds() {
        return this.sdk.context.isMainnet ? prices_1.PYTH_IDS.mainnet : prices_1.PYTH_IDS.testnet;
    }
    getOffchainPrice(marketKey) {
        const price = this.offChainPrices[futures_3.MarketAssetByKey[marketKey]];
        if (!price)
            throw new Error(`No price data for ${marketKey}`);
        return price;
    }
    startPriceUpdates(intervalTime) {
        return __awaiter(this, void 0, void 0, function* () {
            // Poll the onchain prices
            if (!this.ratesInterval) {
                this.ratesInterval = (0, interval_1.startInterval)(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        this.onChainPrices = yield this.getOnChainPrices();
                        this.sdk.context.events.emit('prices_updated', {
                            prices: this.onChainPrices,
                            type: 'on_chain',
                        });
                    }
                    catch (err) {
                        this.sdk.context.logError(err);
                    }
                }), intervalTime);
            }
        });
    }
    onPricesUpdated(listener) {
        return this.sdk.context.events.on('prices_updated', listener);
    }
    removePricesListener(listener) {
        return this.sdk.context.events.off('prices_updated', listener);
    }
    removePricesListeners() {
        this.sdk.context.events.removeAllListeners('prices_updated');
    }
    onPricesConnectionUpdated(listener) {
        return this.sdk.context.events.on('prices_connection_update', listener);
    }
    removeConnectionListeners() {
        this.sdk.context.events.removeAllListeners('prices_connection_update');
    }
    getOnChainPrices() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.contracts.SynthUtil || !this.sdk.context.contracts.ExchangeRates) {
                throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
            }
            const synthPrices = {};
            const [synthsRates, ratesForCurrencies] = (yield Promise.all([
                this.sdk.context.contracts.SynthUtil.synthsRates(),
                this.sdk.context.contracts.ExchangeRates.ratesForCurrencies(prices_1.ADDITIONAL_SYNTHS),
            ]));
            const synths = [...synthsRates[0], ...prices_1.ADDITIONAL_SYNTHS];
            const rates = [...synthsRates[1], ...ratesForCurrencies];
            synths.forEach((currencyKeyBytes32, idx) => {
                const currencyKey = (0, strings_1.parseBytes32String)(currencyKeyBytes32);
                const marketAsset = futures_3.MarketAssetByKey[currencyKey];
                const rate = Number((0, utils_js_1.formatEther)(rates[idx]));
                const price = (0, wei_1.wei)(rate);
                synthPrices[currencyKey] = price;
                if (marketAsset)
                    synthPrices[marketAsset] = price;
            });
            return synthPrices;
        });
    }
    getOffChainPrices() {
        return __awaiter(this, void 0, void 0, function* () {
            const pythPrices = yield this.pyth.getLatestPriceFeeds(this.pythIds);
            return this.formatOffChainPrices(pythPrices !== null && pythPrices !== void 0 ? pythPrices : []);
        });
    }
    getPreviousDayPrices(marketAssets, networkId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ratesEndpoint = (0, prices_2.getRatesEndpoint)(networkId || this.sdk.context.networkId);
            const minTimestamp = Math.floor((Date.now() - period_1.PERIOD_IN_SECONDS.ONE_DAY * 1000) / 1000);
            const rateUpdateQueries = marketAssets.map((asset) => {
                var _a;
                return (0, graphql_request_1.gql) `
			# last before timestamp
			${asset}: rateUpdates(
				first: 1
				where: { synth: "${(_a = (0, futures_3.getDisplayAsset)(asset)) !== null && _a !== void 0 ? _a : asset}", timestamp_gte: $minTimestamp }
				orderBy: timestamp
				orderDirection: asc
			) {
				synth
				rate
			}
		`;
            });
            const response = yield (0, graphql_request_1.default)(ratesEndpoint, (0, graphql_request_1.gql) `
				query rateUpdates($minTimestamp: BigInt!) {
					${rateUpdateQueries.reduce((acc, curr) => {
                return acc + curr;
            })}
			}`, {
                minTimestamp: minTimestamp,
            });
            const prices = (response ? Object.values(response).flat() : []);
            //TODO: remove this once the rates are fixed
            return prices.map((price) => price.synth === futures_3.MarketAssetByKey[futures_2.FuturesMarketKey.sPEPEPERP]
                ? Object.assign(Object.assign({}, price), { rate: (0, wei_1.wei)(price.rate.toString()).div(1e10).toString() }) : price);
        });
    }
    getPythPriceUpdateData(marketKey) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const pythIds = (_a = futures_1.MARKETS[marketKey]) === null || _a === void 0 ? void 0 : _a.pythIds;
            const pythId = pythIds ? pythIds[this.sdk.context.isMainnet ? 'mainnet' : 'testnet'] : null;
            if (!pythId)
                throw new Error(sdkErrors.NO_PYTH_ID);
            const updateData = yield this.pyth.getPriceFeedsUpdateData([pythId]);
            return updateData;
        });
    }
    formatOffChainPrices(pythPrices) {
        var _a;
        const offChainPrices = (_a = pythPrices === null || pythPrices === void 0 ? void 0 : pythPrices.reduce((acc, p) => {
            const price = this.formatPythPrice(p);
            // Have to handle inconsistent id formatting between ws and http
            const id = (0, futures_3.normalizePythId)(p.id);
            const marketKey = futures_1.MARKET_ASSETS_BY_PYTH_ID[id];
            if (marketKey) {
                acc[marketKey] = price;
            }
            return acc;
        }, {})) !== null && _a !== void 0 ? _a : {};
        return offChainPrices;
    }
    connectToPyth(networkId, server) {
        if (this.pyth) {
            this.pyth.closeWebSocket();
        }
        this.pyth = new pyth_evm_js_1.EvmPriceServiceConnection((0, futures_3.getPythNetworkUrl)(networkId, server), {
            logger: LOG_WS ? console : undefined,
        });
        this.lastConnectionTime = Date.now();
        this.monitorConnection();
        this.pyth.onWsError = (error) => {
            if (error === null || error === void 0 ? void 0 : error.message) {
                this.sdk.context.logError(error);
            }
            this.setWsConnected(false);
            this.sdk.context.events.emit('prices_connection_update', {
                connected: false,
                error: error || new Error('pyth prices ws connection failed'),
            });
        };
        this.subscribeToPythPriceUpdates();
    }
    setWsConnected(connected) {
        if (connected !== this.wsConnected) {
            this.wsConnected = connected;
            this.sdk.context.events.emit('prices_connection_update', {
                connected: connected,
            });
        }
    }
    setEventListeners() {
        this.sdk.context.events.on('network_changed', (params) => {
            this.connectToPyth(params.networkId, this.server);
        });
    }
    monitorConnection() {
        // Should get a constant stream of messages so when we don't
        // receive any for a 10 second period we switch servers
        if (this.connectionMonitorId)
            clearTimeout(this.connectionMonitorId);
        this.connectionMonitorId = setTimeout(() => {
            if (Date.now() - this.lastConnectionTime > 10000) {
                this.switchConnection();
            }
            this.monitorConnection();
        }, 1000);
    }
    switchConnection() {
        this.server = this.server === 'KWENTA' ? 'PYTH' : 'KWENTA';
        this.connectToPyth(this.sdk.context.networkId, this.server);
    }
    formatPythPrice(priceFeed) {
        const price = priceFeed.getPriceUnchecked();
        return (0, number_1.scale)((0, wei_1.wei)(price.price), price.expo);
    }
    subscribeToPythPriceUpdates() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.offChainPrices = yield this.getOffChainPrices();
                this.sdk.context.events.emit('prices_updated', {
                    prices: this.offChainPrices,
                    type: 'off_chain',
                    source: 'fetch',
                });
            }
            catch (err) {
                this.sdk.context.logError(err);
            }
            this.pyth.subscribePriceFeedUpdates(this.pythIds, (priceFeed) => {
                const id = (0, futures_3.normalizePythId)(priceFeed.id);
                const assetKey = futures_1.MARKET_ASSETS_BY_PYTH_ID[id];
                if (assetKey) {
                    const price = this.formatPythPrice(priceFeed);
                    this.offChainPrices[assetKey] = price;
                }
                this.setWsConnected(true);
                this.lastConnectionTime = Date.now();
                this.throttleOffChainPricesUpdate(this.offChainPrices);
            });
        });
    }
}
exports.default = PricesService;
