import { ZERO_WEI } from '@kwenta/sdk/constants'
import { PositionSide } from '@kwenta/sdk/types'
import Wei, { wei } from '@synthetixio/wei'
import React, { useMemo, memo, useCallback } from 'react'
import styled from 'styled-components'

import InputTitle from 'components/Input/InputTitle'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivRow } from 'components/layout/flex'
import Spacer from 'components/Spacer'
import { selectShowPositionModal } from 'state/app/selectors'
import { editClosePositionSizeDelta } from 'state/futures/smartMargin/actions'
import {
	selectCloseSMPositionOrderInputs,
	selectEditPositionModalInfo,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

type OrderSizingProps = {
	maxNativeValue: Wei
	isMobile?: boolean
}

const ClosePositionSizeInput: React.FC<OrderSizingProps> = memo(({ isMobile, maxNativeValue }) => {
	const dispatch = useAppDispatch()

	const { nativeSizeDelta } = useAppSelector(selectCloseSMPositionOrderInputs)
	const { position } = useAppSelector(selectEditPositionModalInfo)
	const modal = useAppSelector(selectShowPositionModal)

	const onSizeChange = useCallback(
		(value: string) => {
			if (modal) {
				dispatch(
					editClosePositionSizeDelta(
						modal.marketKey,
						position?.side === PositionSide.LONG ? '-' + value : value
					)
				)
			}
		},
		[dispatch, modal, position?.side]
	)

	const onChangeValue = useCallback(
		(_: any, v: string) => {
			onSizeChange(v)
		},
		[onSizeChange]
	)

	const nativeSizeDeltaWei = useMemo(() => {
		return !nativeSizeDelta || isNaN(Number(nativeSizeDelta)) ? ZERO_WEI : wei(nativeSizeDelta)
	}, [nativeSizeDelta])

	const invalid = nativeSizeDelta !== '' && maxNativeValue.lt(nativeSizeDeltaWei.abs())

	return (
		<OrderSizingContainer>
			<OrderSizingRow>
				<InputTitle>Amount to close</InputTitle>
			</OrderSizingRow>

			<NumericInput
				invalid={invalid}
				dataTestId={'edit-position-size-input' + (isMobile ? '-mobile' : '-desktop')}
				value={nativeSizeDelta.replace('-', '')}
				placeholder="0.00"
				onChange={onChangeValue}
			/>
			<Spacer height={16} />
		</OrderSizingContainer>
	)
})

const OrderSizingContainer = styled.div``

const OrderSizingRow = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
	margin-bottom: 8px;
	cursor: default;
`

export default ClosePositionSizeInput
