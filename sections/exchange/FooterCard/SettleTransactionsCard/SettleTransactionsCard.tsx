import { FC, ReactNode } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';

import { EXTERNAL_LINKS } from 'constants/links';

import { NoTextTransform, ExternalLink } from 'styles/common';

import { MobileOrTabletView } from 'components/Media';

import { MessageContainer, Message, FixedMessageContainerSpacer } from '../common';
import Button from 'components/Button';

import { secondsToTime } from 'utils/formatters/date';

type SettleTransactionsCardProps = {
	submissionDisabledReason?: ReactNode;
	attached?: boolean;
	onSubmit: () => void;
	settleCurrency: string | null;
	numEntries: number | null;
	settlementWaitingPeriodInSeconds: number;
};

const SettleTransactionsCard: FC<SettleTransactionsCardProps> = ({
	submissionDisabledReason,
	attached,
	onSubmit,
	settleCurrency,
	numEntries,
	settlementWaitingPeriodInSeconds,
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
							variant="primary"
							isRounded={true}
							disabled={!!submissionDisabledReason}
							onClick={onSubmit}
							size="lg"
							data-testid="settle"
						>
							{submissionDisabledReason
								? submissionDisabledReason
								: t('exchange.summary-info.button.settle')}
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
	color: ${(props) => props.theme.colors.blueberry};
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
