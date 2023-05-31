import type { TransactionResponse } from '@ethersproject/providers';
import { ethers, BigNumber } from 'ethers';

export type TransactionEventCode = 'txSent' | 'txConfirmed' | 'txFailed' | 'txError';

export interface TransactionStatusData {
	transactionHash: string;
	status?: number;
	blockNumber?: number;
	failureReason?: string;
}

export interface EmitterListener {
	(state: TransactionStatusData): boolean | undefined | void;
}

export interface Emitter {
	listeners: {
		[key: string]: EmitterListener;
	};
	on: (eventCode: TransactionEventCode, listener: EmitterListener) => void;
	emit: (eventCode: TransactionEventCode, data: TransactionStatusData) => void;
}

export type RevertReasonParams = {
	txHash: string;
	networkId: number;
	blockNumber: number;
	provider: ethers.providers.Provider;
};

export type GetCodeParams = {
	tx: TransactionResponse;
	networkId: number;
	blockNumber: number;
	provider: ethers.providers.Provider;
};

export type GasPrice<T = BigNumber> = {
	baseFeePerGas?: T; // Note that this is used for estimating price and should not be included in the transaction
	maxPriorityFeePerGas?: T;
	maxFeePerGas?: T;
	gasPrice?: T;
};

export type GasLimitEstimate = BigNumber | null;
