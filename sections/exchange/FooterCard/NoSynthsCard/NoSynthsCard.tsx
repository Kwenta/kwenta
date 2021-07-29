import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Link from 'next/link';

import { Synths } from 'constants/currency';

import { NoTextTransform } from 'styles/common';

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
							i18nKey={isL2 ? 'exchange.onboard.l2-message' : 'exchange.onboard.message'}
							values={{ currencyKey: sUSD }}
							components={[<NoTextTransform />]}
						/>
					</Message>
				</DesktopOnlyView>
				{isL2 ? (
					<Link href={'https://staking.synthetix.io/staking'}>
						<MessageButton size="lg" variant="primary" isRounded={true}>
							<Trans
								t={t}
								i18nKey="exchange.onboard.mint-button"
								values={{ currencyKey: sUSD }}
								components={[<NoTextTransform />]}
							/>
						</MessageButton>
					</Link>
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
