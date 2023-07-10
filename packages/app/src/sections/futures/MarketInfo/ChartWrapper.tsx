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
		<Container $showHistory={showHistory}>
			<div className="charts-container">
				<PositionChart display={selectedChart === 'price'} />
				<FundingChart display={selectedChart === 'funding'} />
			</div>
			<TradesHistoryTable display={showHistory} />
		</Container>
	)
}

const Container = styled.div<{ $showHistory: boolean }>`
	display: flex;
	height: 100%;
	overflow: hidden;

	.charts-container {
		width: ${(props) => (props.$showHistory ? 'calc(100% - 300px)' : '100%')};
	}
`

export default ChartWrapper
