import { isAddress } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'

import proxy from 'utils/proxy'

type ENSAccount = { ensAddress: string | null; ensName: string | null; ensAvatar: string | null }

const useENS = (addressOrName: string): ENSAccount => {
	const [ensAddress, setENSAddress] = useState<string | null>(null)
	const [ensName, setENSName] = useState<string | null>(null)
	const [ensAvatar, setENSAvatar] = useState<string | null>(null)

	useEffect(() => {
		let mounted = true

		;(async () => {
			let newEnsName = null
			if (isAddress(addressOrName)) {
				setENSAddress(addressOrName)
				const { data: newEnsName } = await proxy.get(`lookup-address/${addressOrName}`)
				setENSName(newEnsName)
			} else if (addressOrName.endsWith('.eth')) {
				const { data: newEnsName } = await proxy.get(`resolve-name/${addressOrName}`)
				setENSAddress(newEnsName)
				setENSName(addressOrName)
			}

			if (newEnsName && mounted) {
				const { data: avatar } = await proxy.get(`avatar/${newEnsName}`)
				setENSAvatar(avatar)
			}
		})()

		return () => {
			mounted = false
			setENSAddress(null)
			setENSAvatar(null)
			setENSName(null)
		}
	}, [addressOrName])

	return { ensAddress, ensName, ensAvatar }
}

export default useENS
