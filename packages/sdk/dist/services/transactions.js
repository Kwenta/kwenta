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
const contracts_1 = require("@eth-optimism/contracts");
const wei_1 = require("@synthetixio/wei");
const ethers_1 = require("ethers");
const lodash_1 = require("lodash");
const gas_1 = require("../common/gas");
const transactions_1 = require("../constants/transactions");
const common_1 = require("../types/common");
const transactions_2 = require("../utils/transactions");
const sdkErrors = __importStar(require("../common/errors"));
const bignumber_1 = require("@ethersproject/bignumber");
const OVMGasPriceOracle = (0, contracts_1.getContractFactory)('OVM_GasPriceOracle').attach(contracts_1.predeploys.OVM_GasPriceOracle);
const contractAbi = JSON.parse(OVMGasPriceOracle.interface.format(ethers_1.ethers.utils.FormatTypes.json));
const DEFAULT_GAS_BUFFER = 0.2;
class TransactionsService {
    constructor(sdk) {
        this.sdk = sdk;
    }
    // Copied over from: https://github.com/Synthetixio/js-monorepo
    hash(transactionHash) {
        const emitter = (0, transactions_2.createEmitter)();
        setTimeout(() => this.watchTransaction(transactionHash, emitter), 5);
        return emitter;
    }
    watchTransaction(transactionHash, emitter) {
        emitter.emit(transactions_1.TRANSACTION_EVENTS_MAP.txSent, { transactionHash });
        this.sdk.context.provider
            .waitForTransaction(transactionHash)
            .then(({ status, blockNumber, transactionHash }) => {
            if (status === 1) {
                emitter.emit(transactions_1.TRANSACTION_EVENTS_MAP.txConfirmed, {
                    status,
                    blockNumber,
                    transactionHash,
                });
            }
            else {
                setTimeout(() => {
                    this.sdk.context.provider.getNetwork().then(({ chainId }) => {
                        try {
                            (0, transactions_2.getRevertReason)({
                                txHash: transactionHash,
                                networkId: chainId,
                                blockNumber,
                                provider: this.sdk.context.provider,
                            }).then((revertReason) => emitter.emit(transactions_1.TRANSACTION_EVENTS_MAP.txFailed, {
                                transactionHash,
                                failureReason: revertReason,
                            }));
                        }
                        catch (e) {
                            emitter.emit(transactions_1.TRANSACTION_EVENTS_MAP.txFailed, {
                                transactionHash,
                                failureReason: 'Transaction reverted for an unknown reason',
                            });
                        }
                    });
                }, 5000);
            }
        });
    }
    createContractTxn(contract, method, args, txnOptions = {}, options) {
        const txn = Object.assign({ to: contract.address, data: contract.interface.encodeFunctionData(method, args), value: bignumber_1.BigNumber.from(0) }, txnOptions);
        return this.createEVMTxn(txn, options);
    }
    createEVMTxn(txn, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const execTxn = (0, lodash_1.clone)(txn);
            if (!execTxn.gasLimit) {
                const newGasLimit = yield this.estimateGas(execTxn);
                execTxn.gasLimit = (0, wei_1.wei)(newGasLimit !== null && newGasLimit !== void 0 ? newGasLimit : 0, 9)
                    .mul(1 + ((options === null || options === void 0 ? void 0 : options.gasLimitBuffer) || DEFAULT_GAS_BUFFER))
                    .toBN();
            }
            const txnData = yield this.sdk.context.signer.sendTransaction(execTxn);
            return txnData;
        });
    }
    createSynthetixTxn(contractName, method, args, txnOptions = {}, options) {
        const contract = this.sdk.context.contracts[contractName];
        if (!contract) {
            throw new Error(sdkErrors.UNSUPPORTED_NETWORK);
        }
        return this.createContractTxn(contract, method, args, txnOptions, options);
    }
    estimateGas(txn) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sdk.context.signer.estimateGas((0, lodash_1.omit)(txn, ['gasPrice', 'maxPriorityFeePerGas', 'maxFeePerGas']));
        });
    }
    getOptimismLayerOneFees(txn) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!txn || !this.sdk.context.signer)
                return null;
            const isNotOvm = this.sdk.context.networkId !== common_1.NetworkIdByName['mainnet-ovm'] &&
                this.sdk.context.networkId !== common_1.NetworkIdByName['kovan-ovm'] &&
                this.sdk.context.networkId !== common_1.NetworkIdByName['goerli-ovm'];
            if (isNotOvm) {
                return null;
            }
            const OptimismGasPriceOracleContract = new ethers_1.ethers.Contract(OVMGasPriceOracle.address, contractAbi, this.sdk.context.signer);
            const cleanedTxn = (0, lodash_1.omit)(txn, ['from', 'maxPriorityFeePerGas', 'maxFeePerGas']);
            const serializedTxn = ethers_1.ethers.utils.serializeTransaction(cleanedTxn);
            return (0, wei_1.wei)(yield OptimismGasPriceOracleContract.getL1Fee(serializedTxn));
        });
    }
    getGasPrice() {
        return (0, gas_1.getEthGasPrice)(this.sdk.context.networkId, this.sdk.context.provider);
    }
}
exports.default = TransactionsService;
