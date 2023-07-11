import { EnsInfo, FuturesStat } from '../types/stats'

import { truncateAddress } from './string'

export const mapStat = (ensInfo: EnsInfo) => (stat: FuturesStat, i: number) => ({
	...stat,
	trader: stat.account,
	traderShort: truncateAddress(stat.account),
	rank: i + 1,
	rankText: (i + 1).toString(),
	traderEns: ensInfo[stat.account] ?? null,
})
