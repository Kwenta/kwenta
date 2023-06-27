import { NetworkId } from '@kwenta/sdk/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createContainer } from 'unstated-next'
import { useAccount, useNetwork, useSigner, useProvider } from 'wagmi'

import { useAppDispatch } from 'state/hooks'
import sdk from 'state/sdk'
import { setSigner } from 'state/wallet/actions'
import { setNetwork } from 'state/wallet/reducer'

import { generateExplorerFunctions, getBaseUrl } from './blockExplorer'
import { activeChainIds, chain } from './config'

export let blockExplorer = generateExplorerFunctions(getBaseUrl(10))

const useConnector = () => {
	const dispatch = useAppDispatch()
	const { chain: activeChain } = useNetwork()
	const { address, isConnected: isWalletConnected } = useAccount({
		onDisconnect: () => dispatch(setSigner(null)),
	})
	const [providerReady, setProviderReady] = useState(false)

	const network = useMemo(() => {
		return activeChainIds.includes(activeChain?.id ?? chain.optimism.id)
			? activeChain ?? chain.optimism
			: chain.optimism
	}, [activeChain])

	const walletAddress = useMemo(() => address ?? null, [address])

	const provider = useProvider({ chainId: network.id })
	const l2Provider = useProvider({ chainId: chain.optimism.id })
	const { data: signer } = useSigner()

	const handleNetworkChange = useCallback(
		(networkId: NetworkId) => {
			dispatch(setNetwork(networkId))
			blockExplorer = generateExplorerFunctions(getBaseUrl(networkId))
		},
		[dispatch]
	)

	useEffect(() => {
		if (!!provider) {
			sdk.setProvider(provider).then((networkId) => {
				handleNetworkChange(networkId)
				setProviderReady(true)
			})
		}
	}, [provider, handleNetworkChange])

	useEffect(() => {
		dispatch(setSigner(signer))
	}, [signer, dispatch])

	return {
		activeChain,
		isWalletConnected,
		walletAddress,
		provider,
		l2Provider,
		signer,
		network,
		providerReady,
	}
}

const Connector = createContainer(useConnector)

export default Connector
