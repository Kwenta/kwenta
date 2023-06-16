import KwentaSDK from '..';
import { SynthBalance } from '../types/synths';
export default class SynthsService {
    private sdk;
    constructor(sdk: KwentaSDK);
    getSynthBalances(walletAddress: string): Promise<{
        balancesMap: Record<string, SynthBalance>;
        balances: SynthBalance[];
        totalUSDBalance: import("@synthetixio/wei").default;
        susdWalletBalance: import("@synthetixio/wei").default;
    }>;
}
