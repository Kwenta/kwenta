import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Connector from 'containers/Connector';

import { MessageButton, RoundedContainer, Message } from '../common';

const ConnectWalletCard: FC = () => {
	const { t } = useTranslation();
	const { connectWallet } = Connector.useContainer();

	return (
		<RoundedContainer>
			<Message>{t('exchange.connect-wallet-card.message')}</Message>
			<MessageButton onClick={connectWallet}>{t('common.connect-wallet')}</MessageButton>
		</RoundedContainer>
	);
};

export default ConnectWalletCard;
