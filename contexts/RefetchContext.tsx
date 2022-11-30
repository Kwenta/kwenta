import React from 'react';
import { useRecoilValue } from 'recoil';

import useGetCrossMarginSettings from 'queries/futures/useGetCrossMarginSettings';
import useGetFuturesOpenOrders from 'queries/futures/useGetFuturesOpenOrders';
import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesPositionHistory';
import useQueryCrossMarginAccount from 'queries/futures/useQueryCrossMarginAccount';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import useSynthBalances from 'queries/synths/useSynthBalances';
import { fetchCrossMarginBalanceInfo, fetchFuturesPositionsForType } from 'state/futures/actions';
import { useAppDispatch } from 'state/hooks';
import { futuresAccountState, futuresAccountTypeState } from 'store/futures';
import { refetchWithComparator } from 'utils/queries';

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
	const dispatch = useAppDispatch();

	const synthsBalancesQuery = useSynthBalances();
	const openOrdersQuery = useGetFuturesOpenOrders();
	const positionHistoryQuery = useGetFuturesPositionHistory();
	const queryCrossMarginAccount = useQueryCrossMarginAccount();

	useLaggedDailyPrice();
	useGetCrossMarginSettings();

	const handleRefetch = (refetchType: RefetchType, timeout?: number) => {
		setTimeout(() => {
			switch (refetchType) {
				case 'modify-position':
					openOrdersQuery.refetch();
					positionHistoryQuery.refetch();
					dispatch(fetchFuturesPositionsForType());
					if (selectedAccountType === 'cross_margin') {
						dispatch(fetchCrossMarginBalanceInfo());
					}
					break;
				case 'new-order':
					dispatch(fetchFuturesPositionsForType());
					openOrdersQuery.refetch();
					break;
				case 'close-position':
					dispatch(fetchFuturesPositionsForType());
					positionHistoryQuery.refetch();
					openOrdersQuery.refetch();
					break;
				case 'margin-change':
					dispatch(fetchFuturesPositionsForType());
					positionHistoryQuery.refetch();
					openOrdersQuery.refetch();
					synthsBalancesQuery.refetch();
					break;
				case 'account-margin-change':
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

export const useRefetchContext = () => {
	return React.useContext(RefetchContext);
};

export default RefetchContext;
