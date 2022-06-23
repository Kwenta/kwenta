import styled from 'styled-components';
import { DEFAULT_NUMBER_OF_TRADES } from 'constants/defaults';
import TradesHistoryTable from './TradesHistoryTable';
import SkewInfo from './SkewInfo';
import FutureMarketDetailsTab from './FuturesMarketTabs';

const TradingHistory: React.FC = () => {
	return (
		<Panel>
			<SkewInfo />
			<FutureMarketDetailsTab></FutureMarketDetailsTab>
			<TradesHistoryTable numberOfTrades={DEFAULT_NUMBER_OF_TRADES} />
		</Panel>
	);
};

export default TradingHistory;

const Panel = styled.div`
	height: 100%;
	padding-bottom: 48px;
`;
