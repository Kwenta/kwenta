import { formatChartTime } from '@kwenta/sdk/utils'
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
import { selectMarketAsset } from 'state/futures/selectors'
import { useAppSelector, usePollAction } from 'state/hooks'

import FundingChartTooltip, { formatFundingRate } from './FundingChartTooltip'

type FundingChartProps = {
	display?: boolean
}

const FundingChart: FC<FundingChartProps> = ({ display = true }) => {
	const theme = useTheme()
	const marketAsset = useAppSelector(selectMarketAsset)
	const historicalFundingRates = useAppSelector(
		({ smartMargin }) => smartMargin.historicalFundingRates
	)

	usePollAction('fetchFundingRatesHistory', () => fetchFundingRatesHistory(marketAsset), {
		dependencies: [marketAsset],
		intervalTime: 60 * 60 * 1000,
	})

	return (
		<FundingChartContainer $display={display} minWidth={1} minHeight={1}>
			<LineChart
				data={historicalFundingRates[marketAsset]}
				margin={{
					top: 30,
					right: 50,
					left: 30,
					bottom: 15,
				}}
			>
				<YAxis dataKey="fundingRate" domain={['auto', 0]} tickFormatter={formatFundingRate} />
				<XAxis
					dataKey="timestamp"
					type="number"
					scale="time"
					tickFormatter={formatChartTime}
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
	)
}

const FundingChartContainer = styled(ResponsiveContainer)<{ $display: boolean }>`
	flex: 1;
	${(props) =>
		!props.$display &&
		css`
			display: none;
		`}
`

export default FundingChart
