import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import MoonIcon from 'assets/svg/app/moon.svg';
import SunIcon from 'assets/svg/app/sun.svg';
import Button from 'components/Button';
import Connector from 'containers/Connector';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import { currentThemeState } from 'store/ui';
import { isWalletConnectedState, networkState } from 'store/wallet';
import { isSupportedNetworkId } from 'utils/network';

import BalanceActions from './BalanceActions';
import ConnectionDot from './ConnectionDot';
import NetworksSwitcher from './NetworksSwitcher';
import WalletActions from './WalletActions';

const WalletButtons: React.FC = () => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const network = useRecoilValue(networkState);
	const { connectWallet } = Connector.useContainer();
	const [currentTheme, setTheme] = useRecoilState(currentThemeState);
	const { switchToL2 } = useNetworkSwitcher();

	const ThemeIcon = currentTheme === 'dark' ? SunIcon : MoonIcon;

	const toggleTheme = () => {
		setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));
	};

	const walletIsNotConnected = (
		<>
			<ConnectButton
				size="sm"
				variant="outline"
				noOutline
				onClick={connectWallet}
				data-testid="connect-wallet"
				mono
			>
				<StyledConnectionDot />
				{t('common.wallet.connect-wallet')}
			</ConnectButton>
		</>
	);

	const walletIsConnectedButNotSupported = (
		<>
			<SwitchToL2Button variant="secondary" onClick={switchToL2}>
				{t('homepage.l2.cta-buttons.switch-l2')}
			</SwitchToL2Button>
			<ConnectButton size="sm" variant="outline" data-testid="unsupported-network" mono>
				<StyledConnectionDot />
				{t('common.wallet.unsupported-network')}
			</ConnectButton>
		</>
	);

	const walletIsConnectedAndSupported = (
		<>
			<BalanceActions />
			<NetworksSwitcher />
			<WalletActions />
		</>
	);

	return (
		<Container>
			{isWalletConnected
				? isSupportedNetworkId(network.id)
					? walletIsConnectedAndSupported
					: walletIsConnectedButNotSupported
				: walletIsNotConnected}
			<MenuButton
				onClick={() => {
					toggleTheme();
				}}
				noOutline
			>
				<ThemeIcon width={20} />
			</MenuButton>
		</Container>
	);
};

const Container = styled.div`
	display: grid;
	grid-gap: 15px;
	grid-auto-flow: column;
`;

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 6px;
`;

const MenuButton = styled(Button)`
	display: grid;
	place-items: center;
	height: 41px;
	width: 41px;
	padding: 0px;

	svg {
		path {
			fill: ${(props) => props.theme.colors.selectedTheme.icon.fill};
		}
	}

	:hover {
		svg {
			path {
				fill: ${(props) => props.theme.colors.selectedTheme.icon.hover};
			}
		}
	}
`;

const ConnectButton = styled(Button)`
	font-size: 13px;
`;

const SwitchToL2Button = styled(Button)`
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-family: ${(props) => props.theme.fonts.mono};
`;

export default WalletButtons;
