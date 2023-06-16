import Wei from '@synthetixio/wei';
import { Emitter, GasLimitEstimate, GasPrice, RevertReasonParams } from '../types/transactions';
export declare const getRevertReason: ({ txHash, networkId, blockNumber, provider, }: RevertReasonParams) => Promise<string>;
export declare function createEmitter(): Emitter;
export declare const getTotalGasPrice: (gasPriceObj?: GasPrice | null) => Wei;
export declare const getTransactionPrice: (gasPrice: GasPrice | null, gasLimit: GasLimitEstimate, ethPrice: Wei | null, optimismLayerOneFee: Wei | null) => Wei | null;
export declare const normalizeGasLimit: (gasLimit: number) => number;
