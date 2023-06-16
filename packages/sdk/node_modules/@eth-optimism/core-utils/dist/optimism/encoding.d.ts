import { BigNumberish, BigNumber } from '@ethersproject/bignumber';
export declare const encodeVersionedNonce: (nonce: BigNumber, version: BigNumber) => BigNumber;
export declare const decodeVersionedNonce: (nonce: BigNumber) => {
    version: BigNumber;
    nonce: BigNumber;
};
export declare const encodeCrossDomainMessageV0: (target: string, sender: string, data: string, nonce: BigNumber) => string;
export declare const encodeCrossDomainMessageV1: (nonce: BigNumber, sender: string, target: string, value: BigNumberish, gasLimit: BigNumberish, data: string) => string;
export declare const encodeCrossDomainMessage: (nonce: BigNumber, sender: string, target: string, value: BigNumber, gasLimit: BigNumber, data: string) => string;
