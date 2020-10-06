import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Link from 'next/link';

import { SYNTHS_MAP } from 'constants/currency';

import { NoTextTransform } from 'styles/common';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import ROUTES from 'constants/routes';

import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';

const { sUSD } = SYNTHS_MAP;

type NoSynthsCardProps = {
	attached?: boolean;
};

const NoSynthsCard: FC<NoSynthsCardProps> = ({ attached }) => {
	const { t } = useTranslation();

	return (
		<>
			<MobileOrTabletView>
				<FixedMessageContainerSpacer />
			</MobileOrTabletView>
			<MessageContainer attached={attached}>
				<DesktopOnlyView>
					<Message>
						<Trans
							t={t}
							i18nKey="exchange.onboard.message"
							values={{ currencyKey: sUSD }}
							components={[<NoTextTransform />]}
						/>
					</Message>
				</DesktopOnlyView>
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
			</MessageContainer>
		</>
	);
};

export default NoSynthsCard;
