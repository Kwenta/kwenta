"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEpochData = exports.getApy = exports.getEpochDetails = void 0;
const wei_1 = require("@synthetixio/wei");
const staking_1 = require("../constants/staking");
const date_1 = require("./date");
const number_1 = require("../constants/number");
function getEpochDetails(networkId, epoch) {
    const currentEpochTime = staking_1.EPOCH_START[networkId]
        ? staking_1.EPOCH_START[networkId] + staking_1.WEEK * epoch
        : staking_1.EPOCH_START[10];
    const epochEndTime = currentEpochTime + staking_1.WEEK;
    return { epochStart: currentEpochTime, epochEnd: epochEndTime };
}
exports.getEpochDetails = getEpochDetails;
function getApy(totalStakedBalance, weekCounter) {
    const startWeeklySupply = (0, wei_1.wei)(staking_1.INITIAL_WEEKLY_SUPPLY).mul(staking_1.SUPPLY_RATE.pow(weekCounter));
    const yearlyRewards = startWeeklySupply.mul((0, wei_1.wei)(1).sub(staking_1.SUPPLY_RATE.pow(52))).div((0, wei_1.wei)(staking_1.DECAY_RATE));
    return (0, wei_1.wei)(totalStakedBalance).gt(0)
        ? yearlyRewards.mul((0, wei_1.wei)(staking_1.STAKING_REWARDS_RATIO)).div((0, wei_1.wei)(totalStakedBalance))
        : number_1.ZERO_WEI;
}
exports.getApy = getApy;
const parseEpochData = (index, networkId) => {
    const { epochStart, epochEnd } = getEpochDetails(networkId !== null && networkId !== void 0 ? networkId : 10, index);
    const startDate = (0, date_1.formatShortDate)(new Date((0, date_1.toJSTimestamp)(epochStart)));
    const endDate = (0, date_1.formatShortDate)(new Date((0, date_1.toJSTimestamp)(epochEnd)));
    const label = `Epoch ${index}: ${startDate} - ${endDate}`;
    return { period: index, start: epochStart, end: epochEnd, label };
};
exports.parseEpochData = parseEpochData;
