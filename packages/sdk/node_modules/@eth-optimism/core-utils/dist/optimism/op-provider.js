"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpNodeProvider = void 0;
const events_1 = __importDefault(require("events"));
const bignumber_1 = require("@ethersproject/bignumber");
const properties_1 = require("@ethersproject/properties");
const web_1 = require("@ethersproject/web");
const getResult = (payload) => {
    if (payload.error) {
        const error = new Error(payload.error.message);
        error.code = payload.error.code;
        error.data = payload.error.data;
        throw error;
    }
    return payload.result;
};
class OpNodeProvider extends events_1.default {
    constructor(url) {
        super();
        this._nextId = 0;
        if (typeof url === 'string') {
            this.connection = { url };
        }
        else {
            this.connection = url;
        }
    }
    async syncStatus() {
        const result = await this.send('optimism_syncStatus', []);
        return {
            currentL1: {
                hash: result.current_l1.hash,
                number: bignumber_1.BigNumber.from(result.current_l1.number),
                parentHash: result.current_l1.parentHash,
                timestamp: bignumber_1.BigNumber.from(result.current_l1.timestamp),
            },
            headL1: {
                hash: result.head_l1.hash,
                number: bignumber_1.BigNumber.from(result.head_l1.number),
                parentHash: result.head_l1.parentHash,
                timestamp: bignumber_1.BigNumber.from(result.head_l1.timestamp),
            },
            unsafeL2: {
                hash: result.unsafe_l2.hash,
                number: bignumber_1.BigNumber.from(result.unsafe_l2.number),
                parentHash: result.unsafe_l2.parentHash,
                timestamp: bignumber_1.BigNumber.from(result.unsafe_l2.timestamp),
                l1Origin: {
                    hash: result.unsafe_l2.l1origin.hash,
                    number: bignumber_1.BigNumber.from(result.unsafe_l2.l1origin.number),
                },
                sequencerNumber: bignumber_1.BigNumber.from(result.unsafe_l2.sequenceNumber),
            },
            safeL2: {
                hash: result.safe_l2.hash,
                number: bignumber_1.BigNumber.from(result.safe_l2.number),
                parentHash: result.safe_l2.parentHash,
                timestamp: bignumber_1.BigNumber.from(result.safe_l2.timestamp),
                l1Origin: {
                    hash: result.safe_l2.l1origin.hash,
                    number: bignumber_1.BigNumber.from(result.safe_l2.l1origin.number),
                },
                sequencerNumber: bignumber_1.BigNumber.from(result.safe_l2.sequenceNumber),
            },
            finalizedL2: {
                hash: result.finalized_l2.hash,
                number: bignumber_1.BigNumber.from(result.finalized_l2.number),
                parentHash: result.finalized_l2.parentHash,
                timestamp: bignumber_1.BigNumber.from(result.finalized_l2.timestamp),
                l1Origin: {
                    hash: result.finalized_l2.l1origin.hash,
                    number: bignumber_1.BigNumber.from(result.finalized_l2.l1origin.number),
                },
                sequencerNumber: bignumber_1.BigNumber.from(result.finalized_l2.sequenceNumber),
            },
        };
    }
    async rollupConfig() {
        const result = await this.send('optimism_rollupConfig', []);
        return result;
    }
    send(method, params) {
        const request = {
            method,
            params,
            id: this._nextId++,
            jsonrpc: '2.0',
        };
        this.emit('debug', {
            action: 'request',
            request: (0, properties_1.deepCopy)(request),
            provider: this,
        });
        const result = (0, web_1.fetchJson)(this.connection, JSON.stringify(request), getResult).then((res) => {
            this.emit('debug', {
                action: 'response',
                request,
                response: res,
                provider: this,
            });
            return res;
        }, (error) => {
            this.emit('debug', {
                action: 'response',
                error,
                request,
                provider: this,
            });
            throw error;
        });
        return result;
    }
}
exports.OpNodeProvider = OpNodeProvider;
//# sourceMappingURL=op-provider.js.map