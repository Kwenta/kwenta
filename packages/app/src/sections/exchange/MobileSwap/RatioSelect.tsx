import { FC, useCallback } from 'react'
import styled, { css } from 'styled-components'

import { setRatio } from 'state/exchange/actions'
import { selectQuoteBalanceWei } from 'state/exchange/selectors'
import type { SwapRatio } from 'state/exchange/types'
import { useAppDispatch, useAppSelector } from 'state/hooks'

const RATIOS: SwapRatio[] = [25, 50, 75, 100]

const RatioSelect: FC = () => {
	const ratio = useAppSelector(({ exchange }) => exchange.ratio)
	const dispatch = useAppDispatch()
	const quoteBalance = useAppSelector(selectQuoteBalanceWei)

	const onRatioChange = useCallback(
		(ratio: SwapRatio) => {
			dispatch(setRatio(ratio))
		},
		[dispatch]
	)

	return (
		<RatioSelectContainer>
			{RATIOS.map((v) => (
				<RatioButton
					key={`ratio-${v}`}
					$selected={ratio === v}
					onClick={() => onRatioChange(v)}
					disabled={quoteBalance.eq(0)}
				>
					{`${v}%`}
				</RatioButton>
			))}
		</RatioSelectContainer>
	)
}

const RatioSelectContainer = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-gap: 1px;
	border-radius: 10px;
	border-top: ${(props) => props.theme.colors.selectedTheme.border};
	border-left: ${(props) => props.theme.colors.selectedTheme.border};
	height: 30px;
	overflow: hidden;
	margin-bottom: 30px;
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.exchange.ratioSelect.background};
`

const RatioButton = styled.button<{ $selected: boolean }>`
	height: 100%;
	border: none;
	border-right: ${(props) => props.theme.colors.selectedTheme.border};
	border-bottom: ${(props) => props.theme.colors.selectedTheme.border};
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 13px;
	color: ${(props) => props.theme.colors.selectedTheme.text.value};
	background-color: transparent;

	${(props) =>
		props.$selected &&
		css`
			color: ${(props) => props.theme.colors.selectedTheme.white};
			background: ${(props) => props.theme.colors.selectedTheme.button.hover};
		`}

	&:first-of-type {
		border-radius: 10px 0 0 10px;
	}

	&:last-of-type {
		border-radius: 0 10px 10px 0;
	}
`

export default RatioSelect
