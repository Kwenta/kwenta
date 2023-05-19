import styled from 'styled-components';

import { FlexDivRowCentered } from 'components/layout/flex';
import { selectShowHistory } from 'state/futures/selectors';
import { useAppSelector } from 'state/hooks';

import FundingChart from '../FundingChart';
import PositionChart from '../PositionChart';
import TradesHistoryTable from '../TradingHistory/TradesHistoryTable';

const ChartWrapper = () => {
	const showHistory = useAppSelector(selectShowHistory);
	const selectedChart = useAppSelector(({ futures }) => futures.selectedChart);

	return (
		<Container>
			{selectedChart === 'price' ? <PositionChart /> : <FundingChart />}

			{showHistory && <TradesHistoryTable />}
		</Container>
	);
};

const Container = styled(FlexDivRowCentered)`
	height: 100%;
	overflow: hidden;
`;

export default ChartWrapper;
