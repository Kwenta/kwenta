import KwentaSDK from '..';
import { AccountStat } from '../types/stats';
type LeaderboardPart = 'top' | 'bottom' | 'wallet' | 'search' | 'all';
type LeaderboardResult = {
    [part in LeaderboardPart]: AccountStat[];
};
export default class StatsService {
    private sdk;
    constructor(sdk: KwentaSDK);
    getStatsVolumes(): Promise<void>;
    getFuturesTradersStats(): Promise<void>;
    getFuturesStats(): Promise<AccountStat[]>;
    getLeaderboard(searchTerm: string): Promise<LeaderboardResult>;
    getFuturesCumulativeStats(homepage: boolean): Promise<{
        totalVolume: string;
        averageTradeSize: string;
        totalTraders: any;
        totalTrades: any;
        totalLiquidations: any;
    } | null>;
}
export {};
