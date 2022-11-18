import React, { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import useGetAverageFundingRateForMarkets from 'queries/futures/useGetAverageFundingRateForMarkets';
import useGetCrossMarginAccountOverview from 'queries/futures/useGetCrossMarginAccountOverview';
import useGetCrossMarginSettings from 'queries/futures/useGetCrossMarginSettings';
import useGetFuturesMarkets from 'queries/futures/useGetFuturesMarkets';
import useGetFuturesOpenOrders from 'queries/futures/useGetFuturesOpenOrders';
import useGetFuturesPositionForMarket from 'queries/futures/useGetFuturesPositionForMarket';
import useGetFuturesPositionForMarkets from 'queries/futures/useGetFuturesPositionForMarkets';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesPositionHistory';
import useGetFuturesVolumes from 'queries/futures/useGetFuturesVolumes';
import useQueryCrossMarginAccount from 'queries/futures/useQueryCrossMarginAccount';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import useSynthBalances from 'queries/synths/useSynthBalances';
import { Period } from 'sdk/constants/period';
import { futuresAccountState, futuresAccountTypeState, positionState } from 'store/futures';
import logError from 'utils/logError';

type RefetchType =
	| 'modify-position'
	| 'new-order'
	| 'close-position'
	| 'margin-change'
	| 'account-margin-change'
	| 'cross-margin-account-change';

type RefetchUntilType =
	| 'wallet-balance-change'
	| 'cross-margin-account-change'
	| 'account-margin-change';

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
	const { crossMarginAddress } = useRecoilValue(futuresAccountState);
	const setPosition = useSetRecoilState(positionState);

	const synthsBalancesQuery = useSynthBalances();
	const openOrdersQuery = useGetFuturesOpenOrders();
	const positionQuery = useGetFuturesPositionForMarket();
	const crossMarginAccountOverview = useGetCrossMarginAccountOverview();
	const positionsQuery = useGetFuturesPositionForMarkets();
	const positionHistoryQuery = useGetFuturesPositionHistory();
	const marketsQuery = useGetFuturesMarkets();
	const queryCrossMarginAccount = useQueryCrossMarginAccount();

	useGetAverageFundingRateForMarkets(Period.ONE_HOUR);
	useLaggedDailyPrice();
	useGetFuturesVolumes({ refetchInterval: 60000 });
	useGetCrossMarginSettings();

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
					positionsQuery.refetch();
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
					queryCrossMarginAccount();
					break;
			}
		}, timeout ?? 5000);
	};

	const refetchUntilUpdate = async (refetchType: RefetchUntilType) => {
		switch (refetchType) {
			case 'account-margin-change':
				return Promise.all([
					refetchWithComparator(
						crossMarginAccountOverview.refetch,
						crossMarginAccountOverview,
						(prev, next) =>
							!next.data ||
							prev?.data?.freeMargin?.toString() === next?.data?.freeMargin?.toString()
					),
					refetchWithComparator(
						synthsBalancesQuery.refetch,
						synthsBalancesQuery,
						(prev, next) =>
							!next.data ||
							prev?.data.susdWalletBalance?.toString() === next?.data.susdWalletBalance?.toString()
					),
				]);
			case 'cross-margin-account-change':
				return refetchWithComparator(
					queryCrossMarginAccount,
					crossMarginAddress,
					(prev, next) => !next || prev === next
				);
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
	query: () => Promise<any>,
	existingResult: any,
	comparator: (previous: any, current: any) => boolean,
	interval = 1000,
	max = 25
) => {
	return new Promise((res) => {
		let count = 1;

		const refetch = async (existingResult: any) => {
			const timeout = setTimeout(async () => {
				if (count > max) {
					clearTimeout(timeout);
					logError('refetch timeout');
					res({ data: null, status: 'timeout' });
				} else {
					const next = await query();
					count += 1;
					if (!comparator(existingResult, next)) {
						clearTimeout(timeout);
						res({ data: next, status: 'complete' });
					} else {
						refetch(next);
					}
				}
			}, interval);
		};
		refetch(existingResult);
	});
};

export const useRefetchContext = () => {
	return React.useContext(RefetchContext);
};

export default RefetchContext;
