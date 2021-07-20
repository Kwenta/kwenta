import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Svg } from 'react-optimized-image';

import Connector from 'containers/Connector';

import Button from 'components/Button';

import { isWalletConnectedState, truncatedWalletAddressState } from 'store/wallet';
import { hasOrdersNotificationState } from 'store/ui';
import { FlexDivCentered, resetButtonCSS } from 'styles/common';

import NotificationIcon from 'assets/svg/app/notification.svg';
import NotificationAlertIcon from 'assets/svg/app/notification-alert.svg';
import MenuIcon from 'assets/svg/app/menu.svg';
import CaretDownIcon from 'assets/svg/app/caret-down.svg';

import WalletOptionsModal from 'sections/shared/modals/WalletOptionsModal';
import NotificationsModal from 'sections/shared/modals/NotificationsModal';
import SettingsModal from 'sections/shared/modals/SettingsModal';

import ConnectionDot from '../ConnectionDot';
import NetworksSwitcher from '../NetworksSwitcher';

type UserMenuProps = {
	isTextButton?: boolean;
};

const UserMenu: FC<UserMenuProps> = ({ isTextButton }) => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const { connectWallet } = Connector.useContainer();
	const [walletOptionsModalOpened, setWalletOptionsModalOpened] = useState<boolean>(false);
	const [settingsModalOpened, setSettingsModalOpened] = useState<boolean>(false);
	const [notificationsModalOpened, setNotificationsModalOpened] = useState<boolean>(false);
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const [hasOrdersNotification, setHasOrdersNotification] = useRecoilState(
		hasOrdersNotificationState
	);

	return (
		<>
			<Container>
				<FlexDivCentered>
					<Menu>
						{isWalletConnected && (
							<MenuButton
								onClick={() => {
									setNotificationsModalOpened(!notificationsModalOpened);
									setSettingsModalOpened(false);
									if (hasOrdersNotification) {
										setHasOrdersNotification(false);
									}
								}}
								isActive={notificationsModalOpened}
							>
								{hasOrdersNotification ? (
									<Svg src={NotificationAlertIcon} />
								) : (
									<Svg src={NotificationIcon} />
								)}
							</MenuButton>
						)}
						<MenuButton
							onClick={() => {
								setSettingsModalOpened(!settingsModalOpened);
								setNotificationsModalOpened(false);
							}}
							isActive={settingsModalOpened}
						>
							<Svg src={MenuIcon} />
						</MenuButton>
						<NetworksSwitcher />
					</Menu>
					{isWalletConnected ? (
						<WalletButton
							size="sm"
							variant="outline"
							onClick={() => setWalletOptionsModalOpened(true)}
							data-testid="wallet-btn"
						>
							<StyledConnectionDot />
							{truncatedWalletAddress}
							<StyledCaretDownIcon
								src={CaretDownIcon}
								viewBox={`0 0 ${CaretDownIcon.width} ${CaretDownIcon.height}`}
							/>
						</WalletButton>
					) : (
						<Button
							variant={isTextButton ? 'text' : 'primary'}
							onClick={connectWallet}
							data-testid="connect-wallet"
						>
							{t('common.wallet.connect-wallet')}
						</Button>
					)}
				</FlexDivCentered>
			</Container>
			{walletOptionsModalOpened && (
				<WalletOptionsModal onDismiss={() => setWalletOptionsModalOpened(false)} />
			)}
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
			{notificationsModalOpened && (
				<NotificationsModal onDismiss={() => setNotificationsModalOpened(false)} />
			)}
		</>
	);
};

const Container = styled.div``;

const Menu = styled.div`
	padding-right: 16px;
	display: grid;
	grid-gap: 10px;
	grid-auto-flow: column;
`;

const WalletButton = styled(Button)`
	display: inline-flex;
	align-items: center;
	font-family: ${(props) => props.theme.fonts.mono};
	background-color: ${(props) => props.theme.colors.elderberry};
	border: 1px solid ${(props) => props.theme.colors.navy};
	color: ${(props) => props.theme.colors.white};
	border-radius: 4px;
`;

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 6px;
`;

const MenuButton = styled.button<{ isActive: boolean }>`
	${resetButtonCSS};
	color: ${(props) =>
		props.isActive ? props.theme.colors.goldColors.color1 : props.theme.colors.blueberry};
	&:hover {
		color: ${(props) => props.theme.colors.goldColors.color1};
	}
	padding: 5px;
`;

const StyledCaretDownIcon = styled(Svg)`
	width: 8px;
	color: ${(props) => props.theme.colors.blueberry};
	margin-left: 7px;
`;

export default UserMenu;
