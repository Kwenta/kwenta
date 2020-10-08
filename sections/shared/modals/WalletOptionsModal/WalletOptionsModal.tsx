import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Connector from 'containers/Connector';

import Button from 'components/Button';

import { MenuModal } from '../common';

type WalletOptionsProps = {
	onDismiss: () => void;
};

export const WalletOptionsModal: FC<WalletOptionsProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const {
		connectWallet,
		disconnectWallet,
		switchAccounts,
		isHardwareWallet,
	} = Connector.useContainer();

	return (
		<StyledMenuModal onDismiss={onDismiss} isOpen={true} title={t('modals.wallet.title')}>
			<OptionButton
				onClick={() => {
					onDismiss();
					connectWallet();
				}}
			>
				{t('common.wallet.switch-wallet')}
			</OptionButton>
			{isHardwareWallet() && (
				<OptionButton
					onClick={() => {
						onDismiss();
						switchAccounts();
					}}
				>
					{t('common.wallet.switch-accounts')}
				</OptionButton>
			)}
			<OptionButton
				onClick={() => {
					onDismiss();
					disconnectWallet();
				}}
			>
				{t('common.wallet.disconnect-wallet')}
			</OptionButton>
		</StyledMenuModal>
	);
};

const StyledMenuModal = styled(MenuModal)`
	[data-reach-dialog-content] {
		width: 216px;
	}
	.card-body {
		padding: 24px;
	}
`;

const OptionButton = styled(Button).attrs({
	variant: 'outline',
})`
	margin-bottom: 16px;
	&:last-child {
		margin-bottom: 0;
	}
`;

export default WalletOptionsModal;
