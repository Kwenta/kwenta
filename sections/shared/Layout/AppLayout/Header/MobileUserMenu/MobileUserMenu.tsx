import { FC, useState } from 'react';
import styled from 'styled-components';
import { useRecoilState, useRecoilValue } from 'recoil';

import { isWalletConnectedState } from 'store/wallet';
import { hasOrdersNotificationState } from 'store/ui';
import { resetButtonCSS } from 'styles/common';

import NotificationIcon from 'assets/svg/app/notification.svg';
import NotificationAlertIcon from 'assets/svg/app/notification-alert.svg';
import MenuIcon from 'assets/svg/app/menu.svg';
import CrossIcon from 'assets/svg/app/cross.svg';

import NotificationsModal from 'sections/shared/modals/NotificationsModal';

import MobileSettingsModal from './MobileSettingsModal';

const MobileUserMenu: FC = () => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const [settingsModalOpened, setSettingsModalOpened] = useState<boolean>(false);
	const [notificationsModalOpened, setNotificationsModalOpened] = useState<boolean>(false);
	const [hasOrdersNotification, setHasOrdersNotification] = useRecoilState(
		hasOrdersNotificationState
	);

	return (
		<>
			<Container>
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
						{settingsModalOpened ? <CrossIcon /> : <MenuIcon />}
					</MenuButton>
				</Menu>
			</Container>
			{notificationsModalOpened && (
				<NotificationsModal onDismiss={() => setNotificationsModalOpened(false)} />
			)}
			{settingsModalOpened && (
				<MobileSettingsModal onDismiss={() => setSettingsModalOpened(false)} />
			)}
		</>
	);
};

const Container = styled.div``;

const Menu = styled.div`
	padding-right: 26px;
	display: grid;
	grid-gap: 10px;
	grid-auto-flow: column;
`;

const MenuButton = styled.button<{ isActive: boolean }>`
	${resetButtonCSS};
	color: ${(props) =>
		props.isActive ? props.theme.colors.selectedTheme.button.text : props.theme.colors.blueberry};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
	padding: 5px;
`;

export default MobileUserMenu;
