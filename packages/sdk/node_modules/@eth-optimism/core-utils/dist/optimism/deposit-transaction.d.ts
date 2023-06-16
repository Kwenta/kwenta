import { ContractReceipt, Event } from '@ethersproject/contracts';
import { BigNumberish } from '@ethersproject/bignumber';
import { BytesLike } from '@ethersproject/bytes';
export declare enum SourceHashDomain {
    UserDeposit = 0,
    L1InfoDeposit = 1
}
interface DepositTxOpts {
    sourceHash?: string;
    from: string;
    to: string | null;
    mint: BigNumberish;
    value: BigNumberish;
    gas: BigNumberish;
    isSystemTransaction: boolean;
    data: string;
    domain?: SourceHashDomain;
    l1BlockHash?: string;
    logIndex?: BigNumberish;
    sequenceNumber?: BigNumberish;
}
interface DepositTxExtraOpts {
    domain?: SourceHashDomain;
    l1BlockHash?: string;
    logIndex?: BigNumberish;
    sequenceNumber?: BigNumberish;
}
export declare class DepositTx {
    type: number;
    version: number;
    private _sourceHash?;
    from: string;
    to: string | null;
    mint: BigNumberish;
    value: BigNumberish;
    gas: BigNumberish;
    isSystemTransaction: boolean;
    data: BigNumberish;
    domain?: SourceHashDomain;
    l1BlockHash?: string;
    logIndex?: BigNumberish;
    sequenceNumber?: BigNumberish;
    constructor(opts?: Partial<DepositTxOpts>);
    hash(): string;
    sourceHash(): string;
    encode(): string;
    decode(raw: BytesLike, extra?: DepositTxExtraOpts): this;
    static decode(raw: BytesLike, extra?: DepositTxExtraOpts): DepositTx;
    fromL1Receipt(receipt: ContractReceipt, index: number): DepositTx;
    static fromL1Receipt(receipt: ContractReceipt, index: number): DepositTx;
    fromL1Event(event: Event): DepositTx;
    static fromL1Event(event: Event): DepositTx;
}
export {};
