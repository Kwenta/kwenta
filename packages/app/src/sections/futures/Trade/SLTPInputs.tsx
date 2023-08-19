import { suggestedDecimals } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'

import Button from 'components/Button'
import InputHeaderRow from 'components/Input/InputHeaderRow'
import InputTitle from 'components/Input/InputTitle'
import { FlexDivRow } from 'components/layout/flex'
import { StyledCaretDownIcon } from 'components/Select'
import SelectorButtons from 'components/SelectorButtons'
import Spacer from 'components/Spacer'
import { selectAckedOrdersWarning } from 'state/app/selectors'
import { selectMarketIndexPrice } from 'state/futures/common/selectors'
import {
	selectLeverageInput,
	selectLeverageSide,
	selectTradePanelSLValidity,
} from 'state/futures/selectors'
import {
	setSmartMarginTradeStopLoss,
	setSmartMarginTradeTakeProfit,
} from 'state/futures/smartMargin/reducer'
import { selectSlTpTradeInputs } from 'state/futures/smartMargin/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

import OrderAcknowledgement from './OrderAcknowledgement'
import SLTPInputField from './SLTPInputField'

const TP_OPTIONS = ['5%', '10%', '25%', '50%', '100%']
const SL_OPTIONS = ['2%', '5%', '10%', '20%', '50%']

export default function SLTPInputs() {
	const dispatch = useAppDispatch()
	const { takeProfitPrice, stopLossPrice } = useAppSelector(selectSlTpTradeInputs)
	const currentPrice = useAppSelector(selectMarketIndexPrice)
	const leverageSide = useAppSelector(selectLeverageSide)
	const leverage = useAppSelector(selectLeverageInput)
	const hideWarning = useAppSelector(selectAckedOrdersWarning)
	const slValidity = useSelector(selectTradePanelSLValidity)

	const [showInputs, setShowInputs] = useState(false)
	const [showOrderWarning, setShowOrderWarning] = useState(false)

	useEffect(() => {
		if (hideWarning) return
		if (showInputs) {
			setShowOrderWarning(true)
		} else {
			setShowOrderWarning(false)
		}
	}, [showInputs, hideWarning])

	const leverageWei = useMemo(() => {
		return leverage && Number(leverage) > 0 ? wei(leverage) : wei(1)
	}, [leverage])

	const onSelectStopLossPercent = useCallback(
		(index: number) => {
			const option = SL_OPTIONS[index]
			const percent = Math.abs(Number(option.replace('%', ''))) / 100
			const relativePercent = wei(percent).div(leverageWei)
			const stopLoss =
				leverageSide === 'short'
					? currentPrice.add(currentPrice.mul(relativePercent))
					: currentPrice.sub(currentPrice.mul(relativePercent))
			const dp = suggestedDecimals(stopLoss)
			dispatch(setSmartMarginTradeStopLoss(stopLoss.toString(dp)))
		},
		[currentPrice, dispatch, leverageSide, leverageWei]
	)

	const onSelectTakeProfit = useCallback(
		(index: number) => {
			const option = TP_OPTIONS[index]
			const percent = Math.abs(Number(option.replace('%', ''))) / 100
			const relativePercent = wei(percent).div(leverageWei)
			const takeProfit =
				leverageSide === 'short'
					? currentPrice.sub(currentPrice.mul(relativePercent))
					: currentPrice.add(currentPrice.mul(relativePercent))
			const dp = suggestedDecimals(takeProfit)
			dispatch(setSmartMarginTradeTakeProfit(takeProfit.toString(dp)))
		},
		[currentPrice, dispatch, leverageSide, leverageWei]
	)

	const onChangeStopLoss = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(setSmartMarginTradeStopLoss(v))
		},
		[dispatch]
	)

	const onChangeTakeProfit = useCallback(
		(_: ChangeEvent<HTMLInputElement>, v: string) => {
			dispatch(setSmartMarginTradeTakeProfit(v))
		},
		[dispatch]
	)

	const tpInvalid = useMemo(() => {
		if (leverageSide === 'long') {
			return !!takeProfitPrice && wei(takeProfitPrice || 0).lt(currentPrice)
		} else {
			return !!takeProfitPrice && wei(takeProfitPrice || 0).gt(currentPrice)
		}
	}, [takeProfitPrice, currentPrice, leverageSide])

	return (
		<Container>
			<ExpandRow onClick={() => setShowInputs(!showInputs)}>
				<InputTitle margin="1px 0 0 0">Stop Loss / Take Profit</InputTitle>
				<Button
					data-testid="expand-sl-tp-button"
					style={{
						height: '20px',
						borderRadius: '4px',
						padding: '3px 5px',
					}}
				>
					<StyledCaretDownIcon style={{ transform: [{ rotateY: '180deg' }] }} $flip={showInputs} />
				</Button>
			</ExpandRow>
			{showInputs ? (
				showOrderWarning ? (
					<WarningContainer>
						<OrderAcknowledgement onClick={() => setShowOrderWarning(false)} />
					</WarningContainer>
				) : (
					<InputsContainer>
						<Spacer height={6} />

						<InputHeaderRow
							label="SL"
							rightElement={
								<SelectorButtons options={SL_OPTIONS} onSelect={onSelectStopLossPercent} />
							}
						/>

						<SLTPInputField
							invalid={slValidity.invalid}
							value={stopLossPrice}
							type={'stop-loss'}
							minMaxPrice={slValidity.minMaxStopPrice}
							currentPrice={currentPrice}
							positionSide={leverageSide}
							leverage={leverageWei}
							dataTestId={'trade-panel-stop-loss-input'}
							onChange={onChangeStopLoss}
						/>

						<Spacer height={12} />

						<InputHeaderRow
							label="TP"
							rightElement={<SelectorButtons options={TP_OPTIONS} onSelect={onSelectTakeProfit} />}
						/>

						<SLTPInputField
							invalid={tpInvalid}
							value={takeProfitPrice}
							type={'take-profit'}
							currentPrice={currentPrice}
							positionSide={leverageSide}
							leverage={leverageWei}
							dataTestId={'trade-panel-take-profit-input'}
							onChange={onChangeTakeProfit}
						/>
					</InputsContainer>
				)
			) : null}
		</Container>
	)
}

const Container = styled.div`
	padding: 10px;
	background: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.containers.secondary.background};
	border: ${(props) => props.theme.colors.selectedTheme.border};
	border-radius: 8px;
	margin-bottom: 16px;
`

const ExpandRow = styled(FlexDivRow)`
	padding: 0px 2px 0 4px;
	cursor: pointer;
	align-items: center;
`

const InputsContainer = styled.div`
	padding: 4px;
`

const WarningContainer = styled.div`
	padding: 10px 0;
`
