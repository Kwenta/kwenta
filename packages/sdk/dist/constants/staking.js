"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPLY_RATE = exports.OP_REWARDS_CUTOFF_EPOCH = exports.TRADING_REWARDS_CUTOFF_EPOCH = exports.STAKING_LOW_GAS_LIMIT = exports.STAKING_HIGH_GAS_LIMIT = exports.TRADING_REWARDS_RATIO = exports.STAKING_REWARDS_RATIO = exports.INITIAL_WEEKLY_SUPPLY = exports.DECAY_RATE = exports.WEEK = exports.EPOCH_START = exports.DEFAULT_NUMBER_OF_FUTURES_FEE = void 0;
const wei_1 = require("@synthetixio/wei");
const ethers_1 = require("ethers");
exports.DEFAULT_NUMBER_OF_FUTURES_FEE = 9999;
exports.EPOCH_START = {
    420: 1665878400,
    10: 1668556800,
};
exports.WEEK = 604800;
exports.DECAY_RATE = 0.0205;
exports.INITIAL_WEEKLY_SUPPLY = ethers_1.BigNumber.from('14463369230769230769230');
exports.STAKING_REWARDS_RATIO = 0.6;
exports.TRADING_REWARDS_RATIO = 0.05;
exports.STAKING_HIGH_GAS_LIMIT = ethers_1.BigNumber.from('400000');
exports.STAKING_LOW_GAS_LIMIT = ethers_1.BigNumber.from('200000');
exports.TRADING_REWARDS_CUTOFF_EPOCH = 13;
exports.OP_REWARDS_CUTOFF_EPOCH = 22;
exports.SUPPLY_RATE = (0, wei_1.wei)(1).sub((0, wei_1.wei)(exports.DECAY_RATE));
