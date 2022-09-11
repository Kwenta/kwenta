import useSynthetixQueries from '@synthetixio/queries';
import Tippy from '@tippyjs/react';
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import Button from 'components/Button';
import { MobileOrTabletView } from 'components/Media';
import { EXTERNAL_LINKS } from 'constants/links';
import Connector from 'containers/Connector';
import TransactionNotifier from 'containers/TransactionNotifier';
import { useExchangeContext } from 'contexts/ExchangeContext';
import useIsL2 from 'hooks/useIsL2';
import useNumEntriesQuery from 'queries/synths/useNumEntriesQuery';
import TxSettleModal from 'sections/shared/modals/TxSettleModal';
import { baseCurrencyKeyState, destinationCurrencyKeyState, txErrorState } from 'store/exchange';
import { NoTextTransform, ExternalLink } from 'styles/common';
import { secondsToTime } from 'utils/formatters/date';
import logError from 'utils/logError';

import { MessageContainer, Message, FixedMessageContainerSpacer } from '../common';

type SettleTransactionsCardProps = {
	attached?: boolean;
	numEntries: number | null;
};

const SettleTransactionsCard: React.FC<SettleTransactionsCardProps> = ({
	attached,
	numEntries,
}) => {
	const { t } = useTranslation();
	const [txError, setTxError] = useRecoilState(txErrorState);
	const {
		settlementWaitingPeriodInSeconds,
		settlementDisabledReason,
		openModal,
		setOpenModal,
	} = useExchangeContext();
	const baseCurrencyKey = useRecoilValue(baseCurrencyKeyState);
	const destinationCurrencyKey = useRecoilValue(destinationCurrencyKeyState);
	const { useSynthetixTxn } = useSynthetixQueries();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const { walletAddress } = Connector.useContainer();
	const numEntriesQuery = useNumEntriesQuery(walletAddress ?? '', baseCurrencyKey);
	const isL2 = useIsL2();

	const settleTxn = useSynthetixTxn(
		'Exchanger',
		'settle',
		[walletAddress, destinationCurrencyKey],
		undefined,
		{ enabled: !isL2 && (numEntries ?? 0) >= 12 }
	);

	React.useEffect(() => {
		if (settleTxn.hash) {
			monitorTransaction({
				txHash: settleTxn.hash,
				onTxConfirmed: () => {
					numEntriesQuery.refetch();
				},
			});
		}

		// eslint-disable-next-line
	}, [settleTxn.hash]);

	const handleSettle = async () => {
		setTxError(null);
		setOpenModal('settle');

		try {
			await settleTxn.mutateAsync();

			setOpenModal(undefined);
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
			<MessageContainer attached={attached} className="footer-card">
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
					visible={settlementWaitingPeriodInSeconds > 0}
					placement="top"
					content={
						<div>
							{t('exchange.errors.settlement-waiting', {
								waitingPeriod: secondsToTime(settlementWaitingPeriodInSeconds),
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
