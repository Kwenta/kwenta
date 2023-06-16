"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIAT_SYNTHS = exports.DEFAULT_TOKEN_DECIMALS = exports.DEFAULT_PERCENT_DECIMALS = exports.DEFAULT_NUMBER_DECIMALS = exports.DEFAULT_FIAT_DECIMALS = exports.DEFAULT_CRYPTO_DECIMALS = exports.ZERO_BIG_NUM = exports.UNIT_BIG_NUM = exports.UNIT_BN = exports.ZERO_WEI = void 0;
const wei_1 = require("@synthetixio/wei");
const bn_js_1 = __importDefault(require("bn.js"));
const bignumber_1 = require("@ethersproject/bignumber");
exports.ZERO_WEI = (0, wei_1.wei)(0);
exports.UNIT_BN = new bn_js_1.default('10').pow(new bn_js_1.default(18));
exports.UNIT_BIG_NUM = bignumber_1.BigNumber.from('10').pow(18);
exports.ZERO_BIG_NUM = bignumber_1.BigNumber.from('0');
exports.DEFAULT_CRYPTO_DECIMALS = 4;
exports.DEFAULT_FIAT_DECIMALS = 2;
exports.DEFAULT_NUMBER_DECIMALS = 2;
exports.DEFAULT_PERCENT_DECIMALS = 2;
exports.DEFAULT_TOKEN_DECIMALS = 18;
exports.FIAT_SYNTHS = new Set([
    'sEUR',
    'sJPY',
    'sUSD',
    'sAUD',
    'sGBP',
    'sCHF',
    'EUR',
    'JPY',
    'USD',
    'AUD',
    'GBP',
    'CHF',
]);
