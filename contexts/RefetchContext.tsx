import React, { useEffect } from 'react';
import { UseQueryResult } from 'react-query';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Period } from 'constants/period';
import useGetAverageFundingRateForMarkets from 'queries/futures/useGetAverageFundingRateForMarkets';
import useGetCrossMarginAccountOverview from 'queries/futures/useGetCrossMarginAccountOverview';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesOpenOrders from 'queries/futures/useGetFuturesOpenOrders';
import useGetFuturesPositionForAccount from 'queries/futures/useGetFuturesPositionForAccount';
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

type RefetchUntilType = 'wallet-balance-change' | 'cross-margin-account-change';

type RefetchContextType = {
	handleRefetch: (refetchType: RefetchType, timeout?: number) => void;
	refetchUntilUpdate: (refetchType: RefetchUntilType) => Promise<any>;
};

const RefetchContext = React.createContext<RefetchContextType>({
	handleRefetch: () => {},
	refetchUntilUpdate: () => Promise.resolve(),
});

export const RefetchProvider: React.FC = ({ children }) => {
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);
	const setPosition = useSetRecoilState(positionState);

	const synthsBalancesQuery = useSynthBalances();
	const openOrdersQuery = useGetFuturesOpenOrders();
	const positionQuery = useGetFuturesPositionForMarket();
	const crossMarginAccountOverview = useGetCrossMarginAccountOverview();
	const positionsQuery = useGetFuturesPositionForMarkets();
	const positionHistoryQuery = useGetFuturesPositionForAccount();
	const marketsQuery = useGetFuturesMarkets();
	const crossMarginAccountQuery = useQueryCrossMarginAccount();

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
					positionHistoryQuery.refetch();
					if (selectedAccountType === 'cross_margin') {
						crossMarginAccountOverview.refetch();
					}
					break;
				case 'new-order':
					positionsQuery.refetch();
					openOrdersQuery.refetch();
					break;
				case 'close-position':
					positionQuery.refetch();
					positionHistoryQuery.refetch();
					openOrdersQuery.refetch();
					break;
				case 'margin-change':
					positionQuery.refetch();
					positionsQuery.refetch();
					positionHistoryQuery.refetch();
					openOrdersQuery.refetch();
					synthsBalancesQuery.refetch();
					break;
				case 'account-margin-change':
					crossMarginAccountOverview.refetch();
					synthsBalancesQuery.refetch();
					break;
				case 'cross-margin-account-change':
					crossMarginAccountQuery.refetch();
					break;
			}
		}, timeout ?? 5000);
	};

	const refetchUntilUpdate = async (refetchType: RefetchUntilType) => {
		switch (refetchType) {
			case 'cross-margin-account-change':
				return refetchWithComparator(crossMarginAccountQuery, (prev, next) => {
					return !next || prev === next;
				});
			case 'wallet-balance-change':
				return refetchWithComparator(synthsBalancesQuery, (prev, next) => {
					return !next || prev?.susdWalletBalance === next?.susdWalletBalance;
				});
		}
	};

	return (
		<RefetchContext.Provider value={{ handleRefetch, refetchUntilUpdate }}>
			{children}
		</RefetchContext.Provider>
	);
};

// Takes a comparitor which should return a bool condition to
// signal to continue retrying, comparing prev and new query result

const refetchWithComparator = async (
	query: UseQueryResult<any>,
	comparator: (previous: any, current: any) => boolean,
	interval = 1000,
	max = 20
) => {
	const prev = query?.data;

	return new Promise((res, rej) => {
		let count = 1;

		const refetch = async () => {
			const timeout = setTimeout(async () => {
				if (count > max) {
					clearTimeout(timeout);
					rej(new Error('Refetch timed out'));
				} else {
					const cur = query?.data || null;
					const next = await query.refetch();

					count += 1;
					if (!comparator(prev, next.data)) {
						clearTimeout(timeout);
						res(cur);
					} else {
						refetch();
					}
				}
			}, interval);
		};
		refetch();
	});
};

export const useRefetchContext = () => {
	return React.useContext(RefetchContext);
};

export default RefetchContext;
