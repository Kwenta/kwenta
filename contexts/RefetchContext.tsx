import React from 'react';

import { Period, PERIOD_IN_SECONDS } from 'constants/period';
import useGetAverageFundingRateForMarkets from 'queries/futures/useGetAverageFundingRateForMarkets';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesOpenOrders from 'queries/futures/useGetFuturesOpenOrders';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesPositionForMarkets from 'queries/futures/useGetFuturesPositionForMarkets';
import useGetFuturesPotentialTradeDetails from 'queries/futures/useGetFuturesPotentialTradeDetails';
import useSynthBalances from 'queries/synths/useSynthBalances';

type RefetchType = 'modify-position' | 'new-order' | 'close-position' | 'margin-change';

type RefetchContextType = {
	handleRefetch: (refetchType: RefetchType, timeout?: number) => void;
};

const RefetchContext = React.createContext<RefetchContextType>({
	handleRefetch: () => {},
});

export const RefetchProvider: React.FC = ({ children }) => {
	const synthsBalancesQuery = useSynthBalances();
	const openOrdersQuery = useGetFuturesOpenOrders();
	const positionQuery = useGetFuturesPositionForMarket();
	const positionsQuery = useGetFuturesPositionForMarkets();
	const marketsQuery = useGetFuturesMarkets();
	useGetFuturesPotentialTradeDetails();
	useGetAverageFundingRateForMarkets(PERIOD_IN_SECONDS[Period.ONE_HOUR]);

	const handleRefetch = (refetchType: RefetchType, timeout?: number) => {
		setTimeout(() => {
			switch (refetchType) {
				case 'modify-position':
					marketsQuery.refetch();
					openOrdersQuery.refetch();
					break;
				case 'new-order':
					openOrdersQuery.refetch();
					break;
				case 'close-position':
					positionQuery.refetch();
					openOrdersQuery.refetch();
					break;
				case 'margin-change':
					positionsQuery.refetch();
					positionQuery.refetch();
					openOrdersQuery.refetch();
					synthsBalancesQuery.refetch();
					break;
			}
		}, timeout ?? 5000);
	};

	return <RefetchContext.Provider value={{ handleRefetch }}>{children}</RefetchContext.Provider>;
};

export const useRefetchContext = () => {
	return React.useContext(RefetchContext);
};

export default RefetchContext;
