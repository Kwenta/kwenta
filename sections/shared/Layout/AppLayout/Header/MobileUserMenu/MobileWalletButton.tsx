import React from 'react';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { isWalletConnectedState, networkState } from 'store/wallet';
import useNetworkSwitcher from 'hooks/useNetworkSwitcher';
import ConnectionDot from '../ConnectionDot';
import { isSupportedNetworkId } from 'utils/network';
import MobileWalletActions from './MobileWalletActions';

type MobileWalletButtonProps = {
	toggleModal(): void;
	closeModal(): void;
};

const MobileWalletButton: React.FC<MobileWalletButtonProps> = ({ toggleModal, closeModal }) => {
	const { t } = useTranslation();
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const network = useRecoilValue(networkState);
	const { connectWallet } = Connector.useContainer();
	const { switchToL2 } = useNetworkSwitcher();

	const walletIsNotConnected = (
		<ConnectButton
			size="sm"
			variant="outline"
			noOutline
			onClick={() => {
				closeModal();
				connectWallet();
			}}
			data-testid="connect-wallet"
			mono
		>
			<StyledConnectionDot />
			{t('common.wallet.connect-wallet')}
		</ConnectButton>
	);

	const walletIsConnectedButNotSupported = (
		<ConnectButton
			size="sm"
			variant="outline"
			data-testid="unsupported-network"
			mono
			onClick={switchToL2}
		>
			<StyledConnectionDot />
			{t('common.wallet.unsupported-network')}
		</ConnectButton>
	);

	const walletIsConnectedAndSupported = <MobileWalletActions toggleModal={toggleModal} />;

	return isWalletConnected
		? isSupportedNetworkId(network.id)
			? walletIsConnectedAndSupported
			: walletIsConnectedButNotSupported
		: walletIsNotConnected;
};

const StyledConnectionDot = styled(ConnectionDot)`
	margin-right: 6px;
`;

const ConnectButton = styled(Button)`
	font-size: 13px;
`;

export default MobileWalletButton;
