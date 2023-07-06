import styled from 'styled-components'

import { selectShowHistory } from 'state/futures/selectors'
import { useAppSelector } from 'state/hooks'

import FundingChart from '../FundingChart'
import PositionChart from '../PositionChart'
import TradesHistoryTable from '../TradingHistory/TradesHistoryTable'

const ChartWrapper = () => {
	const showHistory = useAppSelector(selectShowHistory)
	const selectedChart = useAppSelector(({ futures }) => futures.selectedChart)

	return (
		<Container>
			<div className="charts-container">
				<PositionChart display={selectedChart === 'price'} />
				<FundingChart display={selectedChart === 'funding'} />
			</div>
			<TradesHistoryTable display={showHistory} />
		</Container>
	)
}

const Container = styled.div`
	display: flex;
	height: 100%;
	overflow: hidden;

	.charts-container {
		display: flex;
		flex: 1;
	}
`

export default ChartWrapper
