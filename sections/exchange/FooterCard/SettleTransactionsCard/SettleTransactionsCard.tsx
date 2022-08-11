import Tippy from '@tippyjs/react';
import { FC, ReactNode } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';

import Button from 'components/Button';
import { MobileOrTabletView } from 'components/Media';
import { EXTERNAL_LINKS } from 'constants/links';
import { useExchangeContext } from 'contexts/ExchangeContext';
import { NoTextTransform, ExternalLink } from 'styles/common';
import { secondsToTime } from 'utils/formatters/date';

import { MessageContainer, Message, FixedMessageContainerSpacer } from '../common';

type SettleTransactionsCardProps = {
	submissionDisabledReason?: ReactNode;
	attached?: boolean;
	onSubmit: () => void;
	settleCurrency: string | null;
	numEntries: number | null;
	settlementWaitingPeriodInSeconds: number;
};

const SettleTransactionsCard: FC<SettleTransactionsCardProps> = ({
	attached,
	onSubmit,
	settleCurrency,
	numEntries,
}) => {
	const { t } = useTranslation();
	const { settlementWaitingPeriodInSeconds, settlementDisabledReason } = useExchangeContext();

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
				<ErrorTooltip
					visible={settlementWaitingPeriodInSeconds > 0}
					placement="top"
					content={
						<div>
							{t('exchange.errors.settlement-waiting', {
								waitingPeriod: secondsToTime(settlementWaitingPeriodInSeconds),
								currencyKey: settleCurrency,
							})}
						</div>
					}
				>
					<span>
						<Button
							isRounded
							noOutline
							disabled={!!settlementDisabledReason}
							onClick={onSubmit}
							size="lg"
							data-testid="settle"
						>
							{settlementDisabledReason ?? t('exchange.summary-info.button.settle')}
						</Button>
					</span>
				</ErrorTooltip>
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
`;

export const MessageItems = styled.span`
	display: grid;
`;

export const ErrorTooltip = styled(Tippy)`
	font-size: 12px;
	background-color: ${(props) => props.theme.colors.red};
	color: ${(props) => props.theme.colors.selectedTheme.button.text};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.red};
	}
`;

export default SettleTransactionsCard;
