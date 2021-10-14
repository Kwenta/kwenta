import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Link from 'next/link';

//import { Synths } from 'constants/currency';

import { NoTextTransform } from 'styles/common';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';
import ROUTES from 'constants/routes';

import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';
import { useRecoilValue } from 'recoil';
import { isL2State } from 'store/wallet';
import { Synths } from '@synthetixio/contracts-interface';

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
				<Link href={ROUTES.Futures.Market.MarketPair(Synths.sBTC)}>
					<MessageButton>
						<Trans t={t} i18nKey="homepage.nav.start-trading" />
					</MessageButton>
				</Link>
			</MessageContainer>
		</>
	);
};

export default NoSynthsCard;
