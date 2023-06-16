import { ethers } from 'ethers';
import KwentaSDK from '..';
import { Emitter } from '../types/transactions';
import { ContractName } from '../contracts';
export default class TransactionsService {
    private sdk;
    constructor(sdk: KwentaSDK);
    hash(transactionHash: string): Emitter;
    watchTransaction(transactionHash: string, emitter: Emitter): void;
    createContractTxn(contract: ethers.Contract, method: string, args: any[], txnOptions?: Partial<ethers.providers.TransactionRequest>, options?: {
        gasLimitBuffer?: number;
    }): Promise<ethers.providers.TransactionResponse>;
    createEVMTxn(txn: ethers.providers.TransactionRequest, options?: any): Promise<ethers.providers.TransactionResponse>;
    createSynthetixTxn(contractName: ContractName, method: string, args: any[], txnOptions?: Partial<ethers.providers.TransactionRequest>, options?: any): Promise<ethers.providers.TransactionResponse>;
    estimateGas(txn: ethers.providers.TransactionRequest): Promise<ethers.BigNumber>;
    getOptimismLayerOneFees(txn?: ethers.providers.TransactionRequest): Promise<import("@synthetixio/wei").default | null>;
    getGasPrice(): Promise<{
        fastest: {
            gasPrice: ethers.BigNumber;
        };
        fast: {
            gasPrice: ethers.BigNumber;
        };
        average: {
            gasPrice: ethers.BigNumber;
        };
    } | {
        fastest: {
            maxPriorityFeePerGas: ethers.BigNumber;
            maxFeePerGas: ethers.BigNumber;
            baseFeePerGas: ethers.BigNumber;
        };
        fast: {
            maxPriorityFeePerGas: ethers.BigNumber;
            maxFeePerGas: ethers.BigNumber;
            baseFeePerGas: ethers.BigNumber;
        };
        average: {
            maxPriorityFeePerGas: ethers.BigNumber;
            maxFeePerGas: ethers.BigNumber;
            baseFeePerGas: ethers.BigNumber;
        };
    }>;
}
