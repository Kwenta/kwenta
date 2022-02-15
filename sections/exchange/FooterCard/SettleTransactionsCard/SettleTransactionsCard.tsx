import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { Synths } from 'constants/currency';

import { NoTextTransform } from 'styles/common';

import { MobileOrTabletView } from 'components/Media';

import { MessageContainer, Message, MessageButton, FixedMessageContainerSpacer } from '../common';

const { sUSD } = Synths;

type SettleTransactionsCardProps = {
	attached?: boolean;
	onSubmit: () => void;
};

const SettleTransactionsCard: FC<SettleTransactionsCardProps> = ({ attached, onSubmit }) => {
	const { t } = useTranslation();

	return (
		<>
			<MobileOrTabletView>
				<FixedMessageContainerSpacer />
			</MobileOrTabletView>
			<MessageContainer attached={attached} className="footer-card">
				<Message>
					<Trans
						t={t}
						i18nKey={'exchange.settle.message'}
						values={{ currencyKey: sUSD }}
						components={[<NoTextTransform />]}
					/>
				</Message>
				<MessageButton>
					<Trans
						t={t}
						i18nKey="exchange.settle.buttontext"
						values={{ currencyKey: sUSD }}
						components={[<NoTextTransform />]}
						onClick={onSubmit}
					/>
				</MessageButton>
			</MessageContainer>
		</>
	);
};

export default SettleTransactionsCard;