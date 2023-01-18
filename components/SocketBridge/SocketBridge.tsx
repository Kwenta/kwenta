import { Bridge } from '@socket.tech/plugin';
import { useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { chain } from 'wagmi';

import ArrowIcon from 'assets/svg/app/arrow-down.svg';
import Connector from 'containers/Connector';
import { fetchBalances } from 'state/balances/actions';
import { useAppDispatch } from 'state/hooks';

import { SocketCustomizationProps } from './types';
import hexToRGB, {
	DEFAULT_MOBILE_WIDTH,
	DEFAULT_WIDTH,
	SOCKET_DEST_TOKEN_ADDRESS,
	SOCKET_SOURCE_TOKEN_ADDRESS,
} from './utils';

const socketDefaultChains = [
	chain.arbitrum.id,
	chain.mainnet.id,
	chain.optimism.id,
	chain.polygon.id,
];

const SocketBridge = () => {
	const { activeChain, signer } = Connector.useContainer();
	const dispatch = useAppDispatch();
	const theme = useTheme();
	const onBridgeSuccess = useCallback(() => {
		dispatch(fetchBalances());
	}, [dispatch]);

	const background = hexToRGB(theme.colors.selectedTheme.input.secondary.background);
	const surface = hexToRGB(theme.colors.selectedTheme.background);
	const text = hexToRGB(theme.colors.selectedTheme.button.text.primary);
	const primaryButtonBg = hexToRGB(theme.colors.selectedTheme.button.primary.background);

	const customize: SocketCustomizationProps = {
		width: window.innerWidth > 768 ? DEFAULT_WIDTH : DEFAULT_MOBILE_WIDTH,
		responsiveWidth: true,
		borderRadius: 1,
		secondary: `rgb(${surface.r},${surface.g},${surface.b})`, //socket surface
		primary: `rgb(${background.r},${background.g},${background.b})`, //socket bg
		accent: `rgb(${primaryButtonBg.r},${primaryButtonBg.g},${primaryButtonBg.b})`, //toggle-slippage accent
		onAccent: `rgb(${text.r},${text.g},${text.b})`, //toggle thumb
		interactive: `rgb(${surface.r},${surface.g},${surface.b})`, //asset toggle
		onInteractive: `rgb(${text.r},${text.g},${text.b})`, //asset toggle text
		text: `rgb(${text.r},${text.g},${text.b})`, //main text
		outline: `rgb(${text.r},${text.g},${text.b})`,
		secondaryText: `rgb(${text.r},${text.g},${text.b})`, //secondary text
		fontFamily: `AkkuratLLWeb-Regular`,
	};

	return signer?.provider ? (
		<BridgeContainer>
			<Bridge
				provider={signer?.provider}
				API_KEY={process.env.NEXT_PUBLIC_SOCKET_API_KEY ?? ''}
				sourceNetworks={socketDefaultChains}
				destNetworks={socketDefaultChains}
				defaultSourceToken={SOCKET_SOURCE_TOKEN_ADDRESS}
				defaultDestToken={SOCKET_DEST_TOKEN_ADDRESS}
				defaultSourceNetwork={
					!!activeChain && socketDefaultChains.includes(activeChain.id)
						? activeChain.id
						: chain.mainnet.id
				}
				defaultDestNetwork={chain.optimism.id}
				customize={customize}
				enableSameChainSwaps={true}
				onBridgeSuccess={onBridgeSuccess}
			/>
			<StyledDiv>
				<ArrowIcon />
			</StyledDiv>
		</BridgeContainer>
	) : null;
};

export const BridgeContainer = styled.div`
	.mt-3 {
		margin-top: 0.25rem;
	}

	.mt-6 {
		margin-top: 0.5rem;
	}

	.bg-widget-primary {
		border: ${(props) => props.theme.colors.selectedTheme.border};
	}
`;

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
`;

export default SocketBridge;
