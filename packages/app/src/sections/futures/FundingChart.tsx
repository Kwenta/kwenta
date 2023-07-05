import format from 'date-fns/format'
import { FC } from 'react'
import {
	LineChart,
	XAxis,
	Line,
	ResponsiveContainer,
	YAxis,
	Tooltip,
	ReferenceLine,
} from 'recharts'
import styled, { css } from 'styled-components'
import { useTheme } from 'styled-components'

import { fetchFundingRatesHistory } from 'state/futures/actions'
import { selectHistoricalFundingRatePeriod, selectMarketAsset } from 'state/futures/selectors'
import { useAppSelector, usePollAction } from 'state/hooks'

import FundingChartTooltip, { formatFundingRate } from './FundingChartTooltip'
import FundingPeriodToggle from './FundingPeriodToggle'

type FundingChartProps = {
	display?: boolean
}

const formatFundingDate = (date: Date | number) => format(date, 'MMM d')

const FundingChart: FC<FundingChartProps> = ({ display = true }) => {
	const theme = useTheme()
	const marketAsset = useAppSelector(selectMarketAsset)
	const period = useAppSelector(selectHistoricalFundingRatePeriod)
	const historicalFundingRates = useAppSelector(({ futures }) => futures.historicalFundingRates)

	usePollAction(
		'fetchFundingRatesHistory',
		() => fetchFundingRatesHistory({ marketAsset, period }),
		{ dependencies: [marketAsset, period], intervalTime: 60 * 60 * 1000 }
	)

	return (
		<FundingChartWrapper $display={display}>
			<FundingPeriodToggle />
			<FundingChartContainer>
				<ResponsiveContainer minWidth={1} minHeight={1} height="100%" width="100%">
					<LineChart
						data={historicalFundingRates[marketAsset]}
						margin={{ top: 30, right: 50, left: 30, bottom: 15 }}
					>
						<YAxis dataKey="fundingRate" domain={['auto', 0]} tickFormatter={formatFundingRate} />
						<XAxis
							dataKey="timestamp"
							type="number"
							scale="time"
							tickFormatter={formatFundingDate}
							minTickGap={75}
							domain={['dataMin', 'dataMax']}
						/>
						<Tooltip
							content={<FundingChartTooltip />}
							formatter={(x) => formatFundingRate(x as any)}
							isAnimationActive={false}
						/>
						<ReferenceLine y={0} stroke={theme.colors.selectedTheme.text.body} />
						<Line
							type="monotone"
							dataKey="fundingRate"
							stroke={theme.colors.selectedTheme.text.value}
							strokeWidth={1}
							strokeLinecap="square"
							dot={false}
							isAnimationActive={false}
						/>
					</LineChart>
				</ResponsiveContainer>
			</FundingChartContainer>
		</FundingChartWrapper>
	)
}

const FundingChartWrapper = styled.div<{ $display: boolean }>`
	display: flex;
	flex-direction: column;
	height: 100%;
	width: 100%;

	${(props) =>
		!props.$display &&
		css`
			display: none;
		`}
`

const FundingChartContainer = styled.div`
	flex: 1;
`

export default FundingChart
