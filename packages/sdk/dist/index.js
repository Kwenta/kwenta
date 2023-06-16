"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = __importDefault(require("./context"));
const exchange_1 = __importDefault(require("./services/exchange"));
const futures_1 = __importDefault(require("./services/futures"));
const kwentaToken_1 = __importDefault(require("./services/kwentaToken"));
const prices_1 = __importDefault(require("./services/prices"));
const synths_1 = __importDefault(require("./services/synths"));
const system_1 = __importDefault(require("./services/system"));
const transactions_1 = __importDefault(require("./services/transactions"));
class KwentaSDK {
    constructor(context) {
        this.context = new context_1.default(context);
        this.exchange = new exchange_1.default(this);
        this.futures = new futures_1.default(this);
        this.prices = new prices_1.default(this);
        this.synths = new synths_1.default(this);
        this.transactions = new transactions_1.default(this);
        this.kwentaToken = new kwentaToken_1.default(this);
        this.system = new system_1.default(this);
    }
    setProvider(provider) {
        return this.context.setProvider(provider);
    }
    setSigner(signer) {
        return this.context.setSigner(signer);
    }
}
exports.default = KwentaSDK;
