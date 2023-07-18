import { FuturesMarginType } from '@kwenta/sdk/types'
import { Bridge } from '@socket.tech/plugin'
import { useCallback } from 'react'
import styled, { useTheme } from 'styled-components'

import ArrowIcon from 'assets/svg/app/arrow-down.svg'
import Connector from 'containers/Connector'
import { chain } from 'containers/Connector/config'
import { fetchBalances } from 'state/balances/actions'
import { selectFuturesType } from 'state/futures/common/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import {
	customizeSocket,
	socketDefaultChains,
	SOCKET_DEST_TOKEN_ADDRESS,
	SOCKET_SOURCE_TOKEN_ADDRESS,
} from 'utils/socket'

const SocketBridge = () => {
	const { activeChain, signer } = Connector.useContainer()
	const dispatch = useAppDispatch()
	const customize = customizeSocket(useTheme())
	const accountType = useAppSelector(selectFuturesType)
	const onBridgeSuccess = useCallback(() => {
		dispatch(fetchBalances())
	}, [dispatch])

	return (
		<BridgeContainer>
			<Bridge
				provider={signer?.provider}
				API_KEY={process.env.NEXT_PUBLIC_SOCKET_API_KEY ?? ''}
				sourceNetworks={socketDefaultChains}
				destNetworks={[chain.optimism.id]}
				defaultSourceToken={SOCKET_SOURCE_TOKEN_ADDRESS}
				defaultDestToken={SOCKET_DEST_TOKEN_ADDRESS}
				defaultSourceNetwork={
					socketDefaultChains.includes(activeChain?.id ?? chain.mainnet.id)
						? activeChain?.id
						: chain.mainnet.id
				}
				customize={customize}
				enableSameChainSwaps={true}
				onBridgeSuccess={onBridgeSuccess}
			/>
			{accountType === FuturesMarginType.CROSS_MARGIN && (
				<StyledDiv>
					<ArrowIcon />
				</StyledDiv>
			)}
		</BridgeContainer>
	)
}

export const BridgeContainer = styled.div`
	p:empty {
		display: none;
	}

	.mt-3 {
		margin-top: 0.25rem;
	}

	.mt-6 {
		margin-top: 0.5rem;
	}

	.bg-widget-primary {
		border: ${(props) => props.theme.colors.selectedTheme.border};
	}

	span.ml-2 {
		font-size: 17px;
		font-family: ${(props) => props.theme.fonts.regular};
	}
`

export const StyledDiv = styled.div`
	svg {
		height: 15px;
		width: 15px;
		path {
			fill: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
		}
	}
	text-align: center;
	padding-top: 20px;
`

export default SocketBridge
