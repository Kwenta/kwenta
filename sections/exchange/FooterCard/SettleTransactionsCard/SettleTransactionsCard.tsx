import Tippy from '@tippyjs/react';
import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Button from 'components/Button';
import { MobileOrTabletView } from 'components/Media';
import { EXTERNAL_LINKS } from 'constants/links';
import { useExchangeContext } from 'contexts/ExchangeContext';
import TxSettleModal from 'sections/shared/modals/TxSettleModal';
import { txErrorState } from 'store/exchange';
import { NoTextTransform, ExternalLink } from 'styles/common';
import { secondsToTime } from 'utils/formatters/date';

import { MessageContainer, Message, FixedMessageContainerSpacer } from '../common';

type SettleTransactionsCardProps = {
	attached?: boolean;
	settleCurrency: string | null;
	numEntries: number | null;
};

const SettleTransactionsCard: FC<SettleTransactionsCardProps> = ({
	attached,
	settleCurrency,
	numEntries,
}) => {
	const { t } = useTranslation();
	const txError = useRecoilValue(txErrorState);
	const {
		settlementWaitingPeriodInSeconds,
		settlementDisabledReason,
		openModal,
		handleSettle,
		baseCurrencyKey,
		setOpenModal,
	} = useExchangeContext();

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
							values={{ currencyKey: settleCurrency, numEntries }}
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
							disabled={!!settlementDisabledReason}
							onClick={handleSettle}
							size="lg"
							data-testid="settle"
						>
							{settlementDisabledReason ?? t('exchange.summary-info.button.settle')}
						</Button>
					</span>
				</ErrorTooltip>
			</MessageContainer>
			{openModal === 'settle' && (
				<TxSettleModal
					onDismiss={() => setOpenModal(undefined)}
					txError={txError}
					attemptRetry={handleSettle}
					currencyKey={baseCurrencyKey!}
					currencyLabel={<NoTextTransform>{baseCurrencyKey}</NoTextTransform>}
				/>
			)}
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
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.red};
	}
`;

export default SettleTransactionsCard;
