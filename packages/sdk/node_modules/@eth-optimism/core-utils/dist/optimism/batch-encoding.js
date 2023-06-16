"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequencerBatch = exports.BatchedTx = exports.Context = exports.sequencerBatch = exports.decodeAppendSequencerBatch = exports.encodeAppendSequencerBatch = exports.BatchType = void 0;
const zlib_1 = __importDefault(require("zlib"));
const transactions_1 = require("@ethersproject/transactions");
const bufio_1 = require("bufio");
const hash_1 = require("@ethersproject/hash");
const common_1 = require("../common");
var BatchType;
(function (BatchType) {
    BatchType[BatchType["LEGACY"] = -1] = "LEGACY";
    BatchType[BatchType["ZLIB"] = 0] = "ZLIB";
})(BatchType = exports.BatchType || (exports.BatchType = {}));
const APPEND_SEQUENCER_BATCH_METHOD_ID = 'appendSequencerBatch()';
const FOUR_BYTE_APPEND_SEQUENCER_BATCH = Buffer.from((0, hash_1.id)(APPEND_SEQUENCER_BATCH_METHOD_ID).slice(2, 10), 'hex');
const encodeAppendSequencerBatch = (b) => {
    for (const tx of b.transactions) {
        if (tx.length % 2 !== 0) {
            throw new Error('Unexpected uneven hex string value!');
        }
    }
    const batch = exports.sequencerBatch.encode(b);
    const fnSelector = batch.slice(2, 10);
    if (fnSelector !== FOUR_BYTE_APPEND_SEQUENCER_BATCH.toString('hex')) {
        throw new Error(`Incorrect function signature`);
    }
    return batch.slice(10);
};
exports.encodeAppendSequencerBatch = encodeAppendSequencerBatch;
const decodeAppendSequencerBatch = (b) => {
    const calldata = '0x' + FOUR_BYTE_APPEND_SEQUENCER_BATCH.toString('hex') + (0, common_1.remove0x)(b);
    return exports.sequencerBatch.decode(calldata);
};
exports.decodeAppendSequencerBatch = decodeAppendSequencerBatch;
exports.sequencerBatch = {
    encode: (params) => {
        const batch = new SequencerBatch({
            shouldStartAtElement: params.shouldStartAtElement,
            totalElementsToAppend: params.totalElementsToAppend,
            contexts: params.contexts.map((c) => new Context(c)),
            transactions: params.transactions.map((t) => BatchedTx.fromTransaction(t)),
            type: params.type,
        });
        return batch.toHex();
    },
    decode: (b) => {
        const buf = Buffer.from((0, common_1.remove0x)(b), 'hex');
        const fnSelector = buf.slice(0, 4);
        if (Buffer.compare(fnSelector, FOUR_BYTE_APPEND_SEQUENCER_BATCH) !== 0) {
            throw new Error(`Incorrect function signature`);
        }
        const batch = SequencerBatch.decode(buf);
        const params = {
            shouldStartAtElement: batch.shouldStartAtElement,
            totalElementsToAppend: batch.totalElementsToAppend,
            contexts: batch.contexts.map((c) => ({
                numSequencedTransactions: c.numSequencedTransactions,
                numSubsequentQueueTransactions: c.numSubsequentQueueTransactions,
                timestamp: c.timestamp,
                blockNumber: c.blockNumber,
            })),
            transactions: batch.transactions.map((t) => t.toHexTransaction()),
            type: batch.type,
        };
        return params;
    },
};
class Context extends bufio_1.Struct {
    constructor(options = {}) {
        super();
        this.numSequencedTransactions = 0;
        this.numSubsequentQueueTransactions = 0;
        this.timestamp = 0;
        this.blockNumber = 0;
        if (typeof options.numSequencedTransactions === 'number') {
            this.numSequencedTransactions = options.numSequencedTransactions;
        }
        if (typeof options.numSubsequentQueueTransactions === 'number') {
            this.numSubsequentQueueTransactions =
                options.numSubsequentQueueTransactions;
        }
        if (typeof options.timestamp === 'number') {
            this.timestamp = options.timestamp;
        }
        if (typeof options.blockNumber === 'number') {
            this.blockNumber = options.blockNumber;
        }
    }
    getSize() {
        return 16;
    }
    write(bw) {
        bw.writeU24BE(this.numSequencedTransactions);
        bw.writeU24BE(this.numSubsequentQueueTransactions);
        bw.writeU40BE(this.timestamp);
        bw.writeU40BE(this.blockNumber);
        return bw;
    }
    read(br) {
        this.numSequencedTransactions = br.readU24BE();
        this.numSubsequentQueueTransactions = br.readU24BE();
        this.timestamp = br.readU40BE();
        this.blockNumber = br.readU40BE();
        return this;
    }
    toJSON() {
        return {
            numSequencedTransactions: this.numSequencedTransactions,
            numSubsequentQueueTransactions: this.numSubsequentQueueTransactions,
            timestamp: this.timestamp,
            blockNumber: this.blockNumber,
        };
    }
}
exports.Context = Context;
class BatchedTx extends bufio_1.Struct {
    constructor(tx) {
        super();
        this.tx = tx;
    }
    getSize() {
        if (this.raw && this.raw.length) {
            return this.raw.length + 3;
        }
        const tx = (0, transactions_1.serialize)({
            nonce: this.tx.nonce,
            gasPrice: this.tx.gasPrice,
            gasLimit: this.tx.gasLimit,
            to: this.tx.to,
            value: this.tx.value,
            data: this.tx.data,
        }, {
            v: this.tx.v,
            r: this.tx.r,
            s: this.tx.s,
        });
        this.raw = Buffer.from((0, common_1.remove0x)(tx), 'hex');
        return this.raw.length + 3;
    }
    write(bw) {
        bw.writeU24BE(this.txSize);
        bw.writeBytes(this.raw);
        return bw;
    }
    read(br) {
        this.txSize = br.readU24BE();
        this.raw = br.readBytes(this.txSize);
        return this;
    }
    toTransaction() {
        if (this.tx) {
            return this.tx;
        }
        return (0, transactions_1.parse)(this.raw);
    }
    toHexTransaction() {
        if (this.raw) {
            return '0x' + this.raw.toString('hex');
        }
        return (0, transactions_1.serialize)({
            nonce: this.tx.nonce,
            gasPrice: this.tx.gasPrice,
            gasLimit: this.tx.gasLimit,
            to: this.tx.to,
            value: this.tx.value,
            data: this.tx.data,
        }, {
            v: this.tx.v,
            r: this.tx.r,
            s: this.tx.s,
        });
    }
    toJSON() {
        if (!this.tx) {
            this.tx = (0, transactions_1.parse)(this.raw);
        }
        return {
            nonce: this.tx.nonce,
            gasPrice: this.tx.gasPrice.toString(),
            gasLimit: this.tx.gasLimit.toString(),
            to: this.tx.to,
            value: this.tx.value.toString(),
            data: this.tx.data,
            v: this.tx.v,
            r: this.tx.r,
            s: this.tx.s,
            chainId: this.tx.chainId,
            hash: this.tx.hash,
            from: this.tx.from,
        };
    }
    fromTransaction(tx) {
        this.raw = Buffer.from((0, common_1.remove0x)(tx), 'hex');
        this.txSize = this.raw.length;
        return this;
    }
    fromHex(s, extra) {
        const buffer = Buffer.from((0, common_1.remove0x)(s), 'hex');
        return this.decode(buffer, extra);
    }
    static fromTransaction(s) {
        return new this().fromTransaction(s);
    }
}
exports.BatchedTx = BatchedTx;
class SequencerBatch extends bufio_1.Struct {
    constructor(options = {}) {
        super();
        this.contexts = [];
        this.transactions = [];
        if (typeof options.shouldStartAtElement === 'number') {
            this.shouldStartAtElement = options.shouldStartAtElement;
        }
        if (typeof options.totalElementsToAppend === 'number') {
            this.totalElementsToAppend = options.totalElementsToAppend;
        }
        if (Array.isArray(options.contexts)) {
            this.contexts = options.contexts;
        }
        if (Array.isArray(options.transactions)) {
            this.transactions = options.transactions;
        }
        if (typeof options.type === 'number') {
            this.type = options.type;
        }
    }
    write(bw) {
        bw.writeBytes(FOUR_BYTE_APPEND_SEQUENCER_BATCH);
        bw.writeU40BE(this.shouldStartAtElement);
        bw.writeU24BE(this.totalElementsToAppend);
        const contexts = this.contexts.slice();
        if (this.type === BatchType.ZLIB) {
            contexts.unshift(new Context({
                blockNumber: 0,
                timestamp: 0,
                numSequencedTransactions: 0,
                numSubsequentQueueTransactions: 0,
            }));
        }
        bw.writeU24BE(contexts.length);
        for (const context of contexts) {
            context.write(bw);
        }
        if (this.type === BatchType.ZLIB) {
            const writer = new bufio_1.BufferWriter();
            for (const tx of this.transactions) {
                tx.write(writer);
            }
            const compressed = zlib_1.default.deflateSync(writer.render());
            bw.writeBytes(compressed);
        }
        else {
            for (const tx of this.transactions) {
                tx.write(bw);
            }
        }
        return bw;
    }
    read(br) {
        const selector = br.readBytes(4);
        if (Buffer.compare(selector, FOUR_BYTE_APPEND_SEQUENCER_BATCH) !== 0) {
            br.seek(-4);
        }
        this.type = BatchType.LEGACY;
        this.shouldStartAtElement = br.readU40BE();
        this.totalElementsToAppend = br.readU24BE();
        const contexts = br.readU24BE();
        for (let i = 0; i < contexts; i++) {
            const context = Context.read(br);
            this.contexts.push(context);
        }
        if (this.contexts.length > 0 && this.contexts[0].timestamp === 0) {
            switch (this.contexts[0].blockNumber) {
                case 0: {
                    this.type = BatchType.ZLIB;
                    const bytes = br.readBytes(br.left());
                    const inflated = zlib_1.default.inflateSync(bytes);
                    br = new bufio_1.BufferReader(inflated);
                    this.contexts = this.contexts.slice(1);
                    break;
                }
            }
        }
        for (const context of this.contexts) {
            for (let i = 0; i < context.numSequencedTransactions; i++) {
                const tx = BatchedTx.read(br);
                this.transactions.push(tx);
            }
        }
        return this;
    }
    getSize() {
        if (this.type === BatchType.ZLIB) {
            return -1;
        }
        let size = 8 + 3 + 4;
        for (const context of this.contexts) {
            size += context.getSize();
        }
        for (const tx of this.transactions) {
            size += tx.getSize();
        }
        return size;
    }
    fromHex(s, extra) {
        const buffer = Buffer.from((0, common_1.remove0x)(s), 'hex');
        return this.decode(buffer, extra);
    }
    toHex() {
        return '0x' + this.encode().toString('hex');
    }
    toJSON() {
        return {
            shouldStartAtElement: this.shouldStartAtElement,
            totalElementsToAppend: this.totalElementsToAppend,
            contexts: this.contexts.map((c) => c.toJSON()),
            transactions: this.transactions.map((tx) => tx.toJSON()),
        };
    }
}
exports.SequencerBatch = SequencerBatch;
//# sourceMappingURL=batch-encoding.js.map