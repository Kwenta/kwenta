import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';

import Button from 'components/Button';

import {
	isWalletConnectedState,
	truncatedWalletAddressState
} from 'store/wallet';
import { FlexDivCentered, } from 'styles/common';

import WalletOptionsModal from 'sections/shared/modals/WalletOptionsModal';
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
	const truncatedWalletAddress = useRecoilValue(truncatedWalletAddressState);

	return (
		<>
			<Container>
				<FlexDivCentered>
					{isWalletConnected && (
						<NetworksSwitcher />
					)}
					{isWalletConnected ? (
						<WalletButton
							size="sm"
							variant="outline"
							onClick={() => setWalletOptionsModalOpened(true)}
							data-testid="wallet-btn"
						>
							<StyledConnectionDot />
							{truncatedWalletAddress}
						</WalletButton>
					) : (
						<ConnectButton
							size="sm"
							variant="outline"
							onClick={connectWallet}
							data-testid="connect-wallet"
							mono
						>
							{t('common.wallet.connect-wallet')}
						</ConnectButton>
					)}
					{isWalletConnected && (
						<MenuButton
							onClick={() => {
								setSettingsModalOpened(!settingsModalOpened);
							}}
							isActive={settingsModalOpened}
						>
							<SettingsText>...</SettingsText>
						</MenuButton>
					)}
				</FlexDivCentered>
			</Container>
			{walletOptionsModalOpened && (
				<WalletOptionsModal onDismiss={() => setWalletOptionsModalOpened(false)} />
			)}
			{settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
		</>
	);
};

const Container = styled.div``;

const WalletButton = styled(Button)`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
	margin-left: 15px;
`;

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 6px;
`;

const MenuButton = styled(Button)`
	display: flex;
	align-items: center;
	margin-left: 15px;
`;

const SettingsText = styled.p`
	margin: 0px;
	margin-bottom: 5px;
	line-height: 10px;
	height: 10px;
	letter-spacing: 2px;
	text-align: center;
`;

const ConnectButton = styled(Button)`
	font-size: 13px;
`;

export default UserMenu;
