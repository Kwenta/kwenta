import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useRecoilState } from 'recoil';
import { currentThemeState } from 'store/ui';

import useNetworkSwitcher from 'hooks/useNetworkSwitcher';

import Connector from 'containers/Connector';

import Button from 'components/Button';

import { isWalletConnectedState, networkState } from 'store/wallet';

import SettingsModal from 'sections/shared/modals/SettingsModal';

import WalletActions from '../WalletActions';
import ConnectionDot from '../ConnectionDot';
import UniswapModal from 'sections/shared/modals/UniswapModal';
import BalanceActions from '../BalanceActions';
import NetworksSwitcher from '../NetworksSwitcher';
import { isSupportedNetworkId } from 'utils/network';

import SunIcon from 'assets/svg/app/sun.svg';
import MoonIcon from 'assets/svg/app/moon.svg';

const UserMenu: FC = () => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const network = useRecoilValue(networkState);
	const { connectWallet } = Connector.useContainer();
	const [settingsModalOpened, setSettingsModalOpened] = useState<boolean>(false);
	const [uniswapWidgetOpened, setUniswapWidgetOpened] = useState<boolean>(false);
	const [currentTheme, setTheme] = useRecoilState(currentThemeState);
	const { switchToL2 } = useNetworkSwitcher();

	const toggleTheme = () => {
		setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));
	};

	const walletIsNotConnected = (
		<>
			<ConnectButton
				size="sm"
				variant="outline"
				noOutline={true}
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
			<SwitchToL2Button variant="secondary" onClick={switchToL2} noOutline={true}>
				{t('homepage.l2.cta-buttons.switch-l2')}
			</SwitchToL2Button>
			<ConnectButton size="sm" data-testid="unsupported-network" mono noOutline={true}>
				<StyledConnectionDot />
				{t('common.wallet.unsupported-network')}
			</ConnectButton>
		</>
	);

	const walletIsConnectedAndSupported = (
		<>
			<BalanceActions
				uniswapWidgetOpened={uniswapWidgetOpened}
				setShowUniswapWidget={setUniswapWidgetOpened}
			/>
			<NetworksSwitcher />
			<WalletActions />
		</>
	);

	return (
		<>
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
					isActive={settingsModalOpened}
					noOutline={true}
				>
					{currentTheme === 'dark' ? (
						<SunIcon width={15} height={15} className="sun-icon" />
					) : (
						<MoonIcon className="moon-icon" />
					)}
				</MenuButton>
			</Container>
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
			{uniswapWidgetOpened && <UniswapModal onDismiss={() => setUniswapWidgetOpened(false)} />}
		</>
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	font-family: ${(props) => props.theme.fonts.mono};
`;

export default UserMenu;
