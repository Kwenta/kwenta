"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFiatCurrency = exports.synthToAsset = void 0;
const number_1 = require("../constants/number");
const synthToAsset = (currencyKey) => {
    return currencyKey.replace(/^(i|s)/, '');
};
exports.synthToAsset = synthToAsset;
const isFiatCurrency = (currencyKey) => number_1.FIAT_SYNTHS.has(currencyKey);
exports.isFiatCurrency = isFiatCurrency;
