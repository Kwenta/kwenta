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
const wei_1 = require("@synthetixio/wei");
const graphql_request_1 = __importStar(require("graphql-request"));
const errors_1 = require("../common/errors");
const futures_1 = require("../constants/futures");
const stats_1 = require("../constants/stats");
const transactions_1 = require("../constants/transactions");
const stats_2 = require("../utils/stats");
const string_1 = require("../utils/string");
const subgraph_1 = require("../utils/subgraph");
class StatsService {
    constructor(sdk) {
        this.sdk = sdk;
    }
    getStatsVolumes() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getFuturesTradersStats() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getFuturesStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, subgraph_1.getFuturesStats)(this.sdk.futures.futuresGqlEndpoint, {
                    first: 10,
                    orderBy: 'pnlWithFeesPaid',
                    orderDirection: 'desc',
                }, {
                    account: true,
                    pnl: true,
                    pnlWithFeesPaid: true,
                    liquidations: true,
                    totalTrades: true,
                    totalVolume: true,
                });
                const stats = response.map((stat, i) => (Object.assign(Object.assign({}, stat), { trader: stat.account, traderShort: (0, string_1.truncateAddress)(stat.account), pnl: stat.pnlWithFeesPaid.div(transactions_1.ETH_UNIT), totalVolume: stat.totalVolume.div(transactions_1.ETH_UNIT), totalTrades: stat.totalTrades.toNumber(), liquidations: stat.liquidations.toNumber(), rank: i + 1, rankText: (i + 1).toString() })));
                return stats;
            }
            catch (e) {
                this.sdk.context.logError(e);
                return [];
            }
        });
    }
    getLeaderboard(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = (0, graphql_request_1.gql) `
				fragment StatsBody on FuturesStat {
					account
					pnl
					pnlWithFeesPaid
					liquidations
					totalTrades
					totalVolume
				}

				query leaderboardStats($account: String!, $searchTerm: String!) {
					top: futuresStats(orderBy: pnlWithFeesPaid, orderDirection: desc, first: 100) {
						...StatsBody
					}
					bottom: futuresStats(orderBy: pnlWithFeesPaid, orderDirection: asc, first: 100) {
						...StatsBody
					}
					wallet: futuresStats(where: { account: $account }) {
						...StatsBody
					}
					search: futuresStats(where: { account_contains: $searchTerm }) {
						...StatsBody
					}
				}
			`;
                const response = yield (0, graphql_request_1.default)(this.sdk.futures.futuresGqlEndpoint, query, { account: this.sdk.context.walletAddress, searchTerm });
                const stats = {
                    top: response.top.map(stats_2.mapStat),
                    bottom: response.bottom.map(stats_2.mapStat),
                    wallet: response.wallet.map(stats_2.mapStat),
                    search: response.search.map(stats_2.mapStat),
                    all: [],
                };
                stats.all = [...stats.top, ...stats.bottom, ...stats.wallet, ...stats.search];
                return stats;
            }
            catch (e) {
                this.sdk.context.logError(e);
                return stats_1.DEFAULT_LEADERBOARD_DATA;
            }
        });
    }
    getFuturesCumulativeStats(homepage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sdk.context.isL2 && !homepage) {
                throw new Error(errors_1.REQUIRES_L2);
            }
            const futuresEndpoint = homepage
                ? futures_1.FUTURES_ENDPOINT_OP_MAINNET
                : this.sdk.futures.futuresGqlEndpoint;
            try {
                const response = yield (0, graphql_request_1.default)(futuresEndpoint, (0, graphql_request_1.gql) `
					query FuturesCumulativeStats {
						futuresCumulativeStat(id: "0") {
							totalTrades
							totalTraders
							totalVolume
							totalLiquidations
							averageTradeSize
						}
					}
				`);
                return response
                    ? {
                        totalVolume: (0, wei_1.wei)(response.futuresCumulativeStat.totalVolume, 18, true).toString(),
                        averageTradeSize: (0, wei_1.wei)(response.futuresCumulativeStat.averageTradeSize, 18, true).toString(),
                        totalTraders: response.futuresCumulativeStat.totalTraders,
                        totalTrades: response.futuresCumulativeStat.totalTrades,
                        totalLiquidations: response.futuresCumulativeStat.totalLiquidations,
                    }
                    : null;
            }
            catch (e) {
                this.sdk.context.logError(e);
                return null;
            }
        });
    }
}
exports.default = StatsService;
