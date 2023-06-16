import { wei } from '@synthetixio/wei';

import { FuturesStat } from '../types/stats';

import { weiFromWei } from './number';
import { truncateAddress } from './string';

export const mapStat = (stat: FuturesStat, i: number) => ({
	...stat,
	trader: stat.account,
	traderShort: truncateAddress(stat.account),
	pnl: weiFromWei(stat.pnlWithFeesPaid),
	totalVolume: weiFromWei(stat.totalVolume),
	totalTrades: wei(stat.totalTrades).toNumber(),
	liquidations: wei(stat.liquidations).toNumber(),
	rank: i + 1,
	rankText: (i + 1).toString(),
});
