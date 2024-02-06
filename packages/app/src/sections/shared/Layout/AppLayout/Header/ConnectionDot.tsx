import { NetworkId, NetworkIdByName } from '@kwenta/sdk/types'
import { useSession } from 'next-auth/react'
import React from 'react'
import styled, { useTheme } from 'styled-components'

import Connector from 'containers/Connector'
import useIsL2 from 'hooks/useIsL2'

type ConnectionDotProps = {
	className?: string
}

const ConnectionDot: React.FC<ConnectionDotProps> = (props) => {
	const { network, isWalletConnected } = Connector.useContainer()
	const { data: session } = useSession()
	const isL2 = useIsL2()

	const theme = useTheme()

	let background = theme.colors.noNetwork

	if (network && isWalletConnected) {
		switch (network?.id as NetworkId) {
			case NetworkIdByName.mainnet:
				background = theme.colors.mainnet
				break
			case NetworkIdByName.kovan:
				background = theme.colors.kovan
				break
			case NetworkIdByName.goerli:
				background = theme.colors.goerli
				break
			case NetworkIdByName['mainnet-ovm']:
				background = theme.colors.optimism
				break
			default:
				if (isL2) {
					background = theme.colors.connectedDefault
				}
		}
	}

	if (session) background = theme.colors.mainnet

	return <Dot {...props} background={background} />
}

const Dot = styled.span<{ background: string }>`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background-color: ${(props) => props.background};
	margin-right: 6px;
`

export default ConnectionDot
