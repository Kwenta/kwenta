import { secondsToTime } from '@kwenta/sdk/utils'
import { FC, useMemo, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import Card, { CardBody } from 'components/Card'
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media'
import ErrorTooltip from 'components/Tooltip/ErrorTooltip'
import { MessageContainer } from 'sections/exchange/message'
import { SummaryItems } from 'sections/exchange/summary'
import FeeCostSummaryItem from 'sections/shared/components/FeeCostSummary'
import FeeRateSummaryItem from 'sections/shared/components/FeeRateSummary'
import GasPriceSelect from 'sections/shared/components/GasPriceSelect'
import PriceImpactSummary from 'sections/shared/components/PriceImpactSummary'
import TxApproveModal from 'sections/shared/modals/TxApproveModal'
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal'
import { submitApprove, submitExchange } from 'state/exchange/actions'
import {
	selectIsApproved,
	selectShowFee,
	selectSubmissionDisabledReason,
} from 'state/exchange/selectors'
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
			<MobileOrTabletView>
				<MobileCard className="trade-summary-card">
					<CardBody>
						<SummaryItemsWrapper />
					</CardBody>
				</MobileCard>
			</MobileOrTabletView>
			<MessageContainer className="footer-card">
				<DesktopOnlyView>
					<SummaryItemsWrapper />
				</DesktopOnlyView>
				<TradeErrorTooltip {...{ onSubmit, isApproved }} />
			</MessageContainer>
			{openModal === 'confirm' && <TxConfirmationModal attemptRetry={onSubmit} />}
			{openModal === 'approve' && <TxApproveModal attemptRetry={handleApprove} />}
		</>
	)
})

const SummaryItemsWrapper = memo(() => {
	const showFee = useAppSelector(selectShowFee)

	return (
		<SummaryItems>
			<GasPriceSelect />
			<PriceImpactSummary />
			{showFee && (
				<>
					<FeeRateSummaryItem />
					<FeeCostSummaryItem />
				</>
			)}
		</SummaryItems>
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

const MobileCard = styled(Card)`
	margin: 2px auto 20px auto;
`

export default TradeSummaryCard
