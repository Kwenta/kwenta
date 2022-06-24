import styled from 'styled-components';
import SkewInfo from './SkewInfo';
import FutureMarketDetailsTab from './FuturesMarketTabs';

const TradingHistory: React.FC = () => {
	return (
		<Panel>
			<SkewInfo />
			<FutureMarketDetailsTab></FutureMarketDetailsTab>
		</Panel>
	);
};

export default TradingHistory;

const Panel = styled.div`
	height: 100%;
	padding-bottom: 48px;
`;
