import { useConnectModal } from '@rainbow-me/rainbowkit';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

import { MessageButton, MessageContainer, Message, FixedMessageContainerSpacer } from '../common';

type ConnectWalletCardProps = {
	className?: string;
};

const ConnectWalletCard: FC<ConnectWalletCardProps> = ({ ...rest }) => {
	const { t } = useTranslation();
	const { openConnectModal: connectWallet } = useConnectModal();

	return (
		<>
			<MobileOrTabletView>
				<FixedMessageContainerSpacer />
			</MobileOrTabletView>
			<MessageContainer className="footer-card" {...rest}>
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
