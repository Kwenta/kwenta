import { NetworkId } from "../types/common";
export declare function getEpochDetails(networkId: number, epoch: number): {
    epochStart: number;
    epochEnd: number;
};
export declare function getApy(totalStakedBalance: number, weekCounter: number): import("@synthetixio/wei").default;
export declare const parseEpochData: (index: number, networkId?: NetworkId) => {
    period: number;
    start: number;
    end: number;
    label: string;
};
