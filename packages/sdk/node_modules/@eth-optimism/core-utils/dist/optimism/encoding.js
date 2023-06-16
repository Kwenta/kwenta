"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeCrossDomainMessage = exports.encodeCrossDomainMessageV1 = exports.encodeCrossDomainMessageV0 = exports.decodeVersionedNonce = exports.encodeVersionedNonce = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const abi_1 = require("@ethersproject/abi");
const iface = new abi_1.Interface([
    'function relayMessage(address,address,bytes,uint256)',
    'function relayMessage(uint256,address,address,uint256,uint256,bytes)',
]);
const nonceMask = bignumber_1.BigNumber.from('0x0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
const encodeVersionedNonce = (nonce, version) => {
    return version.or(nonce.shl(240));
};
exports.encodeVersionedNonce = encodeVersionedNonce;
const decodeVersionedNonce = (nonce) => {
    return {
        version: nonce.shr(240),
        nonce: nonce.and(nonceMask),
    };
};
exports.decodeVersionedNonce = decodeVersionedNonce;
const encodeCrossDomainMessageV0 = (target, sender, data, nonce) => {
    return iface.encodeFunctionData('relayMessage(address,address,bytes,uint256)', [target, sender, data, nonce]);
};
exports.encodeCrossDomainMessageV0 = encodeCrossDomainMessageV0;
const encodeCrossDomainMessageV1 = (nonce, sender, target, value, gasLimit, data) => {
    return iface.encodeFunctionData('relayMessage(uint256,address,address,uint256,uint256,bytes)', [nonce, sender, target, value, gasLimit, data]);
};
exports.encodeCrossDomainMessageV1 = encodeCrossDomainMessageV1;
const encodeCrossDomainMessage = (nonce, sender, target, value, gasLimit, data) => {
    const { version } = (0, exports.decodeVersionedNonce)(nonce);
    if (version.eq(0)) {
        return (0, exports.encodeCrossDomainMessageV0)(target, sender, data, nonce);
    }
    else if (version.eq(1)) {
        return (0, exports.encodeCrossDomainMessageV1)(nonce, sender, target, value, gasLimit, data);
    }
    throw new Error(`unknown version ${version.toString()}`);
};
exports.encodeCrossDomainMessage = encodeCrossDomainMessage;
//# sourceMappingURL=encoding.js.map