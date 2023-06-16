"use strict";
// Some of this file is copied from:
// https://github.com/Synthetixio/js-monorepo/blob/master/packages/queries/src/queries/network/useEthGasPriceQuery.ts
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
exports.getEthGasPrice = exports.getGasPriceFromProvider = exports.computeGasFee = void 0;
const wei_1 = require("@synthetixio/wei");
const common_1 = require("../types/common");
const MULTIPLIER = (0, wei_1.wei)(2);
const computeGasFee = (baseFeePerGas, maxPriorityFeePerGas) => ({
    maxPriorityFeePerGas: (0, wei_1.wei)(maxPriorityFeePerGas, 9).toBN(),
    maxFeePerGas: (0, wei_1.wei)(baseFeePerGas, 9).mul(MULTIPLIER).add((0, wei_1.wei)(maxPriorityFeePerGas, 9)).toBN(),
    baseFeePerGas: baseFeePerGas,
});
exports.computeGasFee = computeGasFee;
const getGasPriceFromProvider = (provider) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gasPrice = yield provider.getGasPrice();
        return {
            fastest: { gasPrice },
            fast: { gasPrice },
            average: { gasPrice },
        };
    }
    catch (e) {
        throw new Error('Could not retrieve gas price from provider');
    }
});
exports.getGasPriceFromProvider = getGasPriceFromProvider;
// This is mostly copied over from the Synthetix queries.
// See: https://github.com/Synthetixio/js-monorepo/blob/master/packages/queries/src/queries/network/useEthGasPriceQuery.ts
const getEthGasPrice = (networkId, provider) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // If network is Mainnet then we use EIP1559
        if (networkId === common_1.NetworkIdByName.mainnet) {
            const block = yield provider.getBlock('latest');
            if (block === null || block === void 0 ? void 0 : block.baseFeePerGas) {
                return {
                    fastest: (0, exports.computeGasFee)(block.baseFeePerGas, 6),
                    fast: (0, exports.computeGasFee)(block.baseFeePerGas, 4),
                    average: (0, exports.computeGasFee)(block.baseFeePerGas, 2),
                };
            }
        }
        return (0, exports.getGasPriceFromProvider)(provider);
    }
    catch (e) {
        throw new Error(`Could not fetch and compute network fee. ${e}`);
    }
});
exports.getEthGasPrice = getEthGasPrice;
