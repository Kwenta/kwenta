import { AccountStat, Leaderboard } from '@kwenta/sdk/types'
import { weiFromWei } from '@kwenta/sdk/utils'
import Wei, { wei } from '@synthetixio/wei'

export const unserializeAccountStat = (stat: AccountStat) => ({
	...stat,
	pnl: weiFromWei(stat.pnlWithFeesPaid),
	pnlWithFeesPaid: weiFromWei(stat.pnlWithFeesPaid),
	totalVolume: weiFromWei(stat.totalVolume),
	totalTrades: wei(stat.totalTrades).toNumber(),
	liquidations: wei(stat.liquidations).toNumber(),
})

export const unserializeLeaderboard = (leaderboard: Leaderboard): Leaderboard<Wei, number> => {
	return {
		top: leaderboard.top.map(unserializeAccountStat),
		bottom: leaderboard.bottom.map(unserializeAccountStat),
		wallet: leaderboard.wallet.map(unserializeAccountStat),
		search: leaderboard.search.map(unserializeAccountStat),
		all: leaderboard.all.map(unserializeAccountStat),
	}
}
