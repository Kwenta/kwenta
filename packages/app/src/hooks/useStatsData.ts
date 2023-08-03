import { useMemo } from 'react'
import { UseQueryResult } from 'react-query'

import useGetFile from 'queries/files/useGetFile'
import {
	selectOptimismMarkPrices,
	selectOptimismMarkets,
} from 'state/futures/smartMargin/selectors'
import { useAppSelector } from 'state/hooks'
import { selectMinTimestamp } from 'state/stats/selectors'

export type StatsTimeframe = '4H' | '1D' | '1W' | '1M' | '1Y' | 'MAX'

export type DailyStat = {
	timestamp: number
	volume: number
	trades: number
	feesSynthetix: number
	feesKwenta: number
	cumulativeTrades: number
	uniqueTraders: number
	cumulativeTraders: number
}

const useStatsData = () => {
	const futuresMarkets = useAppSelector(selectOptimismMarkets)
	const prices = useAppSelector(selectOptimismMarkPrices)
	const minTimestamp = useAppSelector(selectMinTimestamp)

	const { data: dailyStatsData, isLoading: dailyStatsIsLoading }: UseQueryResult<DailyStat[]> =
		useGetFile('stats/daily_stats.json')

	const openInterestData = useMemo(() => {
		return futuresMarkets.map(({ marketKey, asset, marketSize }) => {
			return {
				asset,
				openInterest: marketSize.mul(prices[marketKey]).toNumber(),
			}
		})
	}, [futuresMarkets, prices])

	return {
		dailyStatsData: dailyStatsData?.filter(({ timestamp }) => timestamp > minTimestamp) ?? [],
		dailyStatsIsLoading,
		openInterestData,
	}
}

export default useStatsData
