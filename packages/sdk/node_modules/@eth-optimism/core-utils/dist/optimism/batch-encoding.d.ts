/// <reference types="node" />
import { Transaction } from '@ethersproject/transactions';
import { Struct, BufferWriter, BufferReader } from 'bufio';
export interface BatchContext {
    numSequencedTransactions: number;
    numSubsequentQueueTransactions: number;
    timestamp: number;
    blockNumber: number;
}
export declare enum BatchType {
    LEGACY = -1,
    ZLIB = 0
}
export interface AppendSequencerBatchParams {
    shouldStartAtElement: number;
    totalElementsToAppend: number;
    contexts: BatchContext[];
    transactions: string[];
    type?: BatchType;
}
export declare const encodeAppendSequencerBatch: (b: AppendSequencerBatchParams) => string;
export declare const decodeAppendSequencerBatch: (b: string) => AppendSequencerBatchParams;
export declare const sequencerBatch: {
    encode: (params: AppendSequencerBatchParams) => string;
    decode: (b: string) => AppendSequencerBatchParams;
};
export declare class Context extends Struct {
    numSequencedTransactions: number;
    numSubsequentQueueTransactions: number;
    timestamp: number;
    blockNumber: number;
    constructor(options?: Partial<Context>);
    getSize(): number;
    write(bw: BufferWriter): BufferWriter;
    read(br: BufferReader): this;
    toJSON(): {
        numSequencedTransactions: number;
        numSubsequentQueueTransactions: number;
        timestamp: number;
        blockNumber: number;
    };
}
export declare class BatchedTx extends Struct {
    txSize: number;
    raw: Buffer;
    tx: Transaction;
    constructor(tx?: Transaction);
    getSize(): number;
    write(bw: BufferWriter): BufferWriter;
    read(br: BufferReader): this;
    toTransaction(): Transaction;
    toHexTransaction(): string;
    toJSON(): {
        nonce: number;
        gasPrice: string;
        gasLimit: string;
        to: string;
        value: string;
        data: string;
        v: number;
        r: string;
        s: string;
        chainId: number;
        hash: string;
        from: string;
    };
    fromTransaction(tx: string): this;
    fromHex(s: string, extra?: object): this;
    static fromTransaction(s: string): BatchedTx;
}
export declare class SequencerBatch extends Struct {
    shouldStartAtElement: number;
    totalElementsToAppend: number;
    contexts: Context[];
    transactions: BatchedTx[];
    type: BatchType;
    constructor(options?: Partial<SequencerBatch>);
    write(bw: BufferWriter): BufferWriter;
    read(br: BufferReader): this;
    getSize(): number;
    fromHex(s: string, extra?: object): this;
    toHex(): string;
    toJSON(): {
        shouldStartAtElement: number;
        totalElementsToAppend: number;
        contexts: {
            numSequencedTransactions: number;
            numSubsequentQueueTransactions: number;
            timestamp: number;
            blockNumber: number;
        }[];
        transactions: {
            nonce: number;
            gasPrice: string;
            gasLimit: string;
            to: string;
            value: string;
            data: string;
            v: number;
            r: string;
            s: string;
            chainId: number;
            hash: string;
            from: string;
        }[];
    };
}
