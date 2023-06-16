/// <reference types="node" />
import { BigNumber } from '@ethersproject/bignumber';
export declare const remove0x: (str: string) => string;
export declare const add0x: (str: string) => string;
export declare const fromHexString: (inp: Buffer | string) => Buffer;
export declare const toHexString: (inp: Buffer | string | number | null) => string;
export declare const toRpcHexString: (n: number | BigNumber) => string;
export declare const padHexString: (str: string, length: number) => string;
export declare const encodeHex: (val: any, len: number) => string;
export declare const hexStringEquals: (stringA: string, stringB: string) => boolean;
export declare const bytes32ify: (value: number | BigNumber) => string;
