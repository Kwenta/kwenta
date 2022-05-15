import { FC, useState } from 'react';
import styled from 'styled-components';
import { useRecoilState, useRecoilValue } from 'recoil';

import { isWalletConnectedState } from 'store/wallet';
import { hasOrdersNotificationState } from 'store/ui';
import { FixedFooterMixin, resetButtonCSS } from 'styles/common';

import NotificationIcon from 'assets/svg/app/notification.svg';
import NotificationAlertIcon from 'assets/svg/app/notification-alert.svg';
import MenuIcon from 'assets/svg/app/menu.svg';
import CrossIcon from 'assets/svg/app/cross.svg';

import CloseIcon from 'assets/svg/app/close.svg';

import NotificationsModal from 'sections/shared/modals/NotificationsModal';

import MobileSettingsModal from './MobileSettingsModal';
import WalletButton from '../UserMenu/WalletButton';

const MobileUserMenu: FC = () => {
	// const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const [settingsModalOpened, setSettingsModalOpened] = useState<boolean>(false);
	const [notificationsModalOpened, setNotificationsModalOpened] = useState<boolean>(false);
	// const [hasOrdersNotification, setHasOrdersNotification] = useRecoilState(
	// 	hasOrdersNotificationState
	// );

	return (
		<>
			<MobileFooterContainer>
				<CloseIcon />
				<MobileFooterSeparator />
				<MobileFooterRight>
					<div className="text">Menu</div>
					<WalletButton />
				</MobileFooterRight>
				{/* {isWalletConnected && (
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
					</MenuButton> */}
			</MobileFooterContainer>
			{notificationsModalOpened && (
				<NotificationsModal onDismiss={() => setNotificationsModalOpened(false)} />
			)}
			{settingsModalOpened && (
				<MobileSettingsModal onDismiss={() => setSettingsModalOpened(false)} />
			)}
		</>
	);
};

const MobileFooterContainer = styled.div`
	${FixedFooterMixin};
	display: flex;
	align-items: center;
	border-top: 1px solid #2b2a2a;
	padding: 16px 20px;
	background-color: ${(props) => props.theme.colors.selectedTheme.background};
`;

const MobileFooterSeparator = styled.div`
	margin: 0 20px;
	height: 100%;
	width: 1px;
	background-color: red;
	border: 1px solid red;
`;

const MobileFooterRight = styled.div`
	display: flex;
	flex-grow: 1;
	justify-content: space-between;
	align-items: center;

	.text {
		font-size: 19px;
		color: ${(props) => props.theme.colors.common.primaryWhite};
		font-family: ${(props) => props.theme.fonts.bold};
	}
`;

const Menu = styled.div`
	padding-right: 26px;
	display: grid;
	grid-gap: 10px;
	grid-auto-flow: column;
`;

const MenuButton = styled.button<{ isActive: boolean }>`
	${resetButtonCSS};
	color: ${(props) => (props.isActive ? props.theme.colors.white : props.theme.colors.blueberry)};
	&:hover {
		color: ${(props) => props.theme.colors.white};
	}
	padding: 5px;
`;

export default MobileUserMenu;
