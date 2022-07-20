import { NetworkIdByName } from '@synthetixio/contracts-interface';
import React from 'react';
import { useRecoilValue } from 'recoil';
import styled, { useTheme } from 'styled-components';

import { networkState, isWalletConnectedState } from 'store/wallet';

type ConnectionDotProps = {
	className?: string;
};

const ConnectionDot: React.FC<ConnectionDotProps> = (props) => {
	const network = useRecoilValue(networkState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const theme = useTheme();

	let background = theme.colors.noNetwork;

	if (network && isWalletConnected) {
		switch (network.id) {
			case NetworkIdByName.mainnet:
				background = theme.colors.mainnet;
				break;
			case NetworkIdByName.kovan:
				background = theme.colors.kovan;
				break;
			case NetworkIdByName.goerli:
				background = theme.colors.goerli;
				break;
			case NetworkIdByName['mainnet-ovm']:
				background = theme.colors.optimism;
				break;
			default:
				if (network.useOvm) {
					background = theme.colors.connectedDefault;
				}
		}
	}
	return <Dot {...props} background={background} />;
};

const Dot = styled.span<{ background: string }>`
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background-color: ${(props) => props.background};
`;

export default ConnectionDot;
