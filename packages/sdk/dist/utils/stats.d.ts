import { FuturesStat } from '../types/stats';
export declare const mapStat: (stat: FuturesStat, i: number) => {
    trader: string;
    traderShort: string;
    pnl: import("@synthetixio/wei").default;
    totalVolume: import("@synthetixio/wei").default;
    totalTrades: number;
    liquidations: number;
    rank: number;
    rankText: string;
    account: string;
    pnlWithFeesPaid: import("@synthetixio/wei").default;
};
