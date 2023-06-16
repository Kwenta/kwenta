"use strict";
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
exports.getSmartMarginAccounts = exports.getSmartMarginAccountById = exports.getFuturesTrades = exports.getFuturesTradeById = exports.getFuturesStats = exports.getFuturesStatById = exports.getFuturesPositions = exports.getFuturesPositionById = exports.getFuturesOrders = exports.getFuturesOrderById = exports.getFuturesMarkets = exports.getFuturesMarketById = exports.getFuturesMarginTransfers = exports.getFuturesMarginTransferById = exports.getFuturesMarginAccounts = exports.getFuturesMarginAccountById = exports.getFuturesCumulativeStats = exports.getFuturesCumulativeStatById = exports.getFuturesAggregateStats = exports.getFuturesAggregateStatById = exports.getFundingRateUpdates = exports.getFundingRateUpdateById = exports.getFundingPayments = exports.getFundingPaymentById = exports.getCrossMarginAccountTransfers = exports.getCrossMarginAccountTransferById = exports.getCrossMarginAccounts = exports.getCrossMarginAccountById = exports.getCandles = exports.getCandleById = void 0;
const wei_1 = require("@synthetixio/wei");
const axios_1 = __importDefault(require("codegen-graph-ts/build/src/lib/axios"));
const gql_1 = __importDefault(require("codegen-graph-ts/build/src/lib/gql"));
const MAX_PAGE = 1000;
const getCandleById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('candle', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['synth'])
            formattedObj['synth'] = obj['synth'];
        if (obj['open'])
            formattedObj['open'] = (0, wei_1.wei)(obj['open']);
        if (obj['high'])
            formattedObj['high'] = (0, wei_1.wei)(obj['high']);
        if (obj['low'])
            formattedObj['low'] = (0, wei_1.wei)(obj['low']);
        if (obj['close'])
            formattedObj['close'] = (0, wei_1.wei)(obj['close']);
        if (obj['average'])
            formattedObj['average'] = (0, wei_1.wei)(obj['average']);
        if (obj['timestamp'])
            formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
        if (obj['period'])
            formattedObj['period'] = (0, wei_1.wei)(obj['period'], 0);
        if (obj['aggregatedPrices'])
            formattedObj['aggregatedPrices'] = (0, wei_1.wei)(obj['aggregatedPrices'], 0);
        return formattedObj;
    });
};
exports.getCandleById = getCandleById;
const getCandles = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('candles', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['synth'])
                    formattedObj['synth'] = obj['synth'];
                if (obj['open'])
                    formattedObj['open'] = (0, wei_1.wei)(obj['open']);
                if (obj['high'])
                    formattedObj['high'] = (0, wei_1.wei)(obj['high']);
                if (obj['low'])
                    formattedObj['low'] = (0, wei_1.wei)(obj['low']);
                if (obj['close'])
                    formattedObj['close'] = (0, wei_1.wei)(obj['close']);
                if (obj['average'])
                    formattedObj['average'] = (0, wei_1.wei)(obj['average']);
                if (obj['timestamp'])
                    formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
                if (obj['period'])
                    formattedObj['period'] = (0, wei_1.wei)(obj['period'], 0);
                if (obj['aggregatedPrices'])
                    formattedObj['aggregatedPrices'] = (0, wei_1.wei)(obj['aggregatedPrices'], 0);
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getCandles = getCandles;
const getCrossMarginAccountById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('crossMarginAccount', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['owner'])
            formattedObj['owner'] = obj['owner'];
        return formattedObj;
    });
};
exports.getCrossMarginAccountById = getCrossMarginAccountById;
const getCrossMarginAccounts = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc'
                    ? '_gt'
                    : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('crossMarginAccounts', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['owner'])
                    formattedObj['owner'] = obj['owner'];
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getCrossMarginAccounts = getCrossMarginAccounts;
const getCrossMarginAccountTransferById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('crossMarginAccountTransfer', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['account'])
            formattedObj['account'] = obj['account'];
        if (obj['abstractAccount'])
            formattedObj['abstractAccount'] = obj['abstractAccount'];
        if (obj['timestamp'])
            formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
        if (obj['size'])
            formattedObj['size'] = (0, wei_1.wei)(obj['size'], 0);
        if (obj['txHash'])
            formattedObj['txHash'] = obj['txHash'];
        return formattedObj;
    });
};
exports.getCrossMarginAccountTransferById = getCrossMarginAccountTransferById;
const getCrossMarginAccountTransfers = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc'
                    ? '_gt'
                    : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('crossMarginAccountTransfers', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['account'])
                    formattedObj['account'] = obj['account'];
                if (obj['abstractAccount'])
                    formattedObj['abstractAccount'] = obj['abstractAccount'];
                if (obj['timestamp'])
                    formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
                if (obj['size'])
                    formattedObj['size'] = (0, wei_1.wei)(obj['size'], 0);
                if (obj['txHash'])
                    formattedObj['txHash'] = obj['txHash'];
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getCrossMarginAccountTransfers = getCrossMarginAccountTransfers;
const getFundingPaymentById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('fundingPayment', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['timestamp'])
            formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
        if (obj['account'])
            formattedObj['account'] = obj['account'];
        if (obj['positionId'])
            formattedObj['positionId'] = obj['positionId'];
        if (obj['marketKey'])
            formattedObj['marketKey'] = obj['marketKey'];
        if (obj['asset'])
            formattedObj['asset'] = obj['asset'];
        if (obj['amount'])
            formattedObj['amount'] = (0, wei_1.wei)(obj['amount'], 0);
        return formattedObj;
    });
};
exports.getFundingPaymentById = getFundingPaymentById;
const getFundingPayments = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('fundingPayments', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['timestamp'])
                    formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
                if (obj['account'])
                    formattedObj['account'] = obj['account'];
                if (obj['positionId'])
                    formattedObj['positionId'] = obj['positionId'];
                if (obj['marketKey'])
                    formattedObj['marketKey'] = obj['marketKey'];
                if (obj['asset'])
                    formattedObj['asset'] = obj['asset'];
                if (obj['amount'])
                    formattedObj['amount'] = (0, wei_1.wei)(obj['amount'], 0);
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getFundingPayments = getFundingPayments;
const getFundingRateUpdateById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('fundingRateUpdate', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['timestamp'])
            formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
        if (obj['market'])
            formattedObj['market'] = obj['market'];
        if (obj['marketKey'])
            formattedObj['marketKey'] = obj['marketKey'];
        if (obj['asset'])
            formattedObj['asset'] = obj['asset'];
        if (obj['sequenceLength'])
            formattedObj['sequenceLength'] = (0, wei_1.wei)(obj['sequenceLength'], 0);
        if (obj['funding'])
            formattedObj['funding'] = (0, wei_1.wei)(obj['funding'], 0);
        if (obj['fundingRate'])
            formattedObj['fundingRate'] = (0, wei_1.wei)(obj['fundingRate'], 0);
        return formattedObj;
    });
};
exports.getFundingRateUpdateById = getFundingRateUpdateById;
const getFundingRateUpdates = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('fundingRateUpdates', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['timestamp'])
                    formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
                if (obj['market'])
                    formattedObj['market'] = obj['market'];
                if (obj['marketKey'])
                    formattedObj['marketKey'] = obj['marketKey'];
                if (obj['asset'])
                    formattedObj['asset'] = obj['asset'];
                if (obj['sequenceLength'])
                    formattedObj['sequenceLength'] = (0, wei_1.wei)(obj['sequenceLength'], 0);
                if (obj['funding'])
                    formattedObj['funding'] = (0, wei_1.wei)(obj['funding'], 0);
                if (obj['fundingRate'])
                    formattedObj['fundingRate'] = (0, wei_1.wei)(obj['fundingRate'], 0);
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getFundingRateUpdates = getFundingRateUpdates;
const getFuturesAggregateStatById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('futuresAggregateStat', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['period'])
            formattedObj['period'] = (0, wei_1.wei)(obj['period'], 0);
        if (obj['timestamp'])
            formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
        if (obj['marketKey'])
            formattedObj['marketKey'] = obj['marketKey'];
        if (obj['asset'])
            formattedObj['asset'] = obj['asset'];
        if (obj['trades'])
            formattedObj['trades'] = (0, wei_1.wei)(obj['trades'], 0);
        if (obj['volume'])
            formattedObj['volume'] = (0, wei_1.wei)(obj['volume'], 0);
        if (obj['feesKwenta'])
            formattedObj['feesKwenta'] = (0, wei_1.wei)(obj['feesKwenta'], 0);
        if (obj['feesSynthetix'])
            formattedObj['feesSynthetix'] = (0, wei_1.wei)(obj['feesSynthetix'], 0);
        if (obj['feesCrossMarginAccounts'])
            formattedObj['feesCrossMarginAccounts'] = (0, wei_1.wei)(obj['feesCrossMarginAccounts'], 0);
        return formattedObj;
    });
};
exports.getFuturesAggregateStatById = getFuturesAggregateStatById;
const getFuturesAggregateStats = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc'
                    ? '_gt'
                    : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('futuresAggregateStats', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['period'])
                    formattedObj['period'] = (0, wei_1.wei)(obj['period'], 0);
                if (obj['timestamp'])
                    formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
                if (obj['marketKey'])
                    formattedObj['marketKey'] = obj['marketKey'];
                if (obj['asset'])
                    formattedObj['asset'] = obj['asset'];
                if (obj['trades'])
                    formattedObj['trades'] = (0, wei_1.wei)(obj['trades'], 0);
                if (obj['volume'])
                    formattedObj['volume'] = (0, wei_1.wei)(obj['volume'], 0);
                if (obj['feesKwenta'])
                    formattedObj['feesKwenta'] = (0, wei_1.wei)(obj['feesKwenta'], 0);
                if (obj['feesSynthetix'])
                    formattedObj['feesSynthetix'] = (0, wei_1.wei)(obj['feesSynthetix'], 0);
                if (obj['feesCrossMarginAccounts'])
                    formattedObj['feesCrossMarginAccounts'] = (0, wei_1.wei)(obj['feesCrossMarginAccounts'], 0);
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getFuturesAggregateStats = getFuturesAggregateStats;
const getFuturesCumulativeStatById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('futuresCumulativeStat', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['totalLiquidations'])
            formattedObj['totalLiquidations'] = (0, wei_1.wei)(obj['totalLiquidations'], 0);
        if (obj['totalTrades'])
            formattedObj['totalTrades'] = (0, wei_1.wei)(obj['totalTrades'], 0);
        if (obj['totalTraders'])
            formattedObj['totalTraders'] = (0, wei_1.wei)(obj['totalTraders'], 0);
        if (obj['totalVolume'])
            formattedObj['totalVolume'] = (0, wei_1.wei)(obj['totalVolume'], 0);
        if (obj['averageTradeSize'])
            formattedObj['averageTradeSize'] = (0, wei_1.wei)(obj['averageTradeSize'], 0);
        return formattedObj;
    });
};
exports.getFuturesCumulativeStatById = getFuturesCumulativeStatById;
const getFuturesCumulativeStats = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc'
                    ? '_gt'
                    : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('futuresCumulativeStats', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['totalLiquidations'])
                    formattedObj['totalLiquidations'] = (0, wei_1.wei)(obj['totalLiquidations'], 0);
                if (obj['totalTrades'])
                    formattedObj['totalTrades'] = (0, wei_1.wei)(obj['totalTrades'], 0);
                if (obj['totalTraders'])
                    formattedObj['totalTraders'] = (0, wei_1.wei)(obj['totalTraders'], 0);
                if (obj['totalVolume'])
                    formattedObj['totalVolume'] = (0, wei_1.wei)(obj['totalVolume'], 0);
                if (obj['averageTradeSize'])
                    formattedObj['averageTradeSize'] = (0, wei_1.wei)(obj['averageTradeSize'], 0);
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getFuturesCumulativeStats = getFuturesCumulativeStats;
const getFuturesMarginAccountById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('futuresMarginAccount', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['timestamp'])
            formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
        if (obj['account'])
            formattedObj['account'] = obj['account'];
        if (obj['market'])
            formattedObj['market'] = obj['market'];
        if (obj['asset'])
            formattedObj['asset'] = obj['asset'];
        if (obj['margin'])
            formattedObj['margin'] = (0, wei_1.wei)(obj['margin'], 0);
        if (obj['deposits'])
            formattedObj['deposits'] = (0, wei_1.wei)(obj['deposits'], 0);
        if (obj['withdrawals'])
            formattedObj['withdrawals'] = (0, wei_1.wei)(obj['withdrawals'], 0);
        return formattedObj;
    });
};
exports.getFuturesMarginAccountById = getFuturesMarginAccountById;
const getFuturesMarginAccounts = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc'
                    ? '_gt'
                    : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('futuresMarginAccounts', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['timestamp'])
                    formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
                if (obj['account'])
                    formattedObj['account'] = obj['account'];
                if (obj['market'])
                    formattedObj['market'] = obj['market'];
                if (obj['asset'])
                    formattedObj['asset'] = obj['asset'];
                if (obj['margin'])
                    formattedObj['margin'] = (0, wei_1.wei)(obj['margin'], 0);
                if (obj['deposits'])
                    formattedObj['deposits'] = (0, wei_1.wei)(obj['deposits'], 0);
                if (obj['withdrawals'])
                    formattedObj['withdrawals'] = (0, wei_1.wei)(obj['withdrawals'], 0);
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getFuturesMarginAccounts = getFuturesMarginAccounts;
const getFuturesMarginTransferById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('futuresMarginTransfer', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['timestamp'])
            formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
        if (obj['account'])
            formattedObj['account'] = obj['account'];
        if (obj['market'])
            formattedObj['market'] = obj['market'];
        if (obj['asset'])
            formattedObj['asset'] = obj['asset'];
        if (obj['marketKey'])
            formattedObj['marketKey'] = obj['marketKey'];
        if (obj['size'])
            formattedObj['size'] = (0, wei_1.wei)(obj['size'], 0);
        if (obj['txHash'])
            formattedObj['txHash'] = obj['txHash'];
        return formattedObj;
    });
};
exports.getFuturesMarginTransferById = getFuturesMarginTransferById;
const getFuturesMarginTransfers = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc'
                    ? '_gt'
                    : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('futuresMarginTransfers', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['timestamp'])
                    formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
                if (obj['account'])
                    formattedObj['account'] = obj['account'];
                if (obj['market'])
                    formattedObj['market'] = obj['market'];
                if (obj['asset'])
                    formattedObj['asset'] = obj['asset'];
                if (obj['marketKey'])
                    formattedObj['marketKey'] = obj['marketKey'];
                if (obj['size'])
                    formattedObj['size'] = (0, wei_1.wei)(obj['size'], 0);
                if (obj['txHash'])
                    formattedObj['txHash'] = obj['txHash'];
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getFuturesMarginTransfers = getFuturesMarginTransfers;
const getFuturesMarketById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('futuresMarket', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['asset'])
            formattedObj['asset'] = obj['asset'];
        if (obj['marketKey'])
            formattedObj['marketKey'] = obj['marketKey'];
        if (obj['marketStats'])
            formattedObj['marketStats'] = obj['marketStats'];
        return formattedObj;
    });
};
exports.getFuturesMarketById = getFuturesMarketById;
const getFuturesMarkets = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('futuresMarkets', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['asset'])
                    formattedObj['asset'] = obj['asset'];
                if (obj['marketKey'])
                    formattedObj['marketKey'] = obj['marketKey'];
                if (obj['marketStats'])
                    formattedObj['marketStats'] = obj['marketStats'];
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getFuturesMarkets = getFuturesMarkets;
const getFuturesOrderById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('futuresOrder', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['size'])
            formattedObj['size'] = (0, wei_1.wei)(obj['size'], 0);
        if (obj['asset'])
            formattedObj['asset'] = obj['asset'];
        if (obj['marketKey'])
            formattedObj['marketKey'] = obj['marketKey'];
        if (obj['market'])
            formattedObj['market'] = obj['market'];
        if (obj['account'])
            formattedObj['account'] = obj['account'];
        if (obj['abstractAccount'])
            formattedObj['abstractAccount'] = obj['abstractAccount'];
        if (obj['orderId'])
            formattedObj['orderId'] = (0, wei_1.wei)(obj['orderId'], 0);
        if (obj['targetRoundId'])
            formattedObj['targetRoundId'] = (0, wei_1.wei)(obj['targetRoundId'], 0);
        if (obj['targetPrice'])
            formattedObj['targetPrice'] = (0, wei_1.wei)(obj['targetPrice'], 0);
        if (obj['marginDelta'])
            formattedObj['marginDelta'] = (0, wei_1.wei)(obj['marginDelta'], 0);
        if (obj['timestamp'])
            formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
        if (obj['orderType'])
            formattedObj['orderType'] = obj['orderType'];
        if (obj['status'])
            formattedObj['status'] = obj['status'];
        if (obj['keeper'])
            formattedObj['keeper'] = obj['keeper'];
        return formattedObj;
    });
};
exports.getFuturesOrderById = getFuturesOrderById;
const getFuturesOrders = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('futuresOrders', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['size'])
                    formattedObj['size'] = (0, wei_1.wei)(obj['size'], 0);
                if (obj['asset'])
                    formattedObj['asset'] = obj['asset'];
                if (obj['marketKey'])
                    formattedObj['marketKey'] = obj['marketKey'];
                if (obj['market'])
                    formattedObj['market'] = obj['market'];
                if (obj['account'])
                    formattedObj['account'] = obj['account'];
                if (obj['abstractAccount'])
                    formattedObj['abstractAccount'] = obj['abstractAccount'];
                if (obj['orderId'])
                    formattedObj['orderId'] = (0, wei_1.wei)(obj['orderId'], 0);
                if (obj['targetRoundId'])
                    formattedObj['targetRoundId'] = (0, wei_1.wei)(obj['targetRoundId'], 0);
                if (obj['targetPrice'])
                    formattedObj['targetPrice'] = (0, wei_1.wei)(obj['targetPrice'], 0);
                if (obj['marginDelta'])
                    formattedObj['marginDelta'] = (0, wei_1.wei)(obj['marginDelta'], 0);
                if (obj['timestamp'])
                    formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
                if (obj['orderType'])
                    formattedObj['orderType'] = obj['orderType'];
                if (obj['status'])
                    formattedObj['status'] = obj['status'];
                if (obj['keeper'])
                    formattedObj['keeper'] = obj['keeper'];
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getFuturesOrders = getFuturesOrders;
const getFuturesPositionById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('futuresPosition', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['lastTxHash'])
            formattedObj['lastTxHash'] = obj['lastTxHash'];
        if (obj['openTimestamp'])
            formattedObj['openTimestamp'] = (0, wei_1.wei)(obj['openTimestamp'], 0);
        if (obj['closeTimestamp'])
            formattedObj['closeTimestamp'] = (0, wei_1.wei)(obj['closeTimestamp'], 0);
        if (obj['timestamp'])
            formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
        if (obj['market'])
            formattedObj['market'] = obj['market'];
        if (obj['asset'])
            formattedObj['asset'] = obj['asset'];
        if (obj['marketKey'])
            formattedObj['marketKey'] = obj['marketKey'];
        if (obj['account'])
            formattedObj['account'] = obj['account'];
        if (obj['abstractAccount'])
            formattedObj['abstractAccount'] = obj['abstractAccount'];
        if (obj['accountType'])
            formattedObj['accountType'] = obj['accountType'];
        if (obj['isOpen'])
            formattedObj['isOpen'] = obj['isOpen'];
        if (obj['isLiquidated'])
            formattedObj['isLiquidated'] = obj['isLiquidated'];
        if (obj['trades'])
            formattedObj['trades'] = (0, wei_1.wei)(obj['trades'], 0);
        if (obj['totalVolume'])
            formattedObj['totalVolume'] = (0, wei_1.wei)(obj['totalVolume'], 0);
        if (obj['size'])
            formattedObj['size'] = (0, wei_1.wei)(obj['size'], 0);
        if (obj['initialMargin'])
            formattedObj['initialMargin'] = (0, wei_1.wei)(obj['initialMargin'], 0);
        if (obj['margin'])
            formattedObj['margin'] = (0, wei_1.wei)(obj['margin'], 0);
        if (obj['pnl'])
            formattedObj['pnl'] = (0, wei_1.wei)(obj['pnl'], 0);
        if (obj['feesPaid'])
            formattedObj['feesPaid'] = (0, wei_1.wei)(obj['feesPaid'], 0);
        if (obj['netFunding'])
            formattedObj['netFunding'] = (0, wei_1.wei)(obj['netFunding'], 0);
        if (obj['pnlWithFeesPaid'])
            formattedObj['pnlWithFeesPaid'] = (0, wei_1.wei)(obj['pnlWithFeesPaid'], 0);
        if (obj['netTransfers'])
            formattedObj['netTransfers'] = (0, wei_1.wei)(obj['netTransfers'], 0);
        if (obj['totalDeposits'])
            formattedObj['totalDeposits'] = (0, wei_1.wei)(obj['totalDeposits'], 0);
        if (obj['fundingIndex'])
            formattedObj['fundingIndex'] = (0, wei_1.wei)(obj['fundingIndex'], 0);
        if (obj['entryPrice'])
            formattedObj['entryPrice'] = (0, wei_1.wei)(obj['entryPrice'], 0);
        if (obj['avgEntryPrice'])
            formattedObj['avgEntryPrice'] = (0, wei_1.wei)(obj['avgEntryPrice'], 0);
        if (obj['lastPrice'])
            formattedObj['lastPrice'] = (0, wei_1.wei)(obj['lastPrice'], 0);
        if (obj['exitPrice'])
            formattedObj['exitPrice'] = (0, wei_1.wei)(obj['exitPrice'], 0);
        return formattedObj;
    });
};
exports.getFuturesPositionById = getFuturesPositionById;
const getFuturesPositions = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('futuresPositions', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['lastTxHash'])
                    formattedObj['lastTxHash'] = obj['lastTxHash'];
                if (obj['openTimestamp'])
                    formattedObj['openTimestamp'] = (0, wei_1.wei)(obj['openTimestamp'], 0);
                if (obj['closeTimestamp'])
                    formattedObj['closeTimestamp'] = (0, wei_1.wei)(obj['closeTimestamp'], 0);
                if (obj['timestamp'])
                    formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
                if (obj['market'])
                    formattedObj['market'] = obj['market'];
                if (obj['asset'])
                    formattedObj['asset'] = obj['asset'];
                if (obj['marketKey'])
                    formattedObj['marketKey'] = obj['marketKey'];
                if (obj['account'])
                    formattedObj['account'] = obj['account'];
                if (obj['abstractAccount'])
                    formattedObj['abstractAccount'] = obj['abstractAccount'];
                if (obj['accountType'])
                    formattedObj['accountType'] = obj['accountType'];
                if (obj['isOpen'])
                    formattedObj['isOpen'] = obj['isOpen'];
                if (obj['isLiquidated'])
                    formattedObj['isLiquidated'] = obj['isLiquidated'];
                if (obj['trades'])
                    formattedObj['trades'] = (0, wei_1.wei)(obj['trades'], 0);
                if (obj['totalVolume'])
                    formattedObj['totalVolume'] = (0, wei_1.wei)(obj['totalVolume'], 0);
                if (obj['size'])
                    formattedObj['size'] = (0, wei_1.wei)(obj['size'], 0);
                if (obj['initialMargin'])
                    formattedObj['initialMargin'] = (0, wei_1.wei)(obj['initialMargin'], 0);
                if (obj['margin'])
                    formattedObj['margin'] = (0, wei_1.wei)(obj['margin'], 0);
                if (obj['pnl'])
                    formattedObj['pnl'] = (0, wei_1.wei)(obj['pnl'], 0);
                if (obj['feesPaid'])
                    formattedObj['feesPaid'] = (0, wei_1.wei)(obj['feesPaid'], 0);
                if (obj['netFunding'])
                    formattedObj['netFunding'] = (0, wei_1.wei)(obj['netFunding'], 0);
                if (obj['pnlWithFeesPaid'])
                    formattedObj['pnlWithFeesPaid'] = (0, wei_1.wei)(obj['pnlWithFeesPaid'], 0);
                if (obj['netTransfers'])
                    formattedObj['netTransfers'] = (0, wei_1.wei)(obj['netTransfers'], 0);
                if (obj['totalDeposits'])
                    formattedObj['totalDeposits'] = (0, wei_1.wei)(obj['totalDeposits'], 0);
                if (obj['fundingIndex'])
                    formattedObj['fundingIndex'] = (0, wei_1.wei)(obj['fundingIndex'], 0);
                if (obj['entryPrice'])
                    formattedObj['entryPrice'] = (0, wei_1.wei)(obj['entryPrice'], 0);
                if (obj['avgEntryPrice'])
                    formattedObj['avgEntryPrice'] = (0, wei_1.wei)(obj['avgEntryPrice'], 0);
                if (obj['lastPrice'])
                    formattedObj['lastPrice'] = (0, wei_1.wei)(obj['lastPrice'], 0);
                if (obj['exitPrice'])
                    formattedObj['exitPrice'] = (0, wei_1.wei)(obj['exitPrice'], 0);
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getFuturesPositions = getFuturesPositions;
const getFuturesStatById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('futuresStat', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['account'])
            formattedObj['account'] = obj['account'];
        if (obj['feesPaid'])
            formattedObj['feesPaid'] = (0, wei_1.wei)(obj['feesPaid'], 0);
        if (obj['pnl'])
            formattedObj['pnl'] = (0, wei_1.wei)(obj['pnl'], 0);
        if (obj['pnlWithFeesPaid'])
            formattedObj['pnlWithFeesPaid'] = (0, wei_1.wei)(obj['pnlWithFeesPaid'], 0);
        if (obj['liquidations'])
            formattedObj['liquidations'] = (0, wei_1.wei)(obj['liquidations'], 0);
        if (obj['totalTrades'])
            formattedObj['totalTrades'] = (0, wei_1.wei)(obj['totalTrades'], 0);
        if (obj['totalVolume'])
            formattedObj['totalVolume'] = (0, wei_1.wei)(obj['totalVolume'], 0);
        if (obj['smartMarginVolume'])
            formattedObj['smartMarginVolume'] = (0, wei_1.wei)(obj['smartMarginVolume'], 0);
        return formattedObj;
    });
};
exports.getFuturesStatById = getFuturesStatById;
const getFuturesStats = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('futuresStats', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['account'])
                    formattedObj['account'] = obj['account'];
                if (obj['feesPaid'])
                    formattedObj['feesPaid'] = (0, wei_1.wei)(obj['feesPaid'], 0);
                if (obj['pnl'])
                    formattedObj['pnl'] = (0, wei_1.wei)(obj['pnl'], 0);
                if (obj['pnlWithFeesPaid'])
                    formattedObj['pnlWithFeesPaid'] = (0, wei_1.wei)(obj['pnlWithFeesPaid'], 0);
                if (obj['liquidations'])
                    formattedObj['liquidations'] = (0, wei_1.wei)(obj['liquidations'], 0);
                if (obj['totalTrades'])
                    formattedObj['totalTrades'] = (0, wei_1.wei)(obj['totalTrades'], 0);
                if (obj['totalVolume'])
                    formattedObj['totalVolume'] = (0, wei_1.wei)(obj['totalVolume'], 0);
                if (obj['smartMarginVolume'])
                    formattedObj['smartMarginVolume'] = (0, wei_1.wei)(obj['smartMarginVolume'], 0);
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getFuturesStats = getFuturesStats;
const getFuturesTradeById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('futuresTrade', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['timestamp'])
            formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
        if (obj['account'])
            formattedObj['account'] = obj['account'];
        if (obj['abstractAccount'])
            formattedObj['abstractAccount'] = obj['abstractAccount'];
        if (obj['accountType'])
            formattedObj['accountType'] = obj['accountType'];
        if (obj['margin'])
            formattedObj['margin'] = (0, wei_1.wei)(obj['margin'], 0);
        if (obj['size'])
            formattedObj['size'] = (0, wei_1.wei)(obj['size'], 0);
        if (obj['asset'])
            formattedObj['asset'] = obj['asset'];
        if (obj['marketKey'])
            formattedObj['marketKey'] = obj['marketKey'];
        if (obj['price'])
            formattedObj['price'] = (0, wei_1.wei)(obj['price'], 0);
        if (obj['positionId'])
            formattedObj['positionId'] = obj['positionId'];
        if (obj['positionSize'])
            formattedObj['positionSize'] = (0, wei_1.wei)(obj['positionSize'], 0);
        if (obj['positionClosed'])
            formattedObj['positionClosed'] = obj['positionClosed'];
        if (obj['pnl'])
            formattedObj['pnl'] = (0, wei_1.wei)(obj['pnl'], 0);
        if (obj['feesPaid'])
            formattedObj['feesPaid'] = (0, wei_1.wei)(obj['feesPaid'], 0);
        if (obj['fundingAccrued'])
            formattedObj['fundingAccrued'] = (0, wei_1.wei)(obj['fundingAccrued'], 0);
        if (obj['keeperFeesPaid'])
            formattedObj['keeperFeesPaid'] = (0, wei_1.wei)(obj['keeperFeesPaid'], 0);
        if (obj['orderType'])
            formattedObj['orderType'] = obj['orderType'];
        if (obj['trackingCode'])
            formattedObj['trackingCode'] = obj['trackingCode'];
        return formattedObj;
    });
};
exports.getFuturesTradeById = getFuturesTradeById;
const getFuturesTrades = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc' ? '_gt' : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('futuresTrades', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['timestamp'])
                    formattedObj['timestamp'] = (0, wei_1.wei)(obj['timestamp'], 0);
                if (obj['account'])
                    formattedObj['account'] = obj['account'];
                if (obj['abstractAccount'])
                    formattedObj['abstractAccount'] = obj['abstractAccount'];
                if (obj['accountType'])
                    formattedObj['accountType'] = obj['accountType'];
                if (obj['margin'])
                    formattedObj['margin'] = (0, wei_1.wei)(obj['margin'], 0);
                if (obj['size'])
                    formattedObj['size'] = (0, wei_1.wei)(obj['size'], 0);
                if (obj['asset'])
                    formattedObj['asset'] = obj['asset'];
                if (obj['marketKey'])
                    formattedObj['marketKey'] = obj['marketKey'];
                if (obj['price'])
                    formattedObj['price'] = (0, wei_1.wei)(obj['price'], 0);
                if (obj['positionId'])
                    formattedObj['positionId'] = obj['positionId'];
                if (obj['positionSize'])
                    formattedObj['positionSize'] = (0, wei_1.wei)(obj['positionSize'], 0);
                if (obj['positionClosed'])
                    formattedObj['positionClosed'] = obj['positionClosed'];
                if (obj['pnl'])
                    formattedObj['pnl'] = (0, wei_1.wei)(obj['pnl'], 0);
                if (obj['feesPaid'])
                    formattedObj['feesPaid'] = (0, wei_1.wei)(obj['feesPaid'], 0);
                if (obj['fundingAccrued'])
                    formattedObj['fundingAccrued'] = (0, wei_1.wei)(obj['fundingAccrued'], 0);
                if (obj['keeperFeesPaid'])
                    formattedObj['keeperFeesPaid'] = (0, wei_1.wei)(obj['keeperFeesPaid'], 0);
                if (obj['orderType'])
                    formattedObj['orderType'] = obj['orderType'];
                if (obj['trackingCode'])
                    formattedObj['trackingCode'] = obj['trackingCode'];
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getFuturesTrades = getFuturesTrades;
const getSmartMarginAccountById = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield axios_1.default.post(url, {
            query: (0, gql_1.default)('smartMarginAccount', options, args),
        });
        const r = res.data;
        if (r.errors && r.errors.length) {
            throw new Error(r.errors[0].message);
        }
        const obj = r.data[Object.keys(r.data)[0]];
        const formattedObj = {};
        if (obj['id'])
            formattedObj['id'] = obj['id'];
        if (obj['owner'])
            formattedObj['owner'] = obj['owner'];
        if (obj['version'])
            formattedObj['version'] = obj['version'];
        return formattedObj;
    });
};
exports.getSmartMarginAccountById = getSmartMarginAccountById;
const getSmartMarginAccounts = function (url, options, args) {
    return __awaiter(this, void 0, void 0, function* () {
        const paginatedOptions = Object.assign({}, options);
        let paginationKey = null;
        let paginationValue = '';
        if (options.first && options.first > MAX_PAGE) {
            paginatedOptions.first = MAX_PAGE;
            paginatedOptions.orderBy = options.orderBy || 'id';
            paginatedOptions.orderDirection = options.orderDirection || 'asc';
            paginationKey = (paginatedOptions.orderBy +
                (paginatedOptions.orderDirection === 'asc'
                    ? '_gt'
                    : '_lt'));
            paginatedOptions.where = Object.assign({}, options.where);
        }
        let results = [];
        do {
            if (paginationKey && paginationValue)
                paginatedOptions.where[paginationKey] = paginationValue;
            const res = yield axios_1.default.post(url, {
                query: (0, gql_1.default)('smartMarginAccounts', paginatedOptions, args),
            });
            const r = res.data;
            if (r.errors && r.errors.length) {
                throw new Error(r.errors[0].message);
            }
            const rawResults = r.data[Object.keys(r.data)[0]];
            const newResults = rawResults.map((obj) => {
                const formattedObj = {};
                if (obj['id'])
                    formattedObj['id'] = obj['id'];
                if (obj['owner'])
                    formattedObj['owner'] = obj['owner'];
                if (obj['version'])
                    formattedObj['version'] = obj['version'];
                return formattedObj;
            });
            results = results.concat(newResults);
            if (newResults.length < 1000) {
                break;
            }
            if (paginationKey) {
                paginationValue = rawResults[rawResults.length - 1][paginatedOptions.orderBy];
            }
        } while (paginationKey && options.first && results.length < options.first);
        return options.first ? results.slice(0, options.first) : results;
    });
};
exports.getSmartMarginAccounts = getSmartMarginAccounts;
