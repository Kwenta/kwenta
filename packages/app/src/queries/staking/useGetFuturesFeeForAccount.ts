import { FUTURES_ENDPOINT_OP_MAINNET, KWENTA_TRACKING_CODE } from '@kwenta/sdk/constants'
import { getFuturesTrades } from '@kwenta/sdk/utils'
import { useQuery, UseQueryOptions } from 'react-query'

import { DEFAULT_NUMBER_OF_FUTURES_FEE } from 'constants/defaults'
import QUERY_KEYS from 'constants/queryKeys'

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

			const response = await getFuturesTrades(
				FUTURES_ENDPOINT_OP_MAINNET,
				{
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
				{
					timestamp: true,
					account: true,
					abstractAccount: true,
					accountType: true,
					feesPaid: true,
					keeperFeesPaid: true,
				}
			)
			return response
		},
		{ enabled: !!account, ...options }
	)
}

export default useGetFuturesFeeForAccount
