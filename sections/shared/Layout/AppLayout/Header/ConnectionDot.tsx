import React from 'react';
import styled, { useTheme } from 'styled-components';
import { useRecoilValue } from 'recoil';
import { networkState, isWalletConnectedState } from 'store/wallet';
import { NetworkId } from '@synthetixio/contracts-interface';

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
			case NetworkId.Mainnet:
				background = theme.colors.mainnet;
				break;
			case NetworkId.Ropsten:
				background = theme.colors.ropsten;
				break;
			case NetworkId.Kovan:
				background = theme.colors.kovan;
				break;
			case NetworkId.Rinkeby:
				background = theme.colors.rinkeby;
				break;
			case NetworkId.Goerli:
				background = theme.colors.goerli;
				break;
			default:
				if (network.useOvm) {
					background = theme.colors.ovm;
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
