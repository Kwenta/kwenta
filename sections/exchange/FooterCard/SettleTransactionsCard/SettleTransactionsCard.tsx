import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';

import { EXTERNAL_LINKS } from 'constants/links';

import { NoTextTransform, ExternalLink } from 'styles/common';

import { MobileOrTabletView } from 'components/Media';

import { MessageContainer, Message, FixedMessageContainerSpacer } from '../common';
import Button from 'components/Button';

type SettleTransactionsCardProps = {
	attached?: boolean;
	onSubmit: () => void;
	settleCurrency: string | null;
	numEntries: number | null;
};

const SettleTransactionsCard: FC<SettleTransactionsCardProps> = ({
	attached,
	onSubmit,
	settleCurrency,
	numEntries,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<MobileOrTabletView>
				<FixedMessageContainerSpacer />
			</MobileOrTabletView>
			<MessageContainer attached={attached} className="footer-card">
				<MessageItems>
					<MessageItem>
						<Trans
							t={t}
							i18nKey={'exchange.footer-card.settle.message'}
							values={{ currencyKey: settleCurrency, numEntries: numEntries }}
							components={[<NoTextTransform />]}
						/>
					</MessageItem>
					<UnderlineExternalLink href={EXTERNAL_LINKS.Docs.FeeReclamation}>
						<Trans
							t={t}
							i18nKey={'exchange.footer-card.settle.learn-more'}
							components={[<NoTextTransform />]}
						/>
					</UnderlineExternalLink>
				</MessageItems>
				<Button
					variant="primary"
					isRounded={true}
					onClick={onSubmit}
					size="lg"
					data-testid="settle"
				>
					{t('exchange.summary-info.button.settle')}
				</Button>
			</MessageContainer>
		</>
	);
};

const MessageItem = styled(Message)`
	grid-column-start: 2;
	text-align: left;
`;

export const UnderlineExternalLink = styled(ExternalLink)`
	text-decoration: underline;
	grid-column-start: 2;
	color: ${(props) => props.theme.colors.blueberry};
`;

export const MessageItems = styled.span`
	display: grid;
`;

export default SettleTransactionsCard;
