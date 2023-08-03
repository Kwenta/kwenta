import { ZERO_WEI } from '@kwenta/sdk/constants'
import { floorNumber, formatCryptoCurrency, formatDollars, isZero } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import React, { useMemo, memo, useCallback } from 'react'
import styled from 'styled-components'

import TextButton from 'components/Button/TextButton'
import InputHeaderRow from 'components/Input/InputHeaderRow'
import InputTitle, { InputTitleSpan } from 'components/Input/InputTitle'
import NumericInput from 'components/Input/NumericInput'
import { editTradeSizeInput } from 'state/futures/actions'
import { selectMarketIndexPrice } from 'state/futures/common/selectors'
import {
	selectPosition,
	selectSelectedInputDenomination,
	selectMaxUsdSizeInput,
	selectLeverageSide,
	selectAvailableOi,
	selectTradeSizeInputsDisabled,
	selectTradeSizeInputs,
	selectTradePrice,
} from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import { DenominationToggle } from './DenominationToggle'

type OrderSizingProps = {
	isMobile?: boolean
}

const OrderSizing: React.FC<OrderSizingProps> = memo(({ isMobile }) => {
	const dispatch = useAppDispatch()

	const { susdSizeString, nativeSizeString } = useAppSelector(selectTradeSizeInputs)

	const position = useAppSelector(selectPosition)
	const marketAssetRate = useAppSelector(selectMarketIndexPrice)
	const orderPrice = useAppSelector(selectTradePrice)
	const assetInputType = useAppSelector(selectSelectedInputDenomination)
	const maxUsdInputAmount = useAppSelector(selectMaxUsdSizeInput)
	const tradeSide = useAppSelector(selectLeverageSide)
	const availableOi = useAppSelector(selectAvailableOi)
	const isDisabled = useAppSelector(selectTradeSizeInputsDisabled)

	const tradePrice = useMemo(
		() => (orderPrice ? wei(orderPrice) : marketAssetRate),
		[orderPrice, marketAssetRate]
	)

	const increasingPosition =
		!position?.activePosition.side || position?.activePosition.side === tradeSide

	const availableOiUsd = useMemo(() => {
		return increasingPosition
			? availableOi[tradeSide].usd
			: availableOi[tradeSide].usd.add(position?.activePosition.notionalValue || 0)
	}, [tradeSide, availableOi, increasingPosition, position?.activePosition.notionalValue])

	const availableOiNative = useMemo(() => {
		return increasingPosition
			? availableOi[tradeSide].native
			: availableOi[tradeSide].native.add(position?.activePosition.size || 0)
	}, [tradeSide, availableOi, increasingPosition, position?.activePosition.size])

	const maxNativeValue = useMemo(() => {
		const max = !isZero(tradePrice) ? maxUsdInputAmount.div(tradePrice) : ZERO_WEI
		return max.lt(availableOiNative) ? max : availableOiNative
	}, [tradePrice, maxUsdInputAmount, availableOiNative])

	const onSizeChange = useCallback(
		(value: string, assetType: 'native' | 'usd') => {
			dispatch(editTradeSizeInput(value, assetType))
		},
		[dispatch]
	)

	const handleSetMax = useCallback(() => {
		onSizeChange(String(floorNumber(maxNativeValue)), 'native')
	}, [onSizeChange, maxNativeValue])

	const onChangeValue = useCallback(
		(_: any, v: string) => {
			dispatch(editTradeSizeInput(v, assetInputType))
		},
		[dispatch, assetInputType]
	)

	const invalid = useMemo(() => {
		return (
			(assetInputType === 'usd' &&
				susdSizeString !== '' &&
				maxUsdInputAmount.lte(susdSizeString || 0)) ||
			(assetInputType === 'native' &&
				nativeSizeString !== '' &&
				maxNativeValue.lte(nativeSizeString || 0)) ||
			availableOiUsd.lt(susdSizeString || 0)
		)
	}, [
		assetInputType,
		maxNativeValue,
		nativeSizeString,
		availableOiUsd,
		maxUsdInputAmount,
		susdSizeString,
	])

	return (
		<OrderSizingContainer>
			<InputHeaderRow
				disabled={isDisabled}
				label={
					<InputTitle>
						Size
						{maxUsdInputAmount.gt(availableOiUsd) ? (
							<InputTitleSpan invalid={availableOiUsd.lt(susdSizeString || 0)}>
								&nbsp; — &nbsp; Available OI{' '}
								{assetInputType === 'usd'
									? formatDollars(availableOiUsd, { suggestDecimals: true })
									: formatCryptoCurrency(availableOiNative, { suggestDecimals: true })}
							</InputTitleSpan>
						) : (
							<InputTitleSpan invalid={maxUsdInputAmount.lt(susdSizeString || 0)}>
								&nbsp; — &nbsp; Max size{' '}
								{assetInputType === 'usd'
									? formatDollars(maxUsdInputAmount, { suggestDecimals: true })
									: formatCryptoCurrency(maxNativeValue, { suggestDecimals: true })}
							</InputTitleSpan>
						)}
					</InputTitle>
				}
				rightElement={
					<InputHelpers>
						<TextButton onClick={handleSetMax}>Max</TextButton>
					</InputHelpers>
				}
			/>

			<NumericInput
				invalid={invalid}
				dataTestId={'set-order-size-amount-susd' + (isMobile ? '-mobile' : '-desktop')}
				disabled={isDisabled}
				right={<DenominationToggle />}
				value={assetInputType === 'usd' ? susdSizeString : nativeSizeString}
				placeholder="0.00"
				onChange={onChangeValue}
			/>
		</OrderSizingContainer>
	)
})

const OrderSizingContainer = styled.div`
	margin-bottom: 16px;
`

const InputHelpers = styled.div`
	display: flex;
`

export default OrderSizing
