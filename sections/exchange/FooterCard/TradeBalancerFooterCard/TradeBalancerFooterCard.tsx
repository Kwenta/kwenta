import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';
import { CurrencyKey } from 'constants/currency';

type TradeBalancerFooterCardProps = {
	attached?: boolean;
	synth: CurrencyKey;
	onClick: () => void;
};

const TradeBalancerFooterCard: FC<TradeBalancerFooterCardProps> = ({
	attached,
	synth,
	onClick,
}) => {
	const { t } = useTranslation();
	return (
		<>
			<MobileOrTabletView>
				<FixedMessageContainerSpacer />
			</MobileOrTabletView>
			<MessageContainer attached={attached} className="footer-card">
				<DesktopOnlyView>
					<Message>
						{t('exchange.footer-card.market-closure.reasons.after-hours.message', {
							asset: synth.substring(1),
						})}
					</Message>
				</DesktopOnlyView>
				<MessageButton onClick={onClick}>
					{t('exchange.footer-card.market-closure.reasons.after-hours.button-label')}
				</MessageButton>
			</MessageContainer>
		</>
	);
};

export default TradeBalancerFooterCard;
