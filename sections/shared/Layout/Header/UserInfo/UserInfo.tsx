import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

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
import { MobileOnlyView, MobileHiddenView } from 'components/Media';

const UserInfo: FC = () => {
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
				<MobileHiddenView>
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
									{hasOrdersNotification ? <NotificationAlertIcon /> : <NotificationIcon />}
								</MenuButton>
							)}
							<MenuButton
								onClick={() => {
									setSettingsModalOpened(!settingsModalOpened);
									setNotificationsModalOpened(false);
								}}
								isActive={settingsModalOpened}
							>
								<MenuIcon />
							</MenuButton>
						</Menu>
						{isWalletConnected ? (
							<WalletButton
								size="sm"
								variant="outline"
								onClick={() => setWalletOptionsModalOpened(true)}
							>
								<ConnectionDot />
								{truncatedWalletAddress}
								<StyledCaretDownIcon />
							</WalletButton>
						) : (
							<Button variant="primary" onClick={connectWallet}>
								{t('common.connect-wallet')}
							</Button>
						)}
					</FlexDivCentered>
				</MobileHiddenView>
				<MobileOnlyView>
					<Menu style={{ paddingRight: 0 }}>
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
								{hasOrdersNotification ? <NotificationAlertIcon /> : <NotificationIcon />}
							</MenuButton>
						)}
						<MenuButton
							onClick={() => {
								setSettingsModalOpened(!settingsModalOpened);
								setNotificationsModalOpened(false);
							}}
							isActive={settingsModalOpened}
						>
							<MenuIcon />
						</MenuButton>
					</Menu>
				</MobileOnlyView>
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

const Container = styled.div`
	margin-top: 8px;
`;

const Menu = styled.div`
	padding-right: 26px;
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

const ConnectionDot = styled.span`
	margin-right: 6px;
	display: inline-block;
	width: 8px;
	height: 8px;
	border-radius: 100%;
	background-color: ${(props) => props.theme.colors.green};
`;

const MenuButton = styled.button<{ isActive: boolean }>`
	${resetButtonCSS};
	color: ${(props) => (props.isActive ? props.theme.colors.purple : props.theme.colors.blueberry)};
	&:hover {
		color: ${(props) => props.theme.colors.purple};
	}
	padding: 5px;
`;

// @ts-ignore
const StyledCaretDownIcon = styled(CaretDownIcon)`
	width: 8px;
	color: ${(props) => props.theme.colors.blueberry};
	margin-left: 7px;
`;

export default UserInfo;
