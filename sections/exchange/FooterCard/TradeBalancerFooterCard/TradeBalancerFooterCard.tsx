import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';

type TradeBalancerFooterCardProps = {
	attached?: boolean;
	onClick: () => void;
};

const TradeBalancerFooterCard: FC<TradeBalancerFooterCardProps> = ({ attached, onClick }) => {
	const { t } = useTranslation();
	return (
		<>
			<MobileOrTabletView>
				<FixedMessageContainerSpacer />
			</MobileOrTabletView>
			<MessageContainer attached={attached} className="footer-card">
				<DesktopOnlyView>
					<Message>{t('exchange.footer-card.market-closure.reasons.after-hours.message')}</Message>
				</DesktopOnlyView>
				<MessageButton onClick={onClick}>
					{t('exchange.footer-card.market-closure.reasons.after-hours.button-label')}
				</MessageButton>
			</MessageContainer>
		</>
	);
};

export default TradeBalancerFooterCard;
