import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useNetwork } from 'wagmi';

import MoonIcon from 'assets/svg/app/moon.svg';
import SunIcon from 'assets/svg/app/sun.svg';
import Button from 'components/Button';
import Connector from 'containers/Connector';
import { useAutoConnect } from 'hooks/useAutoConnect';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { setTheme } from 'state/preferences/reducer';
import { selectCurrentTheme } from 'state/preferences/selectors';

import BalanceActions from './BalanceActions';
import ConnectionDot from './ConnectionDot';
import NetworksSwitcher from './NetworksSwitcher';
import WalletActions from './WalletActions';

const WalletButtons: React.FC = () => {
	const { t } = useTranslation();
	const { isWalletConnected } = Connector.useContainer();
	const { chain: network } = useNetwork();
	const dispatch = useAppDispatch();

	const currentTheme = useAppSelector(selectCurrentTheme);
	const { openConnectModal } = useConnectModal();
	const { openChainModal } = useChainModal();

	const ThemeIcon = currentTheme === 'dark' ? SunIcon : MoonIcon;

	const toggleTheme = () => {
		dispatch(setTheme(currentTheme === 'light' ? 'dark' : 'light'));
	};

	useAutoConnect();
	const walletIsNotConnected = (
		<>
			<ConnectButton
				size="small"
				variant="flat"
				noOutline
				onClick={openConnectModal}
				data-testid="connect-wallet"
				mono
			>
				<ConnectionDot />
				{t('common.wallet.connect-wallet')}
			</ConnectButton>
		</>
	);

	const walletIsConnectedButNotSupported = (
		<>
			<SwitchNetworkButton size="small" variant="flat" onClick={openChainModal}>
				{t('homepage.l2.cta-buttons.switch-networks')}
			</SwitchNetworkButton>
			<ConnectButton size="small" variant="flat" data-testid="unsupported-network" mono>
				<ConnectionDot />
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
				? network?.unsupported
					? walletIsConnectedButNotSupported
					: walletIsConnectedAndSupported
				: walletIsNotConnected}
			<MenuButton onClick={toggleTheme} noOutline>
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

const SwitchNetworkButton = styled(Button)`
	font-size: 13px;
	font-family: ${(props) => props.theme.fonts.mono};
`;

export default WalletButtons;
