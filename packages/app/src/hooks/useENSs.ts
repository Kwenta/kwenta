// import { Contract } from 'ethers'
import { useQuery, UseQueryOptions } from 'react-query'

// import { ENS_REVERSE_LOOKUP } from 'constants/address'
import QUERY_KEYS from 'constants/queryKeys'
// import { staticMainnetProvider } from 'utils/network'
import proxy from 'utils/proxy'

// const ADDRESSES_PER_LOOKUP = 1500

type EnsInfo = {
	[account: string]: string
}

const useENSs = (addresses: string[], options?: UseQueryOptions<any | null>) => {
	return useQuery<EnsInfo>(
		QUERY_KEYS.Network.ENSNames(addresses),
		async () => {
			return proxy
				.get('/names', {
					params: {
						addresses,
					},
				})
				.then((response) => response.data)
		},
		{
			enabled: addresses.length > 0,
			...options,
		}
	)
}

export default useENSs
