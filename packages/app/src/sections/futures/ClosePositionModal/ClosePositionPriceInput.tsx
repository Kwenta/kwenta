import { PositionSide } from '@kwenta/sdk/types'
import { wei } from '@synthetixio/wei'
import { ChangeEvent, useCallback } from 'react'

import { selectShowPositionModal } from 'state/app/selectors'
import { editClosePositionPrice } from 'state/futures/smartMargin/actions'
import {
	selectCloseSMPositionOrderInputs,
	selectEditPositionModalInfo,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import OrderPriceInput from '../OrderPriceInput'

export default function ClosePositionPriceInput() {
	const dispatch = useAppDispatch()

	const { orderType, price } = useAppSelector(selectCloseSMPositionOrderInputs)
	const showPositionModal = useAppSelector(selectShowPositionModal)
	const { position, marketPrice } = useAppSelector(selectEditPositionModalInfo)

	const positionSide =
		position?.activePosition.side === PositionSide.SHORT ? PositionSide.LONG : PositionSide.SHORT

	const handleOnChange = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			if (showPositionModal?.marketKey) {
				dispatch(editClosePositionPrice(showPositionModal.marketKey, v))
			}
		},
		[dispatch, showPositionModal?.marketKey]
	)

	return (
		<OrderPriceInput
			orderType={orderType}
			orderPrice={price?.value || ''}
			positionSide={positionSide}
			marketPrice={marketPrice ?? wei(0)}
			onChange={handleOnChange}
		/>
	)
}
