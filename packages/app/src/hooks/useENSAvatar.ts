import { useQuery, UseQueryOptions } from 'react-query'

import QUERY_KEYS from 'constants/queryKeys'

const useENSAvatar = (
	provider: any,
	ensName?: string | null,
	options?: UseQueryOptions<any | null>
) => {
	return useQuery<string | null>(
		QUERY_KEYS.Network.ENSAvatar(ensName),
		async () => {
			if (!ensName?.endsWith('.eth')) return null

			const avatar: string | null = await provider.getAvatar(ensName)
			return avatar
		},
		{
			...options,
		}
	)
}

export default useENSAvatar
