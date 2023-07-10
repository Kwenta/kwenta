import KwentaSDK from '@kwenta/sdk'

import { StatsTimeframe } from 'hooks/useStatsData'
import { QueryStatus } from 'state/types'

type StatsQueryStatuses = Record<'leaderboard', QueryStatus>

export type AccountStat = Awaited<ReturnType<KwentaSDK['stats']['getLeaderboard']>>['all'][number]

export type StatsState = {
	queryStatuses: StatsQueryStatuses
	selectedTimeframe: StatsTimeframe
	leaderboard: Awaited<ReturnType<KwentaSDK['stats']['getLeaderboard']>>
}
