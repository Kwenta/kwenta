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
import { selectMarketAsset } from 'state/futures/common/selectors'
import { selectHistoricalFundingRatePeriod } from 'state/futures/selectors'
import { useAppSelector, usePollAction } from 'state/hooks'

import FundingChartTooltip, { formatFundingRate } from './FundingChartTooltip'
import FundingPeriodToggle from './FundingPeriodToggle'

type FundingChartProps = {
	display?: boolean
}

const formatFundingDate = (date: Date | number) => format(date, 'MMM d')

const FundingChart: FC<FundingChartProps> = ({ display }) => {
	const theme = useTheme()
	const marketAsset = useAppSelector(selectMarketAsset)
	const period = useAppSelector(selectHistoricalFundingRatePeriod)
	const historicalFundingRates = useAppSelector(
		({ smartMargin }) => smartMargin.historicalFundingRates
	)

	usePollAction(
		'fetchFundingRatesHistory',
		() => fetchFundingRatesHistory({ marketAsset, period }),
		{ dependencies: [marketAsset, period], intervalTime: 60 * 60 * 1000 }
	)

	return (
		<FundingChartWrapper $display={display}>
			<FundingPeriodToggle />
			<FundingChartContainer>
				<LineChart
					data={historicalFundingRates[marketAsset]}
					margin={{ top: 30, right: 50, left: 30, bottom: 15 }}
				>
					<YAxis
						dataKey="fundingRate"
						domain={['auto', 'auto']}
						tickFormatter={formatFundingRate}
						allowDataOverflow
						tickCount={10}
					/>
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
			</FundingChartContainer>
		</FundingChartWrapper>
	)
}

const FundingChartWrapper = styled.div<{ $display?: boolean }>`
	width: 100%;
	height: calc(100% - 45px);

	${(props) =>
		!props.$display &&
		css`
			display: none;
		`}
`

const FundingChartContainer = styled(ResponsiveContainer)`
	flex: 1;
`

export default FundingChart
