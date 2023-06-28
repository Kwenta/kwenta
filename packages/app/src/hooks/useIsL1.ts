import { notNill } from '@kwenta/sdk/utils'
import { useMemo } from 'react'

import Connector from 'containers/Connector'
import { chain } from 'containers/Connector/config'

const useIsL1 = () => {
	const { network } = Connector.useContainer()
	const isL1 = useMemo(
		() =>
			notNill(network) ? [chain.mainnet.id, chain.goerli.id].includes(network.id as 1 | 5) : false,
		[network]
	)
	return isL1
}

export default useIsL1
