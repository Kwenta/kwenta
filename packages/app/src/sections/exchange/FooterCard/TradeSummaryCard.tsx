import { secondsToTime } from '@kwenta/sdk/utils'
import { FC, useMemo, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import Button from 'components/Button'
import ErrorTooltip from 'components/Tooltip/ErrorTooltip'
import { MessageContainer } from 'sections/exchange/message'
import TxApproveModal from 'sections/shared/modals/TxApproveModal'
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal'
import { submitApprove, submitExchange } from 'state/exchange/actions'
import { selectIsApproved, selectSubmissionDisabledReason } from 'state/exchange/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

const TradeSummaryCard: FC = memo(() => {
	const dispatch = useAppDispatch()
	const openModal = useAppSelector(({ exchange }) => exchange.openModal)
	const isApproved = useAppSelector(selectIsApproved)

	// TODO: Make this a Redux action in itself.
	const onSubmit = useCallback(() => {
		if (!isApproved) {
			dispatch(submitApprove())
		} else {
			dispatch(submitExchange())
		}
	}, [dispatch, isApproved])

	const handleApprove = useCallback(() => {
		dispatch(submitApprove())
	}, [dispatch])

	return (
		<>
			<MessageContainer className="footer-card">
				<TradeErrorTooltip {...{ onSubmit, isApproved }} />
			</MessageContainer>
			{openModal === 'confirm' && <TxConfirmationModal attemptRetry={onSubmit} />}
			{openModal === 'approve' && <TxApproveModal attemptRetry={handleApprove} />}
		</>
	)
})

const SubmissionButton = ({ onSubmit }: any) => {
	const { t } = useTranslation()
	const isApproved = useAppSelector(selectIsApproved)
	const submissionDisabledReason = useAppSelector(selectSubmissionDisabledReason)

	const isSubmissionDisabled = useMemo(
		() => submissionDisabledReason != null,
		[submissionDisabledReason]
	)

	return (
		<Button
			disabled={isSubmissionDisabled}
			onClick={onSubmit}
			size="large"
			data-testid="submit-order"
			fullWidth
		>
			{!!submissionDisabledReason
				? t(submissionDisabledReason)
				: !isApproved
				? t('exchange.summary-info.button.approve')
				: t('exchange.summary-info.button.submit-order')}
		</Button>
	)
}

type TradeErrorTooltipProps = {
	onSubmit(): void
}

const TradeErrorTooltip: FC<TradeErrorTooltipProps> = memo(({ onSubmit }) => {
	const { t } = useTranslation()

	const { feeReclaimPeriod, quoteCurrencyKey } = useAppSelector(({ exchange }) => ({
		feeReclaimPeriod: exchange.feeReclaimPeriod,
		quoteCurrencyKey: exchange.quoteCurrencyKey,
	}))

	return (
		<ErrorTooltip
			visible={feeReclaimPeriod > 0}
			preset="top"
			content={
				<div>
					{t('exchange.errors.fee-reclamation', {
						waitingPeriod: secondsToTime(feeReclaimPeriod),
						currencyKey: quoteCurrencyKey,
					})}
				</div>
			}
		>
			<span>
				<SubmissionButton onSubmit={onSubmit} />
			</span>
		</ErrorTooltip>
	)
})

export default TradeSummaryCard
