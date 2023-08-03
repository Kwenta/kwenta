import { ZERO_WEI } from '@kwenta/sdk/constants'
import { useCallback } from 'react'

import { setOpenModal } from 'state/app/reducer'
import { selectMarketInfo, selectSubmittingFuturesTx } from 'state/futures/selectors'
import { approveSmartMargin } from 'state/futures/smartMargin/actions'
import {
	selectIsConditionalOrder,
	selectNewTradeHasSlTp,
	selectSmartMarginAllowanceValid,
	selectSmartMarginKeeperDeposit,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import TradeConfirmationModal from './TradeConfirmationModal'

// TODO: Merge this with TradeConfirmationModal

export default function TradeConfirmationModalCrossMargin() {
	const dispatch = useAppDispatch()

	const isConditionalOrder = useAppSelector(selectIsConditionalOrder)
	const isSubmitting = useAppSelector(selectSubmittingFuturesTx)
	const marketInfo = useAppSelector(selectMarketInfo)
	const allowanceValid = useAppSelector(selectSmartMarginAllowanceValid)
	const hasSlTp = useAppSelector(selectNewTradeHasSlTp)
	const keeperEthDeposit = useAppSelector(selectSmartMarginKeeperDeposit)

	const onDismiss = useCallback(() => {
		dispatch(setOpenModal(null))
	}, [dispatch])

	const handleApproveSmartMargin = useCallback(async () => {
		dispatch(approveSmartMargin())
	}, [dispatch])

	return (
		<TradeConfirmationModal
			onDismiss={onDismiss}
			onApproveAllowance={handleApproveSmartMargin}
			isSubmitting={isSubmitting}
			allowanceValid={allowanceValid}
			executionFee={marketInfo?.keeperDeposit ?? ZERO_WEI}
			keeperFee={isConditionalOrder || hasSlTp ? keeperEthDeposit : null}
		/>
	)
}
