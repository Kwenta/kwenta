import Link from 'next/link';
import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import { EXTERNAL_LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import useIsL2 from 'hooks/useIsL2';
import { NoTextTransform, ExternalLink } from 'styles/common';

import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';

const NoSynthsCard: FC = () => {
	const { t } = useTranslation();
	const isL2 = useIsL2();

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
							i18nKey={'futures.wallet-overview.no-positions'}
							values={{ currencyKey: 'sUSD' }}
							components={[<NoTextTransform />]}
						/>
					</Message>
				</DesktopOnlyView>
				{isL2 ? (
					<ExternalLink href={EXTERNAL_LINKS.Trading.OneInch}>
						<MessageButton>
							<Trans
								t={t}
								i18nKey="exchange.onboard.1inch-button"
								values={{ currencyKey: 'sUSD' }}
								components={[<NoTextTransform />]}
							/>
						</MessageButton>
					</ExternalLink>
				) : (
					<Link href={ROUTES.Dashboard.Convert}>
						<MessageButton>
							<Trans
								t={t}
								i18nKey="common.currency.buy-currency"
								values={{ currencyKey: 'sUSD' }}
								components={[<NoTextTransform />]}
							/>
						</MessageButton>
					</Link>
				)}
			</MessageContainer>
		</>
	);
};

export default NoSynthsCard;
