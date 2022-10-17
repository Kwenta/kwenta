import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { submitSettle } from 'state/exchange/actions';
import { setOpenModal } from 'state/exchange/reducer';
import { useAppDispatch, useAppSelector } from 'state/store';
import styled from 'styled-components';

import Button from 'components/Button';
import { MobileOrTabletView } from 'components/Media';
import StyledTooltip from 'components/Tooltip/StyledTooltip';
import { EXTERNAL_LINKS } from 'constants/links';
import TxSettleModal from 'sections/shared/modals/TxSettleModal';
import { txErrorState } from 'store/exchange';
import { NoTextTransform, ExternalLink } from 'styles/common';
import { secondsToTime } from 'utils/formatters/date';
import logError from 'utils/logError';

import { MessageContainer, Message, FixedMessageContainerSpacer } from '../common';

const SettleTransactionsCard: FC = () => {
	const { t } = useTranslation();
	const [txError, setTxError] = useRecoilState(txErrorState);

	const { baseCurrencyKey, openModal, numEntries, settlementWaitingPeriod } = useAppSelector(
		({ exchange }) => ({
			baseCurrencyKey: exchange.baseCurrencyKey,
			openModal: exchange.openModal,
			numEntries: exchange.numEntries,
			settlementWaitingPeriod: exchange.settlementWaitingPeriod,
		})
	);
	const dispatch = useAppDispatch();

	const settlementDisabledReason =
		settlementWaitingPeriod > 0 ? t('exchange.summary-info.button.settle-waiting-period') : null;

	const handleSettle = async () => {
		setTxError(null);

		try {
			dispatch(submitSettle());
		} catch (e) {
			logError(e);
			setTxError(e.message);
		}
	};

	return (
		<>
			<MobileOrTabletView>
				<FixedMessageContainerSpacer />
			</MobileOrTabletView>
			<MessageContainer className="footer-card">
				<MessageItems>
					<MessageItem>
						<Trans
							t={t}
							i18nKey={'exchange.footer-card.settle.message'}
							values={{ currencyKey: baseCurrencyKey, numEntries }}
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
					visible={settlementWaitingPeriod > 0}
					preset="top"
					content={
						<div>
							{t('exchange.errors.settlement-waiting', {
								waitingPeriod: secondsToTime(settlementWaitingPeriod),
								currencyKey: baseCurrencyKey,
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

export const ErrorTooltip = styled(StyledTooltip)`
	font-size: 12px;
	background-color: ${(props) => props.theme.colors.red};
	color: ${(props) => props.theme.colors.selectedTheme.button.text.primary};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.red};
	}
`;

export default SettleTransactionsCard;
