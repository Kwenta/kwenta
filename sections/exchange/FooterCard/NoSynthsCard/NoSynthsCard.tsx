import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Link from 'next/link';

import { Synths } from 'constants/currency';
import { EXTERNAL_LINKS } from 'constants/links';

import { NoTextTransform, ExternalLink } from 'styles/common';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import ROUTES from 'constants/routes';

import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';
import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';

const { sUSD } = Synths;

type NoSynthsCardProps = {
	attached?: boolean;
};

const NoSynthsCard: FC<NoSynthsCardProps> = ({ attached }) => {
	const { t } = useTranslation();
	const isL2 = useRecoilValue(isL2State);

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
							i18nKey={'futures.wallet-overview.no-positions'}
							values={{ currencyKey: sUSD }}
							components={[<NoTextTransform />]}
						/>
					</Message>
				</DesktopOnlyView>
				{isL2 ? (
					<ExternalLink href={EXTERNAL_LINKS.Trading.OneInch}>
						<MessageButton size="lg" variant="primary" isRounded={true}>
							<Trans
								t={t}
								i18nKey="exchange.onboard.1inch-button"
								values={{ currencyKey: sUSD }}
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
								values={{ currencyKey: sUSD }}
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
