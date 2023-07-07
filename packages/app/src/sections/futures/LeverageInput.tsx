import { ZERO_WEI } from '@kwenta/sdk/constants'
import { FuturesMarginType } from '@kwenta/sdk/types'
import { floorNumber, truncateNumbers } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { Dispatch, FC, memo, SetStateAction, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from 'components/Button'
import TextButton from 'components/Button/TextButton'
import InputHeaderRow from 'components/Input/InputHeaderRow'
import InputTitle, { InputTitleSpan } from 'components/Input/InputTitle'
import NumericInput from 'components/Input/NumericInput'
import { FlexDivCol, FlexDivRow } from 'components/layout/flex'
import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults'
import { editTradeSizeInput } from 'state/futures/actions'
import { setLeverageInput } from 'state/futures/reducer'
import {
	selectLeverageInput,
	selectMarketIndexPrice,
	selectMaxLeverage,
	selectPosition,
	selectFuturesType,
	selectSmartMarginMarginDelta,
	selectTradeSizeInputsDisabled,
} from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import LeverageSlider from './LeverageSlider'

const ModeButton: FC<{
	mode: 'slider' | 'input'
	setMode: Dispatch<SetStateAction<'slider' | 'input'>>
}> = ({ mode, setMode }) => {
	const toggleMode = useCallback(() => {
		setMode((m) => (m === 'slider' ? 'input' : 'slider'))
	}, [setMode])

	return <TextButton onClick={toggleMode}>{mode === 'slider' ? 'Manual' : 'Slider'}</TextButton>
}

const LeverageInput: FC = memo(() => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const [mode, setMode] = useState<'slider' | 'input'>('input')
	const position = useAppSelector(selectPosition)
	const maxLeverage = useAppSelector(selectMaxLeverage)
	const marketPrice = useAppSelector(selectMarketIndexPrice)
	const leverageInput = useAppSelector(selectLeverageInput)
	const futuresType = useAppSelector(selectFuturesType)
	const smartMarginMarginDelta = useAppSelector(selectSmartMarginMarginDelta)
	const isDisabled = useAppSelector(selectTradeSizeInputsDisabled)

	const availableMargin = useMemo(() => {
		return futuresType === FuturesMarginType.CROSS_MARGIN
			? position?.remainingMargin
			: smartMarginMarginDelta
	}, [position?.remainingMargin, smartMarginMarginDelta, futuresType])

	const leverageButtons = useMemo(
		() => (maxLeverage.eq(50) ? ['2', '5', '25', '50'] : ['2', '5', '10', '25']),
		[maxLeverage]
	)

	const onLeverageChange = useCallback(
		(newLeverage: string) => {
			const remainingMargin = availableMargin ?? ZERO_WEI
			const newTradeSize =
				newLeverage === '' || marketPrice.eq(0) || remainingMargin.eq(0)
					? ''
					: wei(Number(newLeverage)).mul(remainingMargin).div(marketPrice).toString()
			const floored = floorNumber(Number(newTradeSize), 4)
			dispatch(editTradeSizeInput(String(floored), 'native'))
			dispatch(setLeverageInput(newLeverage))
		},
		[marketPrice, dispatch, availableMargin]
	)

	const truncateMaxLeverage = maxLeverage.gte(0)
		? truncateNumbers(maxLeverage, DEFAULT_FIAT_DECIMALS)
		: 10

	const truncateLeverage = useMemo(
		() => truncateNumbers(wei(Number(leverageInput) ?? 0), DEFAULT_FIAT_DECIMALS),
		[leverageInput]
	)

	return (
		<LeverageInputWrapper>
			<InputHeaderRow
				disabled={isDisabled}
				label={
					<LeverageTitle>
						{t('futures.market.trade.input.leverage.title')}&nbsp; —
						<LeverageTitleSpan>&nbsp; Up to {truncateMaxLeverage}x</LeverageTitleSpan>
					</LeverageTitle>
				}
				rightElement={<ModeButton mode={mode} setMode={setMode} />}
			/>

			{mode === 'slider' ? (
				<SliderRow>
					<LeverageSlider
						disabled={isDisabled}
						minValue={0}
						maxValue={Number(truncateMaxLeverage)}
						value={Number(truncateLeverage)}
						onChange={(_, newValue) => {
							onLeverageChange(newValue.toString())
						}}
					/>
				</SliderRow>
			) : (
				<LeverageInputContainer>
					<NumericInput
						data-testid="leverage-input"
						value={leverageInput}
						placeholder="1"
						suffix="x"
						max={maxLeverage.toNumber()}
						onChange={(_, newValue) => {
							onLeverageChange(newValue)
						}}
						disabled={isDisabled}
						maxLength={4}
					/>
					{leverageButtons.map((l) => (
						<LeverageButton
							key={l}
							mono
							disabled={isDisabled}
							variant="flat"
							onClick={() => {
								onLeverageChange(l)
							}}
						>
							{l}x
						</LeverageButton>
					))}
				</LeverageInputContainer>
			)}
		</LeverageInputWrapper>
	)
})

const LeverageInputWrapper = styled(FlexDivCol)`
	margin-bottom: 16px;
`

const LeverageTitle = styled(InputTitle)`
	text-transform: capitalize;
`

const LeverageTitleSpan = styled(InputTitleSpan)`
	text-transform: none;
`

const SliderRow = styled(FlexDivRow)`
	margin-top: 8px;
	margin-bottom: 14px;
	position: relative;
`

const LeverageInputContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 45px 45px 45px 45px;
	grid-gap: 12px;
	align-items: center;
`

const LeverageButton = styled(Button)`
	padding: 0;
	font-size: 13px;
	height: 38px;
	font-family: ${(props) => props.theme.fonts.monoBold};
`

export default LeverageInput
