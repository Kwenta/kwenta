import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Connector from 'containers/Connector';

import { DesktopOnlyView } from 'components/Media';

import { MessageButton, MessageContainer, Message } from '../common';

const ConnectWalletCard: FC = () => {
	const { t } = useTranslation();
	const { connectWallet } = Connector.useContainer();

	return (
		<MessageContainer>
			<DesktopOnlyView>
				<Message>{t('exchange.connect-wallet-card.message')}</Message>
			</DesktopOnlyView>
			<MessageButton onClick={connectWallet}>{t('common.wallet.connect-wallet')}</MessageButton>
		</MessageContainer>
	);
};

export default ConnectWalletCard;
