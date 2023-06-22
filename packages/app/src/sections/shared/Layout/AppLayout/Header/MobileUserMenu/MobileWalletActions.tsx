import { truncateAddress } from '@kwenta/sdk/utils'
import { useAccountModal } from '@rainbow-me/rainbowkit'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useEnsAvatar, useEnsName } from 'wagmi'

import Button from 'components/Button'
import Connector from 'containers/Connector'

import ConnectionDot from '../ConnectionDot'
import NetworksSwitcher from '../NetworksSwitcher'

export const MobileWalletActions: FC = () => {
	const { walletAddress } = Connector.useContainer()
	const { data: ensAvatar } = useEnsAvatar({ address: walletAddress!, chainId: 1 })
	const { data: ensName } = useEnsName({ address: walletAddress!, chainId: 1 })
	const [walletLabel, setWalletLabel] = useState<string>('')
	const truncatedWalletAddress = truncateAddress(walletAddress! ?? '')
	const { openAccountModal } = useAccountModal()

	useEffect(() => {
		setWalletLabel(ensName || truncatedWalletAddress!)
	}, [ensName, truncatedWalletAddress])

	return (
		<div style={{ display: 'flex' }}>
			<NetworksSwitcher mobile />
			<StyledButton mono noOutline onClick={openAccountModal}>
				{ensAvatar ? (
					<StyledImage src={ensAvatar} alt={ensName || walletAddress!} width={16} height={16} />
				) : (
					<ConnectionDot />
				)}
				{walletLabel}
			</StyledButton>
		</div>
	)
}

const StyledButton = styled(Button)`
	font-size: 13px;
	text-transform: lowercase;
	height: 41px;
`

const StyledImage = styled.img`
	border-radius: 50%;
	margin-right: 8px;
`

export default MobileWalletActions
