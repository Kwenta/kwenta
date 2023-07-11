import { PERIOD_DISPLAY, Period } from '@kwenta/sdk/constants'
import { useCallback } from 'react'
import styled from 'styled-components'

import { Body } from 'components/Text'
import { ToggleButton } from 'components/TextToggle'
import { setHistoricalFundingRatePeriod } from 'state/futures/reducer'
import { selectHistoricalFundingRatePeriod } from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

const PERIOD_OPTIONS = [Period.TWO_WEEKS, Period.ONE_MONTH, Period.THREE_MONTHS]

const FundingPeriodToggle = () => {
	const period = useAppSelector(selectHistoricalFundingRatePeriod)
	const dispatch = useAppDispatch()

	const handlePeriodChange = useCallback(
		(period: Period) => () => {
			dispatch(setHistoricalFundingRatePeriod(period))
		},
		[dispatch]
	)

	return (
		<PeriodToggleContainer>
			<Body>Time Range:</Body>
			<PeriodOptions>
				{PERIOD_OPTIONS.map((value) => (
					<ToggleButton key={value} $active={value === period} onClick={handlePeriodChange(value)}>
						{PERIOD_DISPLAY[value]}
					</ToggleButton>
				))}
			</PeriodOptions>
		</PeriodToggleContainer>
	)
}

const PeriodToggleContainer = styled.div`
	width: 100%;
	display: flex;
	padding: 15px;
	border-bottom: ${(props) => props.theme.colors.selectedTheme.newTheme.border.style};
`

const PeriodOptions = styled.div`
	display: flex;
	margin-left: 15px;

	& > {
		&:not(:last-of-type) {
			margin-right: 15px;
		}
	}
`

export default FundingPeriodToggle
