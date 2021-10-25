import Trades from 'sections/futures/Trades';
import useGetFuturesAllPositionHistory from 'queries/futures/useGetFuturesAllPositionHistory';

const AllAssetsTradeHistory = () => {
	const futuresPositionHistoryQuery = useGetFuturesAllPositionHistory();
	const positionHistory = futuresPositionHistoryQuery?.data ?? null;

	return (
		<Trades
			history={positionHistory}
			isLoading={futuresPositionHistoryQuery.isLoading}
			isLoaded={futuresPositionHistoryQuery.isFetched}
		/>
	);
};
export default AllAssetsTradeHistory;
