import { PerpsV2Market, PerpsV2Market__factory } from '@kwenta/sdk/types'
import { useMemo } from 'react'

import Connector from 'containers/Connector'
import { selectV2MarketInfo } from 'state/futures/smartMargin/selectors'
import { useAppSelector } from 'state/hooks'

export default function usePerpsContracts(): {
	perpsMarketContract: PerpsV2Market | null
} {
	const { signer } = Connector.useContainer()
	const marketInfo = useAppSelector(selectV2MarketInfo)

	const perpsMarketContract = useMemo(() => {
		if (!signer || !marketInfo?.marketAddress) return null

		return PerpsV2Market__factory.connect(marketInfo.marketAddress, signer)
	}, [signer, marketInfo?.marketAddress])

	return { perpsMarketContract }
}
