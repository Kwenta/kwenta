import { Bridge } from '@socket.tech/plugin';
import styled from 'styled-components';
import { chain } from 'wagmi';

import ArrowIcon from 'assets/svg/app/arrow-down.svg';
import BaseModal from 'components/BaseModal';
import Connector from 'containers/Connector';

import { SocketCustomizationProps } from './types';
import {
	DEFAULT_MOBILE_WIDTH,
	DEFAULT_WIDTH,
	SOCKET_DEST_TOKEN_ADDRESS,
	SOCKET_SOURCE_TOKEN_ADDRESS,
} from './utils';

const SocketBridge = () => {
	const { signer } = Connector.useContainer();

	const customize: SocketCustomizationProps = {
		width: window.innerWidth > 768 ? DEFAULT_WIDTH : DEFAULT_MOBILE_WIDTH,
		responsiveWidth: true,
		borderRadius: 1,
		secondary: 'rgb(37,37,37)',
		primary: 'rgb(30,30,30)',
		accent: 'rgb(131,249,151)',
		onAccent: 'rgb(0,0,0)',
		interactive: 'rgb(37,37,37)',
		onInteractive: 'rgb(236,232,227)',
		text: 'rgb(236,232,227)',
		secondaryText: 'rgb(236,232,227)',
		fontFamily: `AkkuratLLWeb-Regular`,
	};

	return signer?.provider ? (
		<div style={{ marginBottom: '20px' }}>
			<Bridge
				provider={signer?.provider}
				API_KEY={process.env.NEXT_PUBLIC_SOCKET_API_KEY ?? ''}
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
