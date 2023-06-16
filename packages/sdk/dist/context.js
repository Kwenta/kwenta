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
const events_1 = require("events");
const ethcall_1 = require("ethcall");
const sdkErrors = __importStar(require("./common/errors"));
const contracts_1 = require("./contracts");
const DEFAULT_CONTEXT = {
    networkId: 10,
};
class Context {
    constructor(context) {
        this.events = new events_1.EventEmitter().setMaxListeners(100);
        this.context = Object.assign(Object.assign({}, DEFAULT_CONTEXT), context);
        this.multicallProvider = new ethcall_1.Provider(this.networkId, this.context.provider);
        if (context.signer) {
            this.setSigner(context.signer);
        }
        this.contracts = (0, contracts_1.getContractsByNetwork)(context.networkId, context.provider);
        this.multicallContracts = (0, contracts_1.getMulticallContractsByNetwork)(context.networkId);
    }
    get networkId() {
        var _a;
        return (_a = this.context.networkId) !== null && _a !== void 0 ? _a : 10;
    }
    get provider() {
        return this.context.provider;
    }
    get signer() {
        if (!this.context.signer) {
            throw new Error(sdkErrors.NO_SIGNER);
        }
        return this.context.signer;
    }
    get walletAddress() {
        if (!this.context.walletAddress) {
            throw new Error(sdkErrors.NO_SIGNER);
        }
        return this.context.walletAddress;
    }
    get isL2() {
        return [10, 420].includes(this.networkId);
    }
    get isMainnet() {
        return [1, 10].includes(this.networkId);
    }
    setProvider(provider) {
        return __awaiter(this, void 0, void 0, function* () {
            this.context.provider = provider;
            const networkId = (yield provider.getNetwork()).chainId;
            this.multicallProvider = new ethcall_1.Provider(networkId, provider);
            this.setNetworkId(networkId);
            return networkId;
        });
    }
    setNetworkId(networkId) {
        this.context.networkId = networkId;
        this.contracts = (0, contracts_1.getContractsByNetwork)(networkId, this.provider);
        this.multicallContracts = (0, contracts_1.getMulticallContractsByNetwork)(networkId);
        this.events.emit('network_changed', { networkId: networkId });
    }
    setSigner(signer) {
        return __awaiter(this, void 0, void 0, function* () {
            this.context.walletAddress = yield signer.getAddress();
            this.context.signer = signer;
        });
    }
    logError(err, skipReport = false) {
        var _a, _b;
        return (_b = (_a = this.context).logError) === null || _b === void 0 ? void 0 : _b.call(_a, err, skipReport);
    }
}
exports.default = Context;
