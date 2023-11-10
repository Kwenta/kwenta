import { AGGREGATE_ASSET_KEY, SECONDS_PER_DAY } from '@kwenta/sdk/constants'
import { useQuery, UseQueryOptions } from 'react-query'

import { DEFAULT_NUMBER_OF_FUTURES_FEE } from 'constants/defaults'
import QUERY_KEYS from 'constants/queryKeys'
import useIsL2 from 'hooks/useIsL2'
import proxy from 'utils/proxy'

const useGetFuturesFee = (
	start: number,
	end: number,
	options?: UseQueryOptions<Number | null> & { forceAccount: boolean }
) => {
	const isL2 = useIsL2()

	return useQuery<any>(
		QUERY_KEYS.Staking.TotalFuturesFee(start, end),
		async () => {
			const { data } = await proxy.post('futures/aggregate-stats', {
				chain: 1,
				options: {
					first: DEFAULT_NUMBER_OF_FUTURES_FEE,
					where: {
						asset: AGGREGATE_ASSET_KEY,
						period: SECONDS_PER_DAY,
						timestamp_gte: start,
						timestamp_lt: end,
					},
					orderDirection: 'desc',
					orderBy: 'timestamp',
				},
				args: {
					timestamp: true,
					feesKwenta: true,
				},
			})

			return data
		},
		{ enabled: isL2, ...options }
	)
}

export default useGetFuturesFee
