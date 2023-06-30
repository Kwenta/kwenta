import { secondsToTime } from '@kwenta/sdk/utils'
import { FC, useCallback, memo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import { MobileOrTabletView } from 'components/Media'
import ErrorTooltip from 'components/Tooltip/ErrorTooltip'
import { EXTERNAL_LINKS } from 'constants/links'
import { MessageContainer, Message, FixedMessageContainerSpacer } from 'sections/exchange/message'
import TxSettleModal from 'sections/shared/modals/TxSettleModal'
import { submitSettle } from 'state/exchange/actions'
import { closeModal } from 'state/exchange/reducer'
import { useAppDispatch, useAppSelector } from 'state/hooks'
import { NoTextTransform, ExternalLink } from 'styles/common'
import logError from 'utils/logError'

const SettleTransactionsCard: FC = memo(() => {
	const { t } = useTranslation()

	const { baseCurrencyKey, openModal, numEntries, settlementWaitingPeriod, txError } =
		useAppSelector(({ exchange }) => ({
			baseCurrencyKey: exchange.baseCurrencyKey,
			openModal: exchange.openModal,
			numEntries: exchange.numEntries,
			settlementWaitingPeriod: exchange.settlementWaitingPeriod,
			txError: exchange.txError,
		}))
	const dispatch = useAppDispatch()

	const settlementDisabledReason =
		settlementWaitingPeriod > 0 ? t('exchange.summary-info.button.settle-waiting-period') : null

	const handleSettle = useCallback(() => {
		try {
			dispatch(submitSettle())
		} catch (e) {
			logError(e)
		}
	}, [dispatch])

	const handleCloseModal = useCallback(() => {
		dispatch(closeModal())
	}, [dispatch])

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
							i18nKey="exchange.footer-card.settle.message"
							values={{ currencyKey: baseCurrencyKey, numEntries }}
							components={[<NoTextTransform />]}
						/>
					</MessageItem>
					<UnderlineExternalLink href={EXTERNAL_LINKS.Docs.FeeReclamation}>
						<Trans
							t={t}
							i18nKey="exchange.footer-card.settle.learn-more"
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
							size="large"
							data-testid="settle"
						>
							{settlementDisabledReason ?? t('exchange.summary-info.button.settle')}
						</Button>
					</span>
				</ErrorTooltip>
			</MessageContainer>
			{openModal === 'settle' && (
				<TxSettleModal onDismiss={handleCloseModal} txError={txError} attemptRetry={handleSettle} />
			)}
		</>
	)
})

const MessageItem = styled(Message)`
	grid-column-start: 2;
	text-align: left;
`

const UnderlineExternalLink = styled(ExternalLink)`
	text-decoration: underline;
	grid-column-start: 2;
`

const MessageItems = styled.span`
	display: grid;
`

export default SettleTransactionsCard
