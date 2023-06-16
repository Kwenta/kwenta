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
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripZeros = exports.toWei = exports.gweiToWei = exports.weiFromEth = exports.isZero = exports.weiToString = exports.ceilNumber = exports.floorNumber = exports.suggestedDecimals = exports.weiFromWei = exports.multiplyDecimal = exports.divideDecimal = exports.formatGwei = exports.scale = exports.formatPercent = exports.formatDollars = exports.formatCurrency = exports.formatFiatCurrency = exports.formatCryptoCurrency = exports.formatNumber = exports.commifyAndPadDecimals = exports.truncateNumbers = exports.getDecimalPlaces = exports.LONG_CRYPTO_CURRENCY_DECIMALS = exports.SHORT_CRYPTO_CURRENCY_DECIMALS = void 0;
const wei_1 = __importStar(require("@synthetixio/wei"));
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const number_1 = require("../constants/number");
const exchange_1 = require("./exchange");
const thresholds = [
    { value: 1e12, divisor: 1e12, unit: 'T', decimals: 2 },
    { value: 1e9, divisor: 1e9, unit: 'B', decimals: 2 },
    { value: 1e6, divisor: 1e6, unit: 'M', decimals: 2 },
    { value: 1e3, divisor: 1e3, unit: 'K', decimals: 0 },
];
exports.SHORT_CRYPTO_CURRENCY_DECIMALS = 4;
exports.LONG_CRYPTO_CURRENCY_DECIMALS = 8;
const getDecimalPlaces = (value) => (value.toString().split('.')[1] || '').length;
exports.getDecimalPlaces = getDecimalPlaces;
const truncateNumbers = (value, maxDecimalDigits) => {
    if (value.toString().includes('.')) {
        const parts = value.toString().split('.');
        return parts[0] + '.' + parts[1].slice(0, maxDecimalDigits);
    }
    return value.toString();
};
exports.truncateNumbers = truncateNumbers;
/**
 * ethers utils.commify method will reduce the decimals of a number to one digit if those decimals are zero.
 * This helper is used to reverse this behavior in order to display the specified decimals in the output.
 *
 * ex: utils.commify('10000', 2) => '10,000.0'
 * ex: commifyAndPadDecimals('10000', 2)) => '10,000.00'
 * @param value - commified value from utils.commify
 * @param decimals - number of decimals to display on commified value.
 * @returns string
 */
const commifyAndPadDecimals = (value, decimals) => {
    let formatted = ethers_1.utils.commify(value);
    const comps = formatted.split('.');
    if (!decimals)
        return comps[0];
    if (comps.length === 2 && comps[1].length !== decimals) {
        const zeros = '0'.repeat(decimals - comps[1].length);
        const decimalSuffix = `${comps[1]}${zeros}`;
        formatted = `${comps[0]}.${decimalSuffix}`;
    }
    return formatted;
};
exports.commifyAndPadDecimals = commifyAndPadDecimals;
// TODO: implement max decimals
const formatNumber = (value, options) => {
    var _a, _b;
    const prefix = options === null || options === void 0 ? void 0 : options.prefix;
    const suffix = options === null || options === void 0 ? void 0 : options.suffix;
    const truncateThreshold = (_a = options === null || options === void 0 ? void 0 : options.truncateOver) !== null && _a !== void 0 ? _a : 0;
    const suggestDecimals = options === null || options === void 0 ? void 0 : options.suggestDecimals;
    let truncation = options === null || options === void 0 ? void 0 : options.truncation;
    let weiValue = (0, wei_1.wei)(0);
    try {
        weiValue = (0, wei_1.wei)(value);
    }
    catch (e) {
        // eslint-disable-next-line
        console.error(e);
    }
    const isNegative = weiValue.lt((0, wei_1.wei)(0));
    const formattedValue = [];
    if (isNegative) {
        formattedValue.push('-');
    }
    if (prefix) {
        formattedValue.push(prefix);
    }
    // specified truncation params overrides universal truncate
    truncation =
        truncateThreshold && !truncation
            ? thresholds.find((threshold) => weiValue.gte(threshold.value) && weiValue.gte(truncateThreshold))
            : truncation;
    const weiBeforeAsString = truncation ? weiValue.abs().div(truncation.divisor) : weiValue.abs();
    const decimals = truncation
        ? truncation.decimals
        : suggestDecimals
            ? (0, exports.suggestedDecimals)(weiBeforeAsString)
            : (_b = options === null || options === void 0 ? void 0 : options.minDecimals) !== null && _b !== void 0 ? _b : number_1.DEFAULT_NUMBER_DECIMALS;
    let weiAsStringWithDecimals = weiBeforeAsString.toString(decimals);
    if ((options === null || options === void 0 ? void 0 : options.maxDecimals) || (options === null || options === void 0 ? void 0 : options.maxDecimals) === 0) {
        weiAsStringWithDecimals = (0, wei_1.wei)(weiAsStringWithDecimals).toString(options.maxDecimals);
    }
    const withCommas = (0, exports.commifyAndPadDecimals)(weiAsStringWithDecimals, decimals);
    formattedValue.push(withCommas);
    if (truncation) {
        formattedValue.push(truncation.unit);
    }
    if (suffix) {
        formattedValue.push(` ${suffix}`);
    }
    return formattedValue.join('');
};
exports.formatNumber = formatNumber;
const formatCryptoCurrency = (value, options) => {
    var _a;
    return (0, exports.formatNumber)(value, {
        prefix: options === null || options === void 0 ? void 0 : options.sign,
        suffix: options === null || options === void 0 ? void 0 : options.currencyKey,
        minDecimals: (_a = options === null || options === void 0 ? void 0 : options.minDecimals) !== null && _a !== void 0 ? _a : number_1.DEFAULT_CRYPTO_DECIMALS,
        maxDecimals: options === null || options === void 0 ? void 0 : options.maxDecimals,
        suggestDecimals: options === null || options === void 0 ? void 0 : options.suggestDecimals,
    });
};
exports.formatCryptoCurrency = formatCryptoCurrency;
const formatFiatCurrency = (value, options) => {
    var _a;
    return (0, exports.formatNumber)(value, Object.assign(Object.assign({}, options), { prefix: options === null || options === void 0 ? void 0 : options.sign, suffix: options === null || options === void 0 ? void 0 : options.currencyKey, minDecimals: (_a = options === null || options === void 0 ? void 0 : options.minDecimals) !== null && _a !== void 0 ? _a : number_1.DEFAULT_FIAT_DECIMALS }));
};
exports.formatFiatCurrency = formatFiatCurrency;
const formatCurrency = (currencyKey, value, options) => (0, exchange_1.isFiatCurrency)(currencyKey)
    ? (0, exports.formatFiatCurrency)(value, options)
    : (0, exports.formatCryptoCurrency)(value, options);
exports.formatCurrency = formatCurrency;
const formatDollars = (value, options) => (0, exports.formatCurrency)('sUSD', value, Object.assign({ sign: '$' }, options));
exports.formatDollars = formatDollars;
const formatPercent = (value, options) => {
    var _a;
    const decimals = (_a = options === null || options === void 0 ? void 0 : options.minDecimals) !== null && _a !== void 0 ? _a : 2;
    return `${(0, wei_1.wei)(value).mul(100).toString(decimals)}%`;
};
exports.formatPercent = formatPercent;
function scale(input, decimalPlaces) {
    return input.mul((0, wei_1.wei)(10).pow(decimalPlaces));
}
exports.scale = scale;
const formatGwei = (wei) => wei / 1e8 / 10;
exports.formatGwei = formatGwei;
const divideDecimal = (x, y) => {
    return x.mul(number_1.UNIT_BIG_NUM).div(y);
};
exports.divideDecimal = divideDecimal;
const multiplyDecimal = (x, y) => {
    return x.mul(y).div(number_1.UNIT_BIG_NUM);
};
exports.multiplyDecimal = multiplyDecimal;
const weiFromWei = (weiAmount) => {
    if (weiAmount instanceof wei_1.default) {
        const precisionDiff = 18 - weiAmount.p;
        return (0, wei_1.wei)(weiAmount, 18, true).div(Math.pow(10, precisionDiff));
    }
    else {
        return (0, wei_1.wei)(weiAmount, 18, true);
    }
};
exports.weiFromWei = weiFromWei;
const suggestedDecimals = (value) => {
    value = (0, wei_1.wei)(value).abs().toNumber();
    if (value >= 100000)
        return 0;
    if (value >= 100 || value === 0)
        return 2;
    if (value >= 10)
        return 3;
    if (value >= 0.1)
        return 4;
    if (value >= 0.01)
        return 5;
    if (value >= 0.001)
        return 6;
    if (value >= 0.0001)
        return 7;
    return 8;
};
exports.suggestedDecimals = suggestedDecimals;
const floorNumber = (num, decimals) => {
    const precision = Math.pow(10, (decimals !== null && decimals !== void 0 ? decimals : (0, exports.suggestedDecimals)(num)));
    return Math.floor(Number(num) * precision) / precision;
};
exports.floorNumber = floorNumber;
const ceilNumber = (num, decimals) => {
    const precision = Math.pow(10, (decimals !== null && decimals !== void 0 ? decimals : (0, exports.suggestedDecimals)(num)));
    return Math.ceil(Number(num) * precision) / precision;
};
exports.ceilNumber = ceilNumber;
// Converts to string but strips trailing zeros
const weiToString = (weiVal) => {
    return String(parseFloat(weiVal.toString()));
};
exports.weiToString = weiToString;
const isZero = (num) => {
    return (0, wei_1.wei)(num || 0).eq(0);
};
exports.isZero = isZero;
const weiFromEth = (num) => (0, wei_1.wei)(num).toBN().toString();
exports.weiFromEth = weiFromEth;
const gweiToWei = (val) => {
    return (0, utils_1.parseUnits)((0, wei_1.wei)(val).toString(), 9).toString();
};
exports.gweiToWei = gweiToWei;
const toWei = (value, p) => {
    return !!value ? (0, wei_1.wei)(value, p) : number_1.ZERO_WEI;
};
exports.toWei = toWei;
const stripZeros = (value) => {
    if (!value)
        return '';
    return String(value).replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1');
};
exports.stripZeros = stripZeros;
