"use strict";
// Copied from: https://github.com/Synthetixio/js-monorepo
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
exports.normalizeGasLimit = exports.getTransactionPrice = exports.getTotalGasPrice = exports.createEmitter = exports.getRevertReason = void 0;
const strings_1 = require("@ethersproject/strings");
const wei_1 = require("@synthetixio/wei");
const transactions_1 = require("../constants/transactions");
const isKovan = (networkId) => networkId === 42;
const getRevertReason = ({ txHash, networkId, blockNumber, provider, }) => __awaiter(void 0, void 0, void 0, function* () {
    // Since we are using Infura, we cannot decode Kovan revert reasons
    if (isKovan(networkId))
        return 'Unable to decode revert reason';
    validateInputPreProvider(txHash);
    yield validateInputPostProvider({ txHash, networkId, blockNumber, provider });
    try {
        const tx = yield provider.getTransaction(txHash);
        const code = yield provider.call(tx, blockNumber);
        return decodeMessage(code);
    }
    catch (err) {
        return 'Unable to decode revert reason';
    }
});
exports.getRevertReason = getRevertReason;
const validateInputPreProvider = (txHash) => {
    if (!/^0x([A-Fa-f0-9]{64})$/.test(txHash) || txHash.substring(0, 2) !== '0x') {
        throw new Error('Invalid transaction hash');
    }
};
function validateInputPostProvider({ blockNumber, provider }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof blockNumber === 'number') {
            const currentBlockNumber = yield provider.getBlockNumber();
            blockNumber = Number(blockNumber);
            if (blockNumber > currentBlockNumber) {
                throw new Error('You cannot use a block number that has not yet happened.');
            }
            // A block older than 128 blocks needs access to an archive node
            if (blockNumber < currentBlockNumber - 128)
                throw new Error('You cannot use a block number that is older than 128 blocks. Please use a provider that uses a full archival node.');
        }
    });
}
function decodeMessage(code) {
    let codeString = `0x${code.substring(138)}`.replace(/0+$/, '');
    // If the codeString is an odd number of characters, add a trailing 0
    if (codeString.length % 2 === 1) {
        codeString += '0';
    }
    return (0, strings_1.toUtf8String)(codeString);
}
function createEmitter() {
    return {
        listeners: {},
        on: function (eventCode, listener) {
            switch (eventCode) {
                case 'txSent':
                case 'txConfirmed':
                case 'txFailed':
                case 'txError':
                    break;
                default:
                    throw new Error('Not a valid event');
            }
            if (typeof listener !== 'function') {
                throw new Error('Listener must be a function');
            }
            this.listeners[eventCode] = listener;
        },
        emit: function (eventCode, data) {
            if (this.listeners[eventCode]) {
                return this.listeners[eventCode](data);
            }
        },
    };
}
exports.createEmitter = createEmitter;
const getTotalGasPrice = (gasPriceObj) => {
    if (!gasPriceObj)
        return (0, wei_1.wei)(0);
    const { gasPrice, baseFeePerGas, maxPriorityFeePerGas } = gasPriceObj;
    if (gasPrice) {
        return (0, wei_1.wei)(gasPrice, transactions_1.GWEI_DECIMALS);
    }
    return (0, wei_1.wei)(baseFeePerGas || 0, transactions_1.GWEI_DECIMALS).add((0, wei_1.wei)(maxPriorityFeePerGas || 0, transactions_1.GWEI_DECIMALS));
};
exports.getTotalGasPrice = getTotalGasPrice;
const getTransactionPrice = (gasPrice, gasLimit, ethPrice, optimismLayerOneFee) => {
    if (!gasPrice || !gasLimit || !ethPrice)
        return null;
    const totalGasPrice = (0, exports.getTotalGasPrice)(gasPrice);
    const gasPriceCost = totalGasPrice.mul((0, wei_1.wei)(gasLimit, transactions_1.GWEI_DECIMALS)).mul(ethPrice);
    const l1Cost = ethPrice.mul(optimismLayerOneFee || 0);
    return gasPriceCost.add(l1Cost);
};
exports.getTransactionPrice = getTransactionPrice;
const normalizeGasLimit = (gasLimit) => gasLimit + transactions_1.DEFAULT_GAS_BUFFER;
exports.normalizeGasLimit = normalizeGasLimit;
