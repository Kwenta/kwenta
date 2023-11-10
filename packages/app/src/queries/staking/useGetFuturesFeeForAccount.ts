import { KWENTA_TRACKING_CODE } from '@kwenta/sdk/constants'
import { useQuery, UseQueryOptions } from 'react-query'

import { DEFAULT_NUMBER_OF_FUTURES_FEE } from 'constants/defaults'
import QUERY_KEYS from 'constants/queryKeys'
import proxy from 'utils/proxy'

const useGetFuturesFeeForAccount = (
	account: string,
	start: number,
	end: number,
	options?: UseQueryOptions<Number | null> & { forceAccount: boolean }
) => {
	return useQuery<any>(
		QUERY_KEYS.Staking.FuturesFee(account || null, start, end),
		async () => {
			if (!account) return null

			const { data } = await proxy.post('futures/trades', {
				chain: 1,
				options: {
					first: DEFAULT_NUMBER_OF_FUTURES_FEE,
					where: {
						account: account,
						timestamp_gt: start,
						timestamp_lt: end,
						trackingCode: KWENTA_TRACKING_CODE,
					},
					orderDirection: 'desc',
					orderBy: 'timestamp',
				},
				args: {
					timestamp: true,
					account: true,
					abstractAccount: true,
					accountType: true,
					feesPaid: true,
					keeperFeesPaid: true,
				},
			})

			return data
		},
		{ enabled: !!account, ...options }
	)
}

export default useGetFuturesFeeForAccount
