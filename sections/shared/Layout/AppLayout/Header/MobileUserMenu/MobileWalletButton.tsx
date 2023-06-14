import { useChainModal, useConnectModal } from '@rainbow-me/rainbowkit';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import Connector from 'containers/Connector';
import { NetworkId } from 'sdk/types/common';
import { isSupportedNetworkId } from 'utils/network';

import ConnectionDot from '../ConnectionDot';

import MobileWalletActions from './MobileWalletActions';

type MobileConnectButtonProps = {
	toggleModal(): void;
};

const MobileConnectButton: React.FC<MobileConnectButtonProps> = ({ toggleModal }) => {
	const { t } = useTranslation();
	const { openConnectModal } = useConnectModal();

	const handleConnect = useCallback(() => {
		toggleModal();
		openConnectModal?.();
	}, [toggleModal, openConnectModal]);

	return (
		<ConnectButton
			size="small"
			variant="flat"
			noOutline
			onClick={handleConnect}
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

type MobileWalletButtonProps = {
	toggleModal(): void;
};

const MobileWalletButton: React.FC<MobileWalletButtonProps> = ({ toggleModal }) => {
	const { network, isWalletConnected } = Connector.useContainer();

	if (!isWalletConnected) {
		return <MobileConnectButton toggleModal={toggleModal} />;
	} else if (isSupportedNetworkId(network?.id as NetworkId)) {
		return <MobileWalletActions />;
	} else {
		return <MobileUnsupportedButton />;
	}
};

const ConnectButton = styled(Button)`
	font-size: 13px;
`;

export default MobileWalletButton;
