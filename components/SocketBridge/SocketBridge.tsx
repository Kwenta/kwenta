import { Bridge } from '@socket.tech/plugin';
import styled, { useTheme } from 'styled-components';
import { chain } from 'wagmi';

import ArrowIcon from 'assets/svg/app/arrow-down.svg';
import BaseModal from 'components/BaseModal';
import Connector from 'containers/Connector';

import { SocketCustomizationProps } from './types';
import hexToRGB, {
	DEFAULT_MOBILE_WIDTH,
	DEFAULT_WIDTH,
	SOCKET_DEST_TOKEN_ADDRESS,
	SOCKET_SOURCE_TOKEN_ADDRESS,
} from './utils';

const SocketBridge = () => {
	const { signer } = Connector.useContainer();
	const theme = useTheme();

	const background = hexToRGB(theme.colors.selectedTheme.input.secondary.background);
	const modalBg = hexToRGB(theme.colors.selectedTheme.input.secondary.background);
	const text = hexToRGB(theme.colors.selectedTheme.text.header);
	const primaryButtonBg = hexToRGB(theme.colors.selectedTheme.button.primary.background);

	const customize: SocketCustomizationProps = {
		width: window.innerWidth > 768 ? DEFAULT_WIDTH : DEFAULT_MOBILE_WIDTH,
		responsiveWidth: true,
		borderRadius: 1,
		secondary: `rgb(${modalBg.r},${modalBg.g},${modalBg.b})`,
		primary: `rgb(${background.r},${background.g},${background.b})`,
		accent: `rgb(${primaryButtonBg.r},${primaryButtonBg.g},${primaryButtonBg.b})`,
		onAccent: `rgb(${text.r},${text.g},${text.b})`,
		interactive: `rgb(${background.r},${background.g},${background.b})`,
		onInteractive: `rgb(${text.r},${text.g},${text.b})`,
		text: `rgb(${text.r},${text.g},${text.b})`,
		secondaryText: `rgb(${text.r},${text.g},${text.b})`,
		fontFamily: `AkkuratLLWeb-Regular`,
	};

	return signer?.provider ? (
		<div style={{ marginBottom: '20px' }}>
			<Bridge
				provider={signer?.provider}
				API_KEY={process.env.NEXT_PUBLIC_SOCKET_API_KEY ?? ''}
				title={'Bridge'}
				defaultSourceToken={SOCKET_SOURCE_TOKEN_ADDRESS}
				defaultDestToken={SOCKET_DEST_TOKEN_ADDRESS}
				defaultSourceNetwork={chain.mainnet.id}
				defaultDestNetwork={chain.optimism.id}
				customize={customize}
				enableSameChainSwaps={false}
			/>
			<StyledDiv>
				<ArrowIcon />
			</StyledDiv>
		</div>
	) : null;
};

export const StyledBaseModal = styled(BaseModal)`
	[data-reach-dialog-content] {
		width: 400px;
	}
`;

export const StyledDiv = styled.div`
	svg {
		height: 15px;
		width: 15px;
	}
	text-align: center;
	padding-top: 20px;
`;

export default SocketBridge;
