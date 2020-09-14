import dynamic from 'next/dynamic';
import { FC, useState } from 'react';
import styled from 'styled-components';
import { useRecoilState, useRecoilValue } from 'recoil';

import { truncatedWalletAddressState } from 'store/wallet';
import { hasOrdersNotificationState } from 'store/ui';
import { FlexDivCentered, resetButtonCSS } from 'styles/common';
import Connector from 'containers/Connector';

import NotificationIcon from 'assets/svg/app/notification.svg';
import NotificationAlertIcon from 'assets/svg/app/notification-alert.svg';
import MenuIcon from 'assets/svg/app/menu.svg';

const NotificationsModal = dynamic(() => import('sections/shared/modals/NotificationsModal'), {
	ssr: false,
});

const SettingsModal = dynamic(() => import('sections/shared/modals/SettingsModal'), {
	ssr: false,
});

const Connected: FC = () => {
	const [settingsModalOpened, setSettingsModalOpened] = useState<boolean>(false);
	const [notificationsModalOpened, setNotificationsModalOpened] = useState<boolean>(false);
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);
	const [hasOrdersNotification, setHasOrdersNotification] = useRecoilState(
		hasOrdersNotificationState
	);
	const { onboard } = Connector.useContainer();

	return (
		<>
			<FlexDivCentered>
				<Menu>
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
				<Wallet onClick={() => onboard!.walletSelect()}>
					<ConnectionDot />
					{truncatedWalletAddress}
				</Wallet>
			</FlexDivCentered>
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
			{notificationsModalOpened && (
				<NotificationsModal onDismiss={() => setNotificationsModalOpened(false)} />
			)}
		</>
	);
};

const Menu = styled.div`
	padding-right: 26px;
	display: grid;
	grid-gap: 10px;
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

const MenuButton = styled.button<{ isActive: boolean }>`
	${resetButtonCSS};
	color: ${(props) => (props.isActive ? props.theme.colors.purple : props.theme.colors.blueberry)};
	&:hover {
		color: ${(props) => props.theme.colors.purple};
	}
	padding: 5px;
`;

export default Connected;
