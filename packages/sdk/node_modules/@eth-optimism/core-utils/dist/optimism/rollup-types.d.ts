import { BlockWithTransactions, TransactionResponse } from '@ethersproject/abstract-provider';
export interface RollupInfo {
    mode: 'sequencer' | 'verifier';
    syncing: boolean;
    ethContext: {
        blockNumber: number;
        timestamp: number;
    };
    rollupContext: {
        index: number;
        queueIndex: number;
    };
}
export declare enum QueueOrigin {
    Sequencer = "sequencer",
    L1ToL2 = "l1"
}
export interface L2Transaction extends TransactionResponse {
    l1BlockNumber: number;
    l1TxOrigin: string;
    queueOrigin: string;
    rawTransaction: string;
}
export interface L2Block extends BlockWithTransactions {
    stateRoot: string;
    transactions: [L2Transaction];
}
export interface BatchElement {
    stateRoot: string;
    isSequencerTx: boolean;
    rawTransaction: undefined | string;
    timestamp: number;
    blockNumber: number;
}
export type Batch = BatchElement[];
