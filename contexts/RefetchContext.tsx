import React from 'react';
import useSynthetixQueries from '@synthetixio/queries';

import useGetFuturesOpenOrders from 'queries/futures/useGetFuturesOpenOrders';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesMarketPositionHistory from 'queries/futures/useGetFuturesMarketPositionHistory';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import useGetFuturesMarket from 'queries/futures/useGetFuturesMarket';

type RefetchType = 'modify-position' | 'new-order' | 'close-position' | 'margin-change';

type RefetchContextType = {
	handleRefetch: (refetchType: RefetchType, timeout?: number) => void;
};

const RefetchContext = React.createContext<RefetchContextType>({
	handleRefetch: () => {},
});

export const RefetchProvider: React.FC = ({ children }) => {
	const { useSynthsBalancesQuery } = useSynthetixQueries();
	const walletAddress = useRecoilValue(walletAddressState);

	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const openOrdersQuery = useGetFuturesOpenOrders();
	const positionQuery = useGetFuturesPositionForMarket();
	const positionHistoryQuery = useGetFuturesMarketPositionHistory();
	const marketQuery = useGetFuturesMarket();

	const handleRefetch = (refetchType: RefetchType, timeout?: number) => {
		setTimeout(() => {
			switch (refetchType) {
				case 'modify-position':
					marketQuery.refetch();
					positionHistoryQuery.refetch();
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
					positionQuery.refetch();
					openOrdersQuery.refetch();
					positionHistoryQuery.refetch();
					synthsBalancesQuery.refetch();
					break;
			}
		}, timeout ?? 5000);
	};

	return <RefetchContext.Provider value={{ handleRefetch }}>{children}</RefetchContext.Provider>;
};

export default RefetchContext;
