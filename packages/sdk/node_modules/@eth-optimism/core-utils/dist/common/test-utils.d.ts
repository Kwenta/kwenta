import { BigNumber } from '@ethersproject/bignumber';
interface deviationRanges {
    percentUpperDeviation?: number;
    percentLowerDeviation?: number;
    absoluteUpperDeviation?: number;
    absoluteLowerDeviation?: number;
}
export declare const awaitCondition: (cond: () => Promise<boolean>, rate?: number, attempts?: number) => Promise<void>;
export declare const expectApprox: (actual: BigNumber | number, target: BigNumber | number, { percentUpperDeviation, percentLowerDeviation, absoluteUpperDeviation, absoluteLowerDeviation, }: deviationRanges) => void;
export {};
