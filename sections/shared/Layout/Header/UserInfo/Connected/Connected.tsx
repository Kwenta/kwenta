import { FC } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import { truncatedWalletAddressState } from 'store/connection';
import { FlexDivCentered } from 'styles/common';
import Connector from 'containers/Connector';

const Connected: FC = () => {
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const { onboard } = Connector.useContainer();

	return (
		<>
			<Wallet onClick={() => onboard!.walletSelect()}>
				<ConnectionDot />
				{truncatedWalletAddress}
			</Wallet>
		</>
	);
};

const Wallet = styled(FlexDivCentered)`
	font-family: ${(props) => props.theme.fonts.mono};
	background-color: ${(props) => props.theme.colors.elderberry};
	border: 1px solid ${(props) => props.theme.colors.navy};
	border-radius: 4px;
	padding: 12px;
	font-size: 12px;
	cursor: pointer;
`;

const ConnectionDot = styled.span`
	margin-right: 6px;
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background-color: ${(props) => props.theme.colors.green};
`;

export default Connected;
