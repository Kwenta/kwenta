import styled from 'styled-components';
import { DEFAULT_NUMBER_OF_TRADES } from 'constants/defaults';
import TradesHistoryTable from './TradesHistoryTable';
import SkewInfo from './SkewInfo';

type TradeHistoryInfoProps = {
	currencyKey: string | undefined;
};

const TradingHistory: React.FC<TradeHistoryInfoProps> = ({ currencyKey }) => {
	return (
		<Panel>
			<SkewInfo currencyKey={currencyKey} />
			<TradesHistoryTable currencyKey={currencyKey} numberOfTrades={DEFAULT_NUMBER_OF_TRADES} />
		</Panel>
	);
};

export default TradingHistory;

const Panel = styled.div`
	height: 100%;
	padding-bottom: 48px;
`;
