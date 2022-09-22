import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { EXTERNAL_LINKS } from 'constants/links';
import { NoTextTransform, ExternalLink } from 'styles/common';

import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';

const GetL2GasCard: FC = () => {
	const { t } = useTranslation();

	return (
		<>
			<MobileOrTabletView>
				<FixedMessageContainerSpacer />
			</MobileOrTabletView>
			<MessageContainer className="footer-card">
				<DesktopOnlyView>
					<Message>
						<Trans
							t={t}
							i18nKey="exchange.footer-card.get-l2-gas.message"
							components={[<NoTextTransform />]}
						/>
					</Message>
				</DesktopOnlyView>
				<ExternalLink href={EXTERNAL_LINKS.Trading.OptimismTokenBridge}>
					<MessageButton>
						<Trans
							t={t}
							i18nKey="common.currency.bridge-currency"
							values={{ currencyKey: 'ETH' }}
							components={[<NoTextTransform />]}
						/>
					</MessageButton>
				</ExternalLink>
			</MessageContainer>
		</>
	);
};

export default GetL2GasCard;
