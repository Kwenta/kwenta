import styled from 'styled-components';
import FuturesMarketTabs from '../FuturesMarketTabs';
import SkewInfo from '../TradingHistory/SkewInfo';

const TradingHistory: React.FC = () => {
	return (
		<Panel>
			<SkewInfo />
			<FuturesMarketTabs />
		</Panel>
	);
};

export default TradingHistory;

const Panel = styled.div`
	height: 100%;
	padding-bottom: 48px;
`;
