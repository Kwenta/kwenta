import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import { NetworkId } from '@synthetixio/contracts-interface';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { isSupportedNetworkId } from 'utils/network';

import ConnectionDot from '../ConnectionDot';
import MobileWalletActions from './MobileWalletActions';

type MobileWalletButtonProps = {
	toggleModal(): void;
	closeModal(): void;
};

const MobileWalletButton: React.FC<MobileWalletButtonProps> = ({ toggleModal }) => {
	const { t } = useTranslation();
	const { network, isWalletConnected } = Connector.useContainer();
	const { openConnectModal: connectWallet } = useConnectModal();
	const { openChainModal } = useChainModal();

	const walletIsNotConnected = (
		<ConnectButton
			size="sm"
			variant="flat"
			noOutline
			onClick={connectWallet}
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
			variant="flat"
			data-testid="unsupported-network"
			mono
			onClick={openChainModal}
		>
			<StyledConnectionDot />
			{t('common.wallet.unsupported-network')}
		</ConnectButton>
	);

	const walletIsConnectedAndSupported = <MobileWalletActions toggleModal={toggleModal} />;

	return isWalletConnected
		? isSupportedNetworkId(network?.id as NetworkId)
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
