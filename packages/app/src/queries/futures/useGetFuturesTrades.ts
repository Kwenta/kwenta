import { NetworkId, FuturesTrade } from '@kwenta/sdk/types'
import { notNill, mapTrades } from '@kwenta/sdk/utils'
import { utils as ethersUtils } from 'ethers'
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query'

import { DEFAULT_NUMBER_OF_TRADES, MAX_TIMESTAMP } from 'constants/defaults'
import QUERY_KEYS from 'constants/queryKeys'
import Connector from 'containers/Connector'
import proxy from 'utils/proxy'

const useGetFuturesTrades = (
	currencyKey: string | undefined,
	options?: UseInfiniteQueryOptions<FuturesTrade[] | null> & { forceAccount: boolean }
) => {
	const { network } = Connector.useContainer()

	return useInfiniteQuery<FuturesTrade[] | null>(
		QUERY_KEYS.Futures.Trades(network?.id as NetworkId, currencyKey || null),
		async ({ pageParam = { maxTs: Math.floor(Date.now() / 1000), minTs: 0 } }) => {
			if (!currencyKey) return null

			const { data } = await proxy.post('futures/trades', {
				chain: network?.id,
				options: {
					first: DEFAULT_NUMBER_OF_TRADES,
					where: {
						marketKey: `${ethersUtils.formatBytes32String(currencyKey as string)}`,
						timestamp_gt: pageParam?.minTs ?? 0,
						timestamp_lt: pageParam?.maxTs ?? Math.floor(Date.now() / 1000),
					},
					orderDirection: 'desc',
					orderBy: 'timestamp',
				},
				args: {
					id: true,
					timestamp: true,
					account: true,
					abstractAccount: true,
					accountType: true,
					margin: true,
					size: true,
					asset: true,
					marketKey: true,
					price: true,
					positionId: true,
					positionSize: true,
					positionClosed: true,
					pnl: true,
					feesPaid: true,
					keeperFeesPaid: true,
					orderType: true,
					fundingAccrued: true,
					trackingCode: true,
				},
			})

			return data ? mapTrades(data) : null
		},
		{
			...options,
			refetchInterval: 15000,
			getNextPageParam: (lastPage) => {
				return notNill(lastPage) && lastPage?.length > 0
					? {
							maxTs: lastPage[lastPage.length - 1].timestamp,
					  }
					: {
							maxTs: 0,
					  }
			},
			getPreviousPageParam: (firstPage) => {
				return notNill(firstPage) && firstPage?.length > 0
					? {
							minTs: firstPage[0].timestamp,
							maxTs: MAX_TIMESTAMP,
					  }
					: null
			},
		}
	)
}

export default useGetFuturesTrades
