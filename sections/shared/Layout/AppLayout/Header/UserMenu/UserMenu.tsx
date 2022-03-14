import { FC, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Svg } from 'react-optimized-image';

import Connector from 'containers/Connector';

import useRedeemableDeprecatedSynthsQuery from 'queries/synths/useRedeemableDeprecatedSynthsQuery';

import Button from 'components/Button';

import {
	isWalletConnectedState,
	truncatedWalletAddressState,
	walletAddressState,
} from 'store/wallet';
import { FlexDivCentered, resetButtonCSS } from 'styles/common';

import MenuIcon from 'assets/svg/app/menu.svg';

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
	const walletAddress = useRecoilValue(walletAddressState);

	const redeemableDeprecatedSynthsQuery = useRedeemableDeprecatedSynthsQuery(walletAddress);
	const redeemableDeprecatedSynths =
		redeemableDeprecatedSynthsQuery.isSuccess && redeemableDeprecatedSynthsQuery.data != null
			? redeemableDeprecatedSynthsQuery.data
			: null;

	return (
		<>
			<Container>
				<FlexDivCentered>
					<Menu>
						{isWalletConnected && (
							<>
								<NetworksSwitcher />
							</>
						)}
						<MenuButton
							onClick={() => {
								setSettingsModalOpened(!settingsModalOpened);
							}}
							isActive={settingsModalOpened}
						>
							<Svg src={MenuIcon} />
						</MenuButton>
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

const Menu = styled.div`
	padding-right: 16px;
	display: grid;
	grid-gap: 10px;
	grid-auto-flow: column;
`;

const WalletButton = styled(Button)`
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 13px;
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

const ConnectButton = styled(Button)`
	font-size: 13px;
`;

export default UserMenu;
