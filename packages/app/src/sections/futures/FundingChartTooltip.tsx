import { formatPercent } from '@kwenta/sdk/utils'
import { wei } from '@synthetixio/wei'
import { format } from 'date-fns'
import { FC } from 'react'
import styled from 'styled-components'

import { FlexDiv } from 'components/layout/flex'
import { Body, NumericValue } from 'components/Text'
import { ETH_UNIT } from 'constants/network'

export const parseFundingRate = (value: number) => {
	return wei(value).div(ETH_UNIT).div(24)
}

export const formatFundingRate = (value: number) => {
	const parsed = parseFundingRate(value)

	return parsed.eq(0) ? '0%' : formatPercent(parsed, { minDecimals: 6 })
}

type FundingChartTooltipProps = {
	active?: boolean
	payload?: {
		value: number
		payload: {
			timestamp: number
			fundingRate: number
		}
	}[]
}

const formatTooltipDate = (date: number) => format(date, 'HH:mm,MM/dd')

const FundingChartTooltip: FC<FundingChartTooltipProps> = ({ active, payload }) => {
	if (active && payload && payload.length) {
		const { value, payload: p } = payload[0]
		const parsedValue = parseFundingRate(value)
		const percent = formatFundingRate(value)

		return (
			<FundingChartTooltipContainer>
				<Body color="secondary">
					Time:{'  '}
					<Body color="secondary" as="span" mono>
						{formatTooltipDate(p.timestamp)}
					</Body>
				</Body>
				<FlexDiv style={{ justifyContent: 'space-between' }}>
					<NumericValue value={parsedValue} colored mono={false}>
						Rate:
					</NumericValue>
					<NumericValue colored value={parsedValue}>
						{' '}
						{percent}
					</NumericValue>
				</FlexDiv>
			</FundingChartTooltipContainer>
		)
	}

	return null
}

const FundingChartTooltipContainer = styled.div`
	padding: 10px;
	border-radius: 8px;
	border: 1px solid
		${(props) => props.theme.colors.selectedTheme.newTheme.fundingChart.tooltip.border};
	background-color: ${(props) =>
		props.theme.colors.selectedTheme.newTheme.fundingChart.tooltip.background};
`

export default FundingChartTooltip
