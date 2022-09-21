import React, { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Period } from 'constants/period';
import useGetAverageFundingRateForMarkets from 'queries/futures/useGetAverageFundingRateForMarkets';
import useGetCrossMarginAccountOverview from 'queries/futures/useGetCrossMarginAccountOverview';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesOpenOrders from 'queries/futures/useGetFuturesOpenOrders';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesPositionForMarkets from 'queries/futures/useGetFuturesPositionForMarkets';
import useGetFuturesVolumes from 'queries/futures/useGetFuturesVolumes';
import useQueryCrossMarginAccount from 'queries/futures/useQueryCrossMarginAccount';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import useSynthBalances from 'queries/synths/useSynthBalances';
import { futuresAccountTypeState, positionState } from 'store/futures';

type RefetchType =
	| 'modify-position'
	| 'new-order'
	| 'close-position'
	| 'margin-change'
	| 'account-margin-change'
	| 'cross-margin-account-change';

type RefetchContextType = {
	handleRefetch: (refetchType: RefetchType, timeout?: number) => void;
};

const RefetchContext = React.createContext<RefetchContextType>({
	handleRefetch: () => {},
});

export const RefetchProvider: React.FC = ({ children }) => {
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const setPosition = useSetRecoilState(positionState);

	const synthsBalancesQuery = useSynthBalances();
	const openOrdersQuery = useGetFuturesOpenOrders();
	const positionQuery = useGetFuturesPositionForMarket();
	const crossMarginAccountOverview = useGetCrossMarginAccountOverview();
	const positionsQuery = useGetFuturesPositionForMarkets();
	const marketsQuery = useGetFuturesMarkets();
	const { queryCrossMarginAccount } = useQueryCrossMarginAccount();

	useExchangeRatesQuery({ refetchInterval: 15000 });
	useGetAverageFundingRateForMarkets(Period.ONE_HOUR);
	useLaggedDailyPrice();
	useGetFuturesVolumes({ refetchInterval: 60000 });

	useEffect(() => {
		if (positionQuery.error) {
			setPosition(null);
		}
	}, [positionQuery.error, setPosition]);

	const handleRefetch = (refetchType: RefetchType, timeout?: number) => {
		setTimeout(() => {
			switch (refetchType) {
				case 'modify-position':
					marketsQuery.refetch();
					openOrdersQuery.refetch();
					positionsQuery.refetch();
					if (selectedAccountType === 'cross_margin') {
						crossMarginAccountOverview.refetch();
					}
					break;
				case 'new-order':
					openOrdersQuery.refetch();
					break;
				case 'close-position':
					positionQuery.refetch();
					openOrdersQuery.refetch();
					positionsQuery.refetch();
					break;
				case 'margin-change':
					positionsQuery.refetch();
					positionQuery.refetch();
					openOrdersQuery.refetch();
					synthsBalancesQuery.refetch();
					break;
				case 'account-margin-change':
					crossMarginAccountOverview.refetch();
					synthsBalancesQuery.refetch();
					break;
				case 'cross-margin-account-change':
					queryCrossMarginAccount();
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
