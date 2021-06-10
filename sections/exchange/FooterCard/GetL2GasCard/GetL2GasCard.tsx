import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { NoTextTransform, ExternalLink } from 'styles/common';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { EXTERNAL_LINKS } from 'constants/links';
import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';

type GetL2GasCardProps = {
	attached?: boolean;
};

const GetL2GasCard: FC<GetL2GasCardProps> = ({ attached }) => {
	const { t } = useTranslation();

	return (
		<>
			<MobileOrTabletView>
				<FixedMessageContainerSpacer />
			</MobileOrTabletView>
			<MessageContainer attached={attached} className="footer-card">
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
							i18nKey="common.currency.buy-currency"
							values={{ currencyKey: 'wETH' }}
							components={[<NoTextTransform />]}
						/>
					</MessageButton>
				</ExternalLink>
			</MessageContainer>
		</>
	);
};

export default GetL2GasCard;
