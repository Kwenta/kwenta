import { PERIOD_DISPLAY, Period } from '@kwenta/sdk/constants'
import { FC } from 'react'
import styled from 'styled-components'

import { setSelectedPortfolioTimeframe } from 'state/futures/reducer'
import { selectSelectedPortfolioTimeframe } from 'state/futures/selectors'
import { useAppDispatch, useAppSelector } from 'state/hooks'

const Container = styled.div`
	background-color: ${(props) => props.theme.colors.selectedTheme.button.fill};
	display: flex;
	justify-content: center;
	align-items: baseline;
	padding: 3px 5px;
	gap: 4px;
	border-radius: 100px;
`

const StyledBtn = styled.div<{ isActive: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	width: 43px;
	height: 19px;
	border-radius: 100px;
	background-color: ${(props) =>
		props.isActive ? props.theme.colors.selectedTheme.background : ''};
	color: ${(props) =>
		props.isActive
			? props.theme.colors.selectedTheme.text.value
			: props.theme.colors.selectedTheme.gray2};
	font-family: ${(props) => props.theme.fonts.bold};
	font-size: 11px;
	text-align: center;

	&:hover,
	&:active {
		color: ${(props) => props.theme.colors.selectedTheme.gray};
		cursor: pointer;
	}

	&:before {
		content: unset;
	}
`

const TIMEFRAMES: Period[] = [Period.ONE_WEEK, Period.ONE_MONTH, Period.ONE_YEAR]

export const Timeframe: FC = () => {
	const dispatch = useAppDispatch()
	const selectedTimeframe = useAppSelector(selectSelectedPortfolioTimeframe)

	return (
		<Container>
			{TIMEFRAMES.map((timeframe) => (
				<StyledBtn
					key={PERIOD_DISPLAY[timeframe]}
					onClick={() => dispatch(setSelectedPortfolioTimeframe(timeframe))}
					isActive={selectedTimeframe === timeframe}
				>
					{PERIOD_DISPLAY[timeframe]}
				</StyledBtn>
			))}
		</Container>
	)
}
