import Trades from 'sections/futures/Trades';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesPositionHistory';

const AllAssetsTradeHistory = () => {
	//  TODO need some more work around our hooks if we want to support history for all assets
	const futuresPositionHistoryQuery = useGetFuturesPositionHistory('sBTC');
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
