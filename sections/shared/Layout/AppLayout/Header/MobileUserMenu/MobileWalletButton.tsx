import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { NetworkId } from 'sdk/types/common';
import { isSupportedNetworkId } from 'utils/network';

import ConnectionDot from '../ConnectionDot';
import MobileWalletActions from './MobileWalletActions';

type MobileWalletButtonProps = {
	toggleModal(): void;
	closeModal(): void;
};

const MobileConnectButton = () => {
	const { t } = useTranslation();
	const { openConnectModal: connectWallet } = useConnectModal();

	return (
		<ConnectButton
			size="small"
			variant="flat"
			noOutline
			onClick={connectWallet}
			data-testid="connect-wallet"
			mono
		>
			<ConnectionDot />
			{t('common.wallet.connect-wallet')}
		</ConnectButton>
	);
};

const MobileUnsupportedButton = () => {
	const { t } = useTranslation();
	const { openChainModal } = useChainModal();

	return (
		<ConnectButton
			size="small"
			variant="flat"
			data-testid="unsupported-network"
			mono
			onClick={openChainModal}
		>
			<ConnectionDot />
			{t('common.wallet.unsupported-network')}
		</ConnectButton>
	);
};

const MobileWalletButton: React.FC<MobileWalletButtonProps> = ({ toggleModal }) => {
	const { network, isWalletConnected } = Connector.useContainer();

	if (!isWalletConnected) {
		return <MobileConnectButton />;
	} else if (isSupportedNetworkId(network?.id as NetworkId)) {
		return <MobileWalletActions toggleModal={toggleModal} />;
	} else {
		return <MobileUnsupportedButton />;
	}
};

const ConnectButton = styled(Button)`
	font-size: 13px;
`;

export default MobileWalletButton;
