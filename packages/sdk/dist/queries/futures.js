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
exports.queryFundingRateHistory = exports.queryFuturesTrades = exports.querySmartMarginTransfers = exports.queryIsolatedMarginTransfers = exports.queryCompletePositionHistory = exports.queryPositionHistory = exports.queryTrades = exports.queryCrossMarginAccounts = exports.queryAccountsFromSubgraph = void 0;
const strings_1 = require("@ethersproject/strings");
const graphql_request_1 = __importStar(require("graphql-request"));
const futures_1 = require("../constants/futures");
const futures_2 = require("../utils/futures");
const subgraph_1 = require("../utils/subgraph");
const queryAccountsFromSubgraph = (sdk, walletAddress) => __awaiter(void 0, void 0, void 0, function* () {
    if (!walletAddress)
        return [];
    const response = yield (0, graphql_request_1.default)(sdk.futures.futuresGqlEndpoint, (0, graphql_request_1.gql) `
			query crossMarginAccounts($owner: String!) {
				crossMarginAccounts(where: { owner: $owner }) {
					id
					owner
				}
			}
		`, { owner: walletAddress });
    return (response === null || response === void 0 ? void 0 : response.crossMarginAccounts.map((cm) => cm.id)) || [];
});
exports.queryAccountsFromSubgraph = queryAccountsFromSubgraph;
const queryCrossMarginAccounts = (sdk, walletAddress) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // TODO: Contract should be updating to support one to many
    const accounts = yield ((_a = sdk.context.contracts.SmartMarginAccountFactory) === null || _a === void 0 ? void 0 : _a.getAccountsOwnedBy(walletAddress));
    return accounts !== null && accounts !== void 0 ? accounts : [];
});
exports.queryCrossMarginAccounts = queryCrossMarginAccounts;
const queryTrades = (sdk, params) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = {
        account: params.walletAddress,
        accountType: params.accountType === 'isolated_margin' ? 'isolated_margin' : 'smart_margin',
    };
    if (params.marketAsset) {
        filter['asset'] = (0, strings_1.formatBytes32String)(params.marketAsset);
    }
    return (0, subgraph_1.getFuturesTrades)(sdk.futures.futuresGqlEndpoint, {
        first: params.pageLength,
        where: filter,
        orderDirection: 'desc',
        orderBy: 'timestamp',
    }, {
        id: true,
        timestamp: true,
        account: true,
        abstractAccount: true,
        accountType: true,
        margin: true,
        size: true,
        marketKey: true,
        asset: true,
        price: true,
        positionId: true,
        positionSize: true,
        positionClosed: true,
        pnl: true,
        feesPaid: true,
        keeperFeesPaid: true,
        orderType: true,
        trackingCode: true,
        fundingAccrued: true,
    });
});
exports.queryTrades = queryTrades;
const queryPositionHistory = (sdk, account) => {
    return (0, subgraph_1.getFuturesPositions)(sdk.futures.futuresGqlEndpoint, {
        where: {
            abstractAccount: account,
        },
        first: 99999,
        orderBy: 'openTimestamp',
        orderDirection: 'desc',
    }, {
        id: true,
        lastTxHash: true,
        openTimestamp: true,
        closeTimestamp: true,
        timestamp: true,
        market: true,
        marketKey: true,
        asset: true,
        account: true,
        abstractAccount: true,
        accountType: true,
        isOpen: true,
        isLiquidated: true,
        trades: true,
        totalVolume: true,
        size: true,
        initialMargin: true,
        margin: true,
        pnl: true,
        feesPaid: true,
        netFunding: true,
        pnlWithFeesPaid: true,
        netTransfers: true,
        totalDeposits: true,
        fundingIndex: true,
        entryPrice: true,
        avgEntryPrice: true,
        lastPrice: true,
        exitPrice: true,
    });
};
exports.queryPositionHistory = queryPositionHistory;
const queryCompletePositionHistory = (sdk, account) => {
    return (0, subgraph_1.getFuturesPositions)(sdk.futures.futuresGqlEndpoint, {
        where: {
            account: account,
        },
        first: 99999,
        orderBy: 'openTimestamp',
        orderDirection: 'desc',
    }, {
        id: true,
        lastTxHash: true,
        openTimestamp: true,
        closeTimestamp: true,
        timestamp: true,
        market: true,
        marketKey: true,
        asset: true,
        account: true,
        abstractAccount: true,
        accountType: true,
        isOpen: true,
        isLiquidated: true,
        trades: true,
        totalVolume: true,
        size: true,
        initialMargin: true,
        margin: true,
        pnl: true,
        feesPaid: true,
        netFunding: true,
        pnlWithFeesPaid: true,
        netTransfers: true,
        totalDeposits: true,
        fundingIndex: true,
        entryPrice: true,
        avgEntryPrice: true,
        lastPrice: true,
        exitPrice: true,
    });
};
exports.queryCompletePositionHistory = queryCompletePositionHistory;
const queryIsolatedMarginTransfers = (sdk, account) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, graphql_request_1.default)(sdk.futures.futuresGqlEndpoint, futures_1.ISOLATED_MARGIN_FRAGMENT, {
        walletAddress: account,
    });
    return response ? (0, futures_2.mapMarginTransfers)(response.futuresMarginTransfers) : [];
});
exports.queryIsolatedMarginTransfers = queryIsolatedMarginTransfers;
const querySmartMarginTransfers = (sdk, account) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, graphql_request_1.default)(sdk.futures.futuresGqlEndpoint, futures_1.SMART_MARGIN_FRAGMENT, {
        walletAddress: account,
    });
    return response ? (0, futures_2.mapSmartMarginTransfers)(response.smartMarginAccountTransfers) : [];
});
exports.querySmartMarginTransfers = querySmartMarginTransfers;
const queryFuturesTrades = (sdk, marketKey, minTs, maxTs) => {
    return (0, subgraph_1.getFuturesTrades)(sdk.futures.futuresGqlEndpoint, {
        first: futures_1.DEFAULT_NUMBER_OF_TRADES,
        where: {
            marketKey: (0, strings_1.formatBytes32String)(marketKey),
            timestamp_gt: minTs,
            timestamp_lt: maxTs,
        },
        orderDirection: 'desc',
        orderBy: 'timestamp',
    }, {
        id: true,
        timestamp: true,
        account: true,
        abstractAccount: true,
        accountType: true,
        margin: true,
        size: true,
        marketKey: true,
        asset: true,
        price: true,
        positionId: true,
        positionSize: true,
        positionClosed: true,
        pnl: true,
        feesPaid: true,
        keeperFeesPaid: true,
        orderType: true,
        fundingAccrued: true,
        trackingCode: true,
    });
};
exports.queryFuturesTrades = queryFuturesTrades;
const queryFundingRateHistory = (sdk, marketAsset, minTimestamp, period = 'Hourly') => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, graphql_request_1.default)(sdk.futures.futuresGqlEndpoint, (0, graphql_request_1.gql) `
			query fundingRateUpdate(
				$marketAsset: Bytes!
				$minTimestamp: BigInt!
				$period: FundingRatePeriodType!
			) {
				fundingRatePeriods(
					where: { asset: $marketAsset, timestamp_gt: $minTimestamp, period: $period }
					first: 1000
				) {
					timestamp
					fundingRate
				}
			}
		`, { marketAsset: (0, strings_1.formatBytes32String)(marketAsset), minTimestamp, period });
    return response.fundingRatePeriods.map((x) => ({
        timestamp: Number(x.timestamp) * 1000,
        fundingRate: Number(x.fundingRate),
    }));
});
exports.queryFundingRateHistory = queryFundingRateHistory;
