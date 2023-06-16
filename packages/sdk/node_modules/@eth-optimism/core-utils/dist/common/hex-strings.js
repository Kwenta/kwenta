"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytes32ify = exports.hexStringEquals = exports.encodeHex = exports.padHexString = exports.toRpcHexString = exports.toHexString = exports.fromHexString = exports.add0x = exports.remove0x = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const bytes_1 = require("@ethersproject/bytes");
const remove0x = (str) => {
    if (str === undefined) {
        return str;
    }
    return str.startsWith('0x') ? str.slice(2) : str;
};
exports.remove0x = remove0x;
const add0x = (str) => {
    if (str === undefined) {
        return str;
    }
    return str.startsWith('0x') ? str : '0x' + str;
};
exports.add0x = add0x;
const fromHexString = (inp) => {
    if (typeof inp === 'string' && inp.startsWith('0x')) {
        return Buffer.from(inp.slice(2), 'hex');
    }
    return Buffer.from(inp);
};
exports.fromHexString = fromHexString;
const toHexString = (inp) => {
    if (typeof inp === 'number') {
        return bignumber_1.BigNumber.from(inp).toHexString();
    }
    else {
        return '0x' + (0, exports.fromHexString)(inp).toString('hex');
    }
};
exports.toHexString = toHexString;
const toRpcHexString = (n) => {
    let num;
    if (typeof n === 'number') {
        num = '0x' + n.toString(16);
    }
    else {
        num = n.toHexString();
    }
    if (num === '0x0') {
        return num;
    }
    else {
        return num.replace(/^0x0/, '0x');
    }
};
exports.toRpcHexString = toRpcHexString;
const padHexString = (str, length) => {
    if (str.length === 2 + length * 2) {
        return str;
    }
    else {
        return '0x' + str.slice(2).padStart(length * 2, '0');
    }
};
exports.padHexString = padHexString;
const encodeHex = (val, len) => (0, exports.remove0x)(bignumber_1.BigNumber.from(val).toHexString()).padStart(len, '0');
exports.encodeHex = encodeHex;
const hexStringEquals = (stringA, stringB) => {
    if (!(0, bytes_1.isHexString)(stringA)) {
        throw new Error(`input is not a hex string: ${stringA}`);
    }
    if (!(0, bytes_1.isHexString)(stringB)) {
        throw new Error(`input is not a hex string: ${stringB}`);
    }
    return stringA.toLowerCase() === stringB.toLowerCase();
};
exports.hexStringEquals = hexStringEquals;
const bytes32ify = (value) => {
    return (0, bytes_1.hexZeroPad)(bignumber_1.BigNumber.from(value).toHexString(), 32);
};
exports.bytes32ify = bytes32ify;
//# sourceMappingURL=hex-strings.js.map