import { ZERO_WEI } from '@kwenta/sdk/constants'
import { PositionSide } from '@kwenta/sdk/types'
import { stripZeros, formatNumber, suggestedDecimals } from '@kwenta/sdk/utils'
import Wei, { wei } from '@synthetixio/wei'
import React, { useMemo, memo, useCallback } from 'react'
import styled from 'styled-components'

import TextButton from 'components/Button/TextButton'
import InputTitle from 'components/Input/InputTitle'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivRow } from 'components/layout/flex'
import { getStep } from 'components/Slider/Slider'
import StyledSlider from 'components/Slider/StyledSlider'
import Spacer from 'components/Spacer'
import { selectShowPositionModal } from 'state/app/selectors'
import { editCrossMarginPositionSize } from 'state/futures/smartMargin/actions'
import {
	selectEditPositionModalInfo,
	selectSmartMarginEditPosInputs,
} from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

type OrderSizingProps = {
	type: 'increase' | 'decrease'
	maxNativeValue: Wei
	minNativeValue: Wei
	isMobile?: boolean
}

const EditPositionSizeInput: React.FC<OrderSizingProps> = memo(
	({ isMobile, type, maxNativeValue, minNativeValue }) => {
		const dispatch = useAppDispatch()

		const { nativeSizeDelta } = useAppSelector(selectSmartMarginEditPosInputs)

		const { position } = useAppSelector(selectEditPositionModalInfo)
		const modal = useAppSelector(selectShowPositionModal)

		const onSizeChange = useCallback(
			(value: string) => {
				if (modal) {
					const side = position?.position?.side
					const sizeDelta =
						(side === PositionSide.LONG && type === 'decrease') ||
						(side === PositionSide.SHORT && type === 'increase')
							? '-' + value
							: value
					dispatch(editCrossMarginPositionSize(modal.marketKey, sizeDelta))
				}
			},
			[dispatch, type, modal, position?.position?.side]
		)

		const handleSetMax = useCallback(() => {
			onSizeChange(stripZeros(maxNativeValue.toString()))
		}, [onSizeChange, maxNativeValue])

		const onChangeValue = useCallback(
			(_: any, v: string) => {
				onSizeChange(v)
			},
			[onSizeChange]
		)

		const onChangeSlider = useCallback(
			(_: any, v: number | number[]) => onSizeChange(String(v)),
			[onSizeChange]
		)

		const nativeSizeDeltaWei = useMemo(() => {
			return !nativeSizeDelta || isNaN(Number(nativeSizeDelta)) ? ZERO_WEI : wei(nativeSizeDelta)
		}, [nativeSizeDelta])

		const maxNativeValueWithBuffer = useMemo(() => {
			if (type === 'decrease') return maxNativeValue
			return maxNativeValue.add(maxNativeValue.mul(0.001))
		}, [maxNativeValue, type])

		const invalid =
			nativeSizeDelta !== '' &&
			(maxNativeValueWithBuffer.lt(nativeSizeDeltaWei.abs()) ||
				minNativeValue.gt(nativeSizeDeltaWei.abs()))

		return (
			<OrderSizingContainer>
				<OrderSizingRow>
					<InputTitle>{type === 'increase' ? 'Increase' : 'Reduce'} position size</InputTitle>
					<InputHelpers>
						<TextButton onClick={handleSetMax}>Max</TextButton>
					</InputHelpers>
				</OrderSizingRow>

				<NumericInput
					invalid={invalid}
					dataTestId={'edit-position-size-input' + (isMobile ? '-mobile' : '-desktop')}
					value={nativeSizeDelta.replace('-', '')}
					placeholder="0.00"
					onChange={onChangeValue}
				/>
				<Spacer height={16} />
				<StyledSlider
					minValue={Number(minNativeValue.toString(suggestedDecimals(minNativeValue)))}
					maxValue={Number(maxNativeValue.toString(suggestedDecimals(maxNativeValue)))}
					step={getStep(maxNativeValue.toNumber())}
					defaultValue={0}
					value={nativeSizeDeltaWei.abs().toNumber()}
					onChange={onChangeSlider}
					valueLabelDisplay="auto"
					valueLabelFormat={(v) => formatNumber(v)}
					$currentMark={Number(nativeSizeDelta ?? 0)}
				/>
			</OrderSizingContainer>
		)
	}
)

const OrderSizingContainer = styled.div`
	margin-bottom: 16px;
`

const OrderSizingRow = styled(FlexDivRow)`
	width: 100%;
	align-items: center;
	margin-bottom: 8px;
	cursor: default;
`

const InputHelpers = styled.div`
	display: flex;
`

export default EditPositionSizeInput
