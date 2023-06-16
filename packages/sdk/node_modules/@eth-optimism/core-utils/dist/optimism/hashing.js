"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashOutputRootProof = exports.hashWithdrawal = exports.hashCrossDomainMessagev1 = exports.hashCrossDomainMessagev0 = exports.hashCrossDomainMessage = void 0;
const keccak256_1 = require("@ethersproject/keccak256");
const abi_1 = require("@ethersproject/abi");
const encoding_1 = require("./encoding");
const hashCrossDomainMessage = (nonce, sender, target, value, gasLimit, data) => {
    const { version } = (0, encoding_1.decodeVersionedNonce)(nonce);
    if (version.eq(0)) {
        return (0, exports.hashCrossDomainMessagev0)(target, sender, data, nonce);
    }
    else if (version.eq(1)) {
        return (0, exports.hashCrossDomainMessagev1)(nonce, sender, target, value, gasLimit, data);
    }
    throw new Error(`unknown version ${version.toString()}`);
};
exports.hashCrossDomainMessage = hashCrossDomainMessage;
const hashCrossDomainMessagev0 = (target, sender, data, nonce) => {
    return (0, keccak256_1.keccak256)((0, encoding_1.encodeCrossDomainMessageV0)(target, sender, data, nonce));
};
exports.hashCrossDomainMessagev0 = hashCrossDomainMessagev0;
const hashCrossDomainMessagev1 = (nonce, sender, target, value, gasLimit, data) => {
    return (0, keccak256_1.keccak256)((0, encoding_1.encodeCrossDomainMessageV1)(nonce, sender, target, value, gasLimit, data));
};
exports.hashCrossDomainMessagev1 = hashCrossDomainMessagev1;
const hashWithdrawal = (nonce, sender, target, value, gasLimit, data) => {
    const types = ['uint256', 'address', 'address', 'uint256', 'uint256', 'bytes'];
    const encoded = abi_1.defaultAbiCoder.encode(types, [
        nonce,
        sender,
        target,
        value,
        gasLimit,
        data,
    ]);
    return (0, keccak256_1.keccak256)(encoded);
};
exports.hashWithdrawal = hashWithdrawal;
const hashOutputRootProof = (proof) => {
    return (0, keccak256_1.keccak256)(abi_1.defaultAbiCoder.encode(['bytes32', 'bytes32', 'bytes32', 'bytes32'], [
        proof.version,
        proof.stateRoot,
        proof.messagePasserStorageRoot,
        proof.latestBlockhash,
    ]));
};
exports.hashOutputRootProof = hashOutputRootProof;
//# sourceMappingURL=hashing.js.map