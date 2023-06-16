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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositTx = exports.SourceHashDomain = void 0;
const address_1 = require("@ethersproject/address");
const bignumber_1 = require("@ethersproject/bignumber");
const keccak256_1 = require("@ethersproject/keccak256");
const constants_1 = require("@ethersproject/constants");
const RLP = __importStar(require("@ethersproject/rlp"));
const bytes_1 = require("@ethersproject/bytes");
const formatBoolean = (value) => {
    return value ? new Uint8Array([1]) : new Uint8Array([]);
};
const formatNumber = (value, name) => {
    const result = (0, bytes_1.stripZeros)(bignumber_1.BigNumber.from(value).toHexString());
    if (result.length > 32) {
        throw new Error(`invalid length for ${name}`);
    }
    return result;
};
const handleBoolean = (value) => {
    if (value === '0x') {
        return false;
    }
    if (value === '0x01') {
        return true;
    }
    throw new Error(`invalid boolean RLP hex value ${value}`);
};
const handleNumber = (value) => {
    if (value === '0x') {
        return constants_1.Zero;
    }
    return bignumber_1.BigNumber.from(value);
};
const handleAddress = (value) => {
    if (value === '0x') {
        return null;
    }
    return (0, address_1.getAddress)(value);
};
var SourceHashDomain;
(function (SourceHashDomain) {
    SourceHashDomain[SourceHashDomain["UserDeposit"] = 0] = "UserDeposit";
    SourceHashDomain[SourceHashDomain["L1InfoDeposit"] = 1] = "L1InfoDeposit";
})(SourceHashDomain = exports.SourceHashDomain || (exports.SourceHashDomain = {}));
class DepositTx {
    constructor(opts = {}) {
        this.type = 0x7e;
        this.version = 0x00;
        this._sourceHash = opts.sourceHash;
        this.from = opts.from;
        this.to = opts.to;
        this.mint = opts.mint;
        this.value = opts.value;
        this.gas = opts.gas;
        this.isSystemTransaction = opts.isSystemTransaction || false;
        this.data = opts.data;
        this.domain = opts.domain;
        this.l1BlockHash = opts.l1BlockHash;
        this.logIndex = opts.logIndex;
        this.sequenceNumber = opts.sequenceNumber;
    }
    hash() {
        const encoded = this.encode();
        return (0, keccak256_1.keccak256)(encoded);
    }
    sourceHash() {
        if (!this._sourceHash) {
            let marker;
            switch (this.domain) {
                case SourceHashDomain.UserDeposit:
                    marker = bignumber_1.BigNumber.from(this.logIndex).toHexString();
                    break;
                case SourceHashDomain.L1InfoDeposit:
                    marker = bignumber_1.BigNumber.from(this.sequenceNumber).toHexString();
                    break;
                default:
                    throw new Error(`Unknown domain: ${this.domain}`);
            }
            if (!this.l1BlockHash) {
                throw new Error('Need l1BlockHash to compute sourceHash');
            }
            const l1BlockHash = this.l1BlockHash;
            const input = (0, bytes_1.hexConcat)([l1BlockHash, (0, bytes_1.zeroPad)(marker, 32)]);
            const depositIDHash = (0, keccak256_1.keccak256)(input);
            const domain = bignumber_1.BigNumber.from(this.domain).toHexString();
            const domainInput = (0, bytes_1.hexConcat)([(0, bytes_1.zeroPad)(domain, 32), depositIDHash]);
            this._sourceHash = (0, keccak256_1.keccak256)(domainInput);
        }
        return this._sourceHash;
    }
    encode() {
        const fields = [
            this.sourceHash() || '0x',
            (0, address_1.getAddress)(this.from) || '0x',
            this.to != null ? (0, address_1.getAddress)(this.to) : '0x',
            formatNumber(this.mint || 0, 'mint'),
            formatNumber(this.value || 0, 'value'),
            formatNumber(this.gas || 0, 'gas'),
            formatBoolean(this.isSystemTransaction),
            this.data || '0x',
        ];
        return (0, bytes_1.hexConcat)([
            bignumber_1.BigNumber.from(this.type).toHexString(),
            RLP.encode(fields),
        ]);
    }
    decode(raw, extra = {}) {
        const payload = (0, bytes_1.arrayify)(raw);
        if (payload[0] !== this.type) {
            throw new Error(`Invalid type ${payload[0]}`);
        }
        this.version = payload[1];
        const transaction = RLP.decode(payload.slice(1));
        this._sourceHash = transaction[0];
        this.from = handleAddress(transaction[1]);
        this.to = handleAddress(transaction[2]);
        this.mint = handleNumber(transaction[3]);
        this.value = handleNumber(transaction[4]);
        this.gas = handleNumber(transaction[5]);
        this.isSystemTransaction = handleBoolean(transaction[6]);
        this.data = transaction[7];
        if ('l1BlockHash' in extra) {
            this.l1BlockHash = extra.l1BlockHash;
        }
        if ('domain' in extra) {
            this.domain = extra.domain;
        }
        if ('logIndex' in extra) {
            this.logIndex = extra.logIndex;
        }
        if ('sequenceNumber' in extra) {
            this.sequenceNumber = extra.sequenceNumber;
        }
        return this;
    }
    static decode(raw, extra) {
        return new this().decode(raw, extra);
    }
    fromL1Receipt(receipt, index) {
        if (!receipt.events) {
            throw new Error('cannot parse receipt');
        }
        const event = receipt.events[index];
        if (!event) {
            throw new Error(`event index ${index} does not exist`);
        }
        return this.fromL1Event(event);
    }
    static fromL1Receipt(receipt, index) {
        return new this({}).fromL1Receipt(receipt, index);
    }
    fromL1Event(event) {
        if (event.event !== 'TransactionDeposited') {
            throw new Error(`incorrect event type: ${event.event}`);
        }
        if (typeof event.args === 'undefined') {
            throw new Error('no event args');
        }
        if (typeof event.args.from === 'undefined') {
            throw new Error('"from" undefined');
        }
        this.from = event.args.from;
        if (typeof event.args.to === 'undefined') {
            throw new Error('"to" undefined');
        }
        if (typeof event.args.version === 'undefined') {
            throw new Error(`"verison" undefined`);
        }
        if (!event.args.version.eq(0)) {
            throw new Error(`Unsupported version ${event.args.version.toString()}`);
        }
        if (typeof event.args.opaqueData === 'undefined') {
            throw new Error(`"opaqueData" undefined`);
        }
        const opaqueData = event.args.opaqueData;
        if (opaqueData.length < 32 + 32 + 8 + 1) {
            throw new Error(`invalid opaqueData size: ${opaqueData.length}`);
        }
        let offset = 0;
        this.mint = bignumber_1.BigNumber.from((0, bytes_1.hexDataSlice)(opaqueData, offset, offset + 32));
        offset += 32;
        this.value = bignumber_1.BigNumber.from((0, bytes_1.hexDataSlice)(opaqueData, offset, offset + 32));
        offset += 32;
        this.gas = bignumber_1.BigNumber.from((0, bytes_1.hexDataSlice)(opaqueData, offset, offset + 8));
        offset += 8;
        const isCreation = bignumber_1.BigNumber.from(opaqueData[offset]).eq(1);
        offset += 1;
        this.to = isCreation === true ? null : event.args.to;
        const length = opaqueData.length - offset;
        this.isSystemTransaction = false;
        this.data = (0, bytes_1.hexDataSlice)(opaqueData, offset, offset + length);
        this.domain = SourceHashDomain.UserDeposit;
        this.l1BlockHash = event.blockHash;
        this.logIndex = event.logIndex;
        return this;
    }
    static fromL1Event(event) {
        return new this({}).fromL1Event(event);
    }
}
exports.DepositTx = DepositTx;
//# sourceMappingURL=deposit-transaction.js.map