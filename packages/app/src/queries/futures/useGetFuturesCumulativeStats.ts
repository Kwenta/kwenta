import { NetworkId } from '@kwenta/sdk/types'
import { useQuery, UseQueryOptions } from 'react-query'

import QUERY_KEYS from 'constants/queryKeys'
import ROUTES from 'constants/routes'
import Connector from 'containers/Connector'
import useIsL2 from 'hooks/useIsL2'
import proxy from 'utils/proxy'

import { FuturesCumulativeStats } from './types'

const useGetFuturesCumulativeStats = (options?: UseQueryOptions<FuturesCumulativeStats | null>) => {
	const { network } = Connector.useContainer()
	const isL2 = useIsL2()
	const homepage = window.location.pathname === ROUTES.Home.Root

	return useQuery<FuturesCumulativeStats | null>(
		QUERY_KEYS.Futures.TotalTrades(network?.id as NetworkId),
		async () => {
			const { data } = await proxy.post('futures/cumulative-stats', {
				chain: homepage ? 1 : network?.id,
			})

			return data
		},
		{ enabled: homepage || isL2, ...options }
	)
}

export default useGetFuturesCumulativeStats
