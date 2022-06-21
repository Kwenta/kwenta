import React, { Dispatch, SetStateAction } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';

import { currentThemeState } from 'store/ui';

import Connector from 'containers/Connector/ConnectorWagmi';

import Button from 'components/Button';

import { isWalletConnectedState, networkState } from 'store/wallet';

import WalletActions from '../WalletActions';
import ConnectionDot from '../ConnectionDot';
import BalanceActions from '../BalanceActions';
import NetworksSwitcher from '../NetworksSwitcher';
import { isSupportedNetworkId } from 'utils/network';
import SunIcon from 'assets/svg/app/sun.svg';
import MoonIcon from 'assets/svg/app/moon.svg';
import { ConnectButton } from '@rainbow-me/rainbowkit';

type WalletButtonsProps = {
	settingsModalOpened: boolean;
	uniswapWidgetOpened: boolean;
	setSettingsModalOpened: Dispatch<SetStateAction<boolean>>;
	setUniswapWidgetOpened: Dispatch<SetStateAction<boolean>>;
};

const WalletButtons: React.FC<WalletButtonsProps> = ({
	settingsModalOpened,
	uniswapWidgetOpened,
	setUniswapWidgetOpened,
}) => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const network = useRecoilValue(networkState);
	const [currentTheme, setTheme] = useRecoilState(currentThemeState);
	const { switchToL2 } = useNetworkSwitcher();
	const { setWalletAddress } = Connector.useContainer();

	const ThemeIcon = currentTheme === 'dark' ? SunIcon : MoonIcon;

	const toggleTheme = () => {
		setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));
	};

	const WalletConnectOptions = () => (
		<ConnectButton.Custom>
			{({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
				console.log(account);
				if (!mounted) {
					return <div></div>;
				}

				console.log(isSupportedNetworkId(network.id));
				console.log(isWalletConnected);
				console.log(account);

				if (account?.address) {
					setWalletAddress(account?.address ?? null);
				}

				return isWalletConnected && account ? (
					isSupportedNetworkId(network.id) ? (
						<>
							<BalanceActions
								uniswapWidgetOpened={uniswapWidgetOpened}
								setShowUniswapWidget={setUniswapWidgetOpened}
							/>
							<NetworksSwitcher />
							<WalletActions
								mounted={mounted}
								openChainModal={openChainModal}
								openAccountModal={openAccountModal}
								openConnectModal={openConnectModal}
							/>
						</>
					) : (
						<>
							{/* <StyledConnectButton onClick={disconnectWallet}>disconnect</StyledConnectButton> */}
							<SwitchToL2Button variant="secondary" onClick={switchToL2}>
								{t('homepage.l2.cta-buttons.switch-l2')}
							</SwitchToL2Button>
							<StyledConnectButton
								size="sm"
								variant="outline"
								data-testid="unsupported-network"
								mono
							>
								<StyledConnectionDot />
								{t('common.wallet.unsupported-network')}
							</StyledConnectButton>
						</>
					)
				) : (
					<>
						<StyledConnectButton
							size="sm"
							variant="outline"
							noOutline
							onClick={async () => await openConnectModal()}
							data-testid="connect-wallet"
							mono
						>
							<StyledConnectionDot />
							{t('common.wallet.connect-wallet')}
						</StyledConnectButton>
					</>
				);
			}}
		</ConnectButton.Custom>
	);

	// const walletIsConnectedButNotSupported = (
	// 	<ConnectButton.Custom>
	// 		{({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
	// 			console.log(account, chain, mounted);
	// 			return (
	// 				<>
	// 					<SwitchToL2Button variant="secondary" onClick={switchToL2}>
	// 						{t('homepage.l2.cta-buttons.switch-l2')}
	// 					</SwitchToL2Button>
	// 					<StyledConnectButton size="sm" variant="outline" data-testid="unsupported-network" mono>
	// 						<StyledConnectionDot />
	// 						{t('common.wallet.unsupported-network')}
	// 					</StyledConnectButton>
	// 				</>
	// 			);
	// 		}}
	// 	</ConnectButton.Custom>
	// );

	// const WalletIsConnectedAndSupported = () => (
	// 	<>
	// 		<BalanceActions
	// 			uniswapWidgetOpened={uniswapWidgetOpened}
	// 			setShowUniswapWidget={setUniswapWidgetOpened}
	// 		/>
	// 		<NetworksSwitcher />
	// 		<WalletActions
	// 			mounted={mounted}
	// 			openChainModal={openChainModal}
	// 			openAccountModal={openAccountModal}
	// 			openConnectModal={openConnectModal}
	// 		/>
	// 	</>
	// );

	return (
		<Container>
			<WalletConnectOptions />
			<MenuButton
				onClick={() => {
					toggleTheme();
				}}
				isActive={settingsModalOpened}
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

const StyledConnectButton = styled(Button)`
	font-size: 13px;
`;

const SwitchToL2Button = styled(Button)`
	font-size: 13px;
	color: ${(props) => props.theme.colors.common.primaryWhite};
	font-family: ${(props) => props.theme.fonts.mono};
`;

export default WalletButtons;
