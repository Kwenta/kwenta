import React from 'react';
import { useRecoilValue } from 'recoil';

import useGetCrossMarginAccountOverview from 'queries/futures/useGetCrossMarginAccountOverview';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesOpenOrders from 'queries/futures/useGetFuturesOpenOrders';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesPositionForMarkets from 'queries/futures/useGetFuturesPositionForMarkets';
import useGetFuturesPotentialTradeDetails from 'queries/futures/useGetFuturesPotentialTradeDetails';
import useSynthBalances from 'queries/synths/useSynthBalances';
import { walletAddressState } from 'store/wallet';
import { futuresAccountState } from 'store/futures';

type RefetchType =
	| 'modify-position'
	| 'new-order'
	| 'close-position'
	| 'margin-change'
	| 'account-margin-change';

type RefetchContextType = {
	handleRefetch: (refetchType: RefetchType, timeout?: number) => void;
};

const RefetchContext = React.createContext<RefetchContextType>({
	handleRefetch: () => {},
});

export const RefetchProvider: React.FC = ({ children }) => {
	const { selectedFuturesAddress } = useRecoilValue(futuresAccountState);
	const synthsBalancesQuery = useSynthBalances(selectedFuturesAddress);
	const openOrdersQuery = useGetFuturesOpenOrders();
	const positionQuery = useGetFuturesPositionForMarket();
	const crossMarginAccountOverview = useGetCrossMarginAccountOverview();
	const positionsQuery = useGetFuturesPositionForMarkets();
	const marketsQuery = useGetFuturesMarkets();

	useGetFuturesPotentialTradeDetails();

	const handleRefetch = (refetchType: RefetchType, timeout?: number) => {
		setTimeout(() => {
			switch (refetchType) {
				case 'modify-position':
					marketsQuery.refetch();
					openOrdersQuery.refetch();
					crossMarginAccountOverview.refetch();
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
				case 'account-margin-change':
					crossMarginAccountOverview.refetch();
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
