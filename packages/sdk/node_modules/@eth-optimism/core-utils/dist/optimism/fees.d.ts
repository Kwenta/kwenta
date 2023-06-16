/// <reference types="node" />
import { BigNumber } from '@ethersproject/bignumber';
export declare const txDataZeroGas = 4;
export declare const txDataNonZeroGasEIP2028 = 16;
export declare const scaleDecimals: (value: number | BigNumber, decimals: number | BigNumber) => BigNumber;
export declare const calculateL1GasUsed: (data: string | Buffer, overhead: number | BigNumber) => BigNumber;
export declare const calculateL1Fee: (data: string | Buffer, overhead: number | BigNumber, l1GasPrice: number | BigNumber, scalar: number | BigNumber, decimals: number | BigNumber) => BigNumber;
export declare const zeroesAndOnes: (data: Buffer | string) => Array<number>;
export declare const calldataCost: (data: Buffer | string) => BigNumber;
