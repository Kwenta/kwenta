import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import Connector from 'containers/Connector';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

import { MessageButton, MessageContainer, Message, FixedMessageContainerSpacer } from '../common';

type ConnectWalletCardProps = {
	attached?: boolean;
	className?: string;
};

const ConnectWalletCard: FC<ConnectWalletCardProps> = ({ attached, ...rest }) => {
	const { t } = useTranslation();
	const { connectWallet } = Connector.useContainer();

	return (
		<>
			<MobileOrTabletView>
				<FixedMessageContainerSpacer />
			</MobileOrTabletView>
			<MessageContainer attached={attached} className="footer-card" {...rest}>
				<DesktopOnlyView>
					<Message>{t('exchange.connect-wallet-card.message')}</Message>
				</DesktopOnlyView>
				<MessageButton onClick={connectWallet} data-testid="connect-wallet-btn">
					{t('common.wallet.connect-wallet')}
				</MessageButton>
			</MessageContainer>
		</>
	);
};

export default ConnectWalletCard;
