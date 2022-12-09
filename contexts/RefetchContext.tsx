import React from 'react';
import { useRecoilValue } from 'recoil';

import useGetFuturesPositionHistory from 'queries/futures/useGetFuturesPositionHistory';
import useQueryCrossMarginAccount from 'queries/futures/useQueryCrossMarginAccount';
import useLaggedDailyPrice from 'queries/rates/useLaggedDailyPrice';
import { fetchBalances } from 'state/balances/actions';
import {
	fetchCrossMarginBalanceInfo,
	fetchFuturesPositionsForType,
	fetchOpenOrders,
} from 'state/futures/actions';
import { selectFuturesType } from 'state/futures/selectors';
import { useAppDispatch, useAppSelector } from 'state/hooks';
import { futuresAccountState } from 'store/futures';
import { refetchWithComparator } from 'utils/queries';

type RefetchType =
	| 'modify-position'
	| 'new-order'
	| 'close-position'
	| 'margin-change'
	| 'account-margin-change'
	| 'cross-margin-account-change';

type RefetchUntilType = 'cross-margin-account-change';

type RefetchContextType = {
	handleRefetch: (refetchType: RefetchType, timeout?: number) => void;
	refetchUntilUpdate: (refetchType: RefetchUntilType) => Promise<any>;
};

const RefetchContext = React.createContext<RefetchContextType>({
	handleRefetch: () => {},
	refetchUntilUpdate: () => Promise.resolve(),
});

export const RefetchProvider: React.FC = ({ children }) => {
	const selectedAccountType = useAppSelector(selectFuturesType);
	const { crossMarginAddress } = useRecoilValue(futuresAccountState);
	const dispatch = useAppDispatch();

	const positionHistoryQuery = useGetFuturesPositionHistory();
	const queryCrossMarginAccount = useQueryCrossMarginAccount();

	useLaggedDailyPrice();

	const handleRefetch = (refetchType: RefetchType, timeout?: number) => {
		setTimeout(() => {
			switch (refetchType) {
				case 'modify-position':
					dispatch(fetchOpenOrders());
					positionHistoryQuery.refetch();
					dispatch(fetchFuturesPositionsForType());
					if (selectedAccountType === 'cross_margin') {
						dispatch(fetchCrossMarginBalanceInfo());
					}
					break;
				case 'new-order':
					dispatch(fetchFuturesPositionsForType());
					dispatch(fetchOpenOrders());
					break;
				case 'close-position':
					dispatch(fetchFuturesPositionsForType());
					positionHistoryQuery.refetch();
					dispatch(fetchOpenOrders());
					break;
				case 'margin-change':
					dispatch(fetchFuturesPositionsForType());
					positionHistoryQuery.refetch();
					dispatch(fetchBalances());
					break;
				case 'account-margin-change':
					dispatch(fetchBalances());
					break;
				case 'cross-margin-account-change':
					queryCrossMarginAccount();
					break;
			}
		}, timeout ?? 5000);
	};

	const refetchUntilUpdate = async (refetchType: RefetchUntilType) => {
		switch (refetchType) {
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
