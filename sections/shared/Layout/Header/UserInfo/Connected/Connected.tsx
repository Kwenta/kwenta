import { FC } from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import { truncatedWalletAddressState } from 'store/wallet';
import { FlexDivCentered } from 'styles/common';
import Connector from 'containers/Connector';

import NotificationIcon from 'assets/svg/app/notification.svg';
import MenuIcon from 'assets/svg/app/menu.svg';

const Connected: FC = () => {
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const { onboard } = Connector.useContainer();

	return (
		<FlexDivCentered>
			<Menu>
				<NotificationIcon />
				<MenuIcon />
			</Menu>
			<Wallet onClick={() => onboard!.walletSelect()}>
				<ConnectionDot />
				{truncatedWalletAddress}
			</Wallet>
		</FlexDivCentered>
	);
};

const Menu = styled.div`
	padding-right: 26px;
	display: grid;
	grid-gap: 20px;
	grid-auto-flow: column;
`;

const Wallet = styled(FlexDivCentered)`
	font-family: ${(props) => props.theme.fonts.mono};
	background-color: ${(props) => props.theme.colors.elderberry};
	border: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.white};
	border-radius: 4px;
	padding: 6px 12px;
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
