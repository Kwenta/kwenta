"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calldataCost = exports.zeroesAndOnes = exports.calculateL1Fee = exports.calculateL1GasUsed = exports.scaleDecimals = exports.txDataNonZeroGasEIP2028 = exports.txDataZeroGas = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const common_1 = require("../common");
exports.txDataZeroGas = 4;
exports.txDataNonZeroGasEIP2028 = 16;
const big10 = bignumber_1.BigNumber.from(10);
const scaleDecimals = (value, decimals) => {
    value = bignumber_1.BigNumber.from(value);
    decimals = bignumber_1.BigNumber.from(decimals);
    const divisor = big10.pow(decimals);
    return value.div(divisor);
};
exports.scaleDecimals = scaleDecimals;
const calculateL1GasUsed = (data, overhead) => {
    const [zeroes, ones] = (0, exports.zeroesAndOnes)(data);
    const zeroesCost = zeroes * exports.txDataZeroGas;
    const onesCost = (ones + 68) * exports.txDataNonZeroGasEIP2028;
    return bignumber_1.BigNumber.from(onesCost).add(zeroesCost).add(overhead);
};
exports.calculateL1GasUsed = calculateL1GasUsed;
const calculateL1Fee = (data, overhead, l1GasPrice, scalar, decimals) => {
    const l1GasUsed = (0, exports.calculateL1GasUsed)(data, overhead);
    const l1Fee = l1GasUsed.mul(l1GasPrice);
    const scaled = l1Fee.mul(scalar);
    const result = (0, exports.scaleDecimals)(scaled, decimals);
    return result;
};
exports.calculateL1Fee = calculateL1Fee;
const zeroesAndOnes = (data) => {
    if (typeof data === 'string') {
        data = Buffer.from((0, common_1.remove0x)(data), 'hex');
    }
    let zeros = 0;
    let ones = 0;
    for (const byte of data) {
        if (byte === 0) {
            zeros++;
        }
        else {
            ones++;
        }
    }
    return [zeros, ones];
};
exports.zeroesAndOnes = zeroesAndOnes;
const calldataCost = (data) => {
    const [zeros, ones] = (0, exports.zeroesAndOnes)(data);
    const zeroCost = bignumber_1.BigNumber.from(zeros).mul(exports.txDataZeroGas);
    const nonZeroCost = bignumber_1.BigNumber.from(ones).mul(exports.txDataNonZeroGasEIP2028);
    return zeroCost.add(nonZeroCost);
};
exports.calldataCost = calldataCost;
//# sourceMappingURL=fees.js.map