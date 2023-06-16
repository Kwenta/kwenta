"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapStat = void 0;
const wei_1 = require("@synthetixio/wei");
const number_1 = require("./number");
const string_1 = require("./string");
const mapStat = (stat, i) => (Object.assign(Object.assign({}, stat), { trader: stat.account, traderShort: (0, string_1.truncateAddress)(stat.account), pnl: (0, number_1.weiFromWei)(stat.pnlWithFeesPaid), totalVolume: (0, number_1.weiFromWei)(stat.totalVolume), totalTrades: (0, wei_1.wei)(stat.totalTrades).toNumber(), liquidations: (0, wei_1.wei)(stat.liquidations).toNumber(), rank: i + 1, rankText: (i + 1).toString() }));
exports.mapStat = mapStat;
