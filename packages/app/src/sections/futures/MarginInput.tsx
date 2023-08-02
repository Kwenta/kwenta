import { MIN_MARGIN_AMOUNT } from '@kwenta/sdk/constants'
import { floorNumber } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React, { ChangeEvent, memo, useMemo } from 'react'
import styled from 'styled-components'

import InputTitle from 'components/Input/InputTitle'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivRow } from 'components/layout/flex'
import SelectorButtons from 'components/SelectorButtons'
import { Body } from 'components/Text'
import { selectSelectedInputDenomination, selectPosition } from 'state/futures/selectors'
import { editSmartMarginTradeMarginDelta } from 'state/futures/smartMargin/actions'
import { selectIdleMargin, selectMarginDeltaInputValue } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

const PERCENT_OPTIONS = ['10%', '25%', '50%', '100%']

type MarginInputProps = {
	isMobile?: boolean
}

const MarginInput: React.FC<MarginInputProps> = memo(({ isMobile }) => {
	const dispatch = useAppDispatch()

	const idleMargin = useAppSelector(selectIdleMargin)
	const assetInputType = useAppSelector(selectSelectedInputDenomination)
	const marginDeltaInputValue = useAppSelector(selectMarginDeltaInputValue)
	const maxMargin = useAppSelector(selectIdleMargin)
	const position = useAppSelector(selectPosition)

	const onChangeValue = (_: ChangeEvent<HTMLInputElement>, v: string) => {
		dispatch(editSmartMarginTradeMarginDelta(v))
	}

	const onSelectPercent = (index: number) => {
		const percent = PERCENT_OPTIONS[index].replace('%', '')
		const margin = idleMargin.div(100).mul(percent)

		dispatch(editSmartMarginTradeMarginDelta(floorNumber(margin).toString()))
	}

	const belowMinMargin = useMemo(
		() =>
			marginDeltaInputValue !== '' &&
			wei(marginDeltaInputValue)
				.add(position?.remainingMargin || 0)
				.lt(MIN_MARGIN_AMOUNT),
		[marginDeltaInputValue, position?.remainingMargin]
	)

	const invalid =
		assetInputType === 'usd' &&
		marginDeltaInputValue !== '' &&
		(maxMargin.lt(marginDeltaInputValue || 0) || belowMinMargin)

	return (
		<>
			<Container>
				<OrderSizingRow>
					<InputTitle>Margin</InputTitle>
					<InputHelpers>
						<SelectorButtons onSelect={onSelectPercent} options={PERCENT_OPTIONS} />
					</InputHelpers>
				</OrderSizingRow>

				<NumericInput
					invalid={invalid}
					dataTestId={'set-order-margin-susd' + (isMobile ? '-mobile' : '-desktop')}
					value={marginDeltaInputValue}
					placeholder="0.00"
					right={belowMinMargin && <Body color="negative">Minimum $50</Body>}
					onChange={onChangeValue}
				/>
			</Container>
		</>
	)
})

const Container = styled.div`
	margin-top: 18px;
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

export default MarginInput
