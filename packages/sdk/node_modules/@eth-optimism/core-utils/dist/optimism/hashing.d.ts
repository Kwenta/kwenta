import { BigNumberish, BigNumber } from '@ethersproject/bignumber';
export interface BedrockOutputData {
    outputRoot: string;
    l1Timestamp: number;
    l2BlockNumber: number;
    l2OutputIndex: number;
}
export interface OutputRootProof {
    version: string;
    stateRoot: string;
    messagePasserStorageRoot: string;
    latestBlockhash: string;
}
export interface BedrockCrossChainMessageProof {
    l2OutputIndex: number;
    outputRootProof: OutputRootProof;
    withdrawalProof: string[];
}
export type L2OutputOracleParameters = {
    submissionInterval: number;
    startingBlockNumber: number;
    l2BlockTime: number;
};
export declare const hashCrossDomainMessage: (nonce: BigNumber, sender: string, target: string, value: BigNumber, gasLimit: BigNumber, data: string) => string;
export declare const hashCrossDomainMessagev0: (target: string, sender: string, data: string, nonce: BigNumber) => string;
export declare const hashCrossDomainMessagev1: (nonce: BigNumber, sender: string, target: string, value: BigNumberish, gasLimit: BigNumberish, data: string) => string;
export declare const hashWithdrawal: (nonce: BigNumber, sender: string, target: string, value: BigNumber, gasLimit: BigNumber, data: string) => string;
export declare const hashOutputRootProof: (proof: OutputRootProof) => string;
