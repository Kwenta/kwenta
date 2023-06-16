/// <reference types="node" />
import EventEmitter from 'events';
import { BigNumber } from '@ethersproject/bignumber';
import { ConnectionInfo } from '@ethersproject/web';
export interface BlockDescriptor {
    hash: string;
    number: BigNumber;
    parentHash: string;
    timestamp: BigNumber;
}
export interface L2BlockDescriptor extends BlockDescriptor {
    l1Origin: {
        hash: string;
        number: BigNumber;
    };
    sequencerNumber: BigNumber;
}
export interface SyncStatusResponse {
    currentL1: BlockDescriptor;
    headL1: BlockDescriptor;
    unsafeL2: L2BlockDescriptor;
    safeL2: L2BlockDescriptor;
    finalizedL2: L2BlockDescriptor;
}
export declare class OpNodeProvider extends EventEmitter {
    readonly connection: ConnectionInfo;
    private _nextId;
    constructor(url?: ConnectionInfo | string);
    syncStatus(): Promise<SyncStatusResponse>;
    rollupConfig(): Promise<any>;
    send(method: string, params: Array<any>): Promise<any>;
}
