import { AsyncThunkAction } from '@reduxjs/toolkit';
import { useCallback, useEffect, useRef } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import Connector from 'containers/Connector';

import type { AppDispatch, RootState } from './store';

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// TODO: explore potentially move polling to the sdk and register listeners from the app
// The sdk would only poll when there are registered listeners

export const useStartPollingAction = () => {
	const intervalRefs = useRef<Record<string, number>>({});
	const dispatch = useAppDispatch();

	const startPolling = useCallback(
		(id: string, action: () => AsyncThunkAction<any, any, any>, intervalTime = 20000) => {
			if (intervalRefs.current[id]) {
				clearInterval(intervalRefs.current[id]);
			}
			dispatch(action());
			const interval = setInterval(() => {
				dispatch(action());
			}, intervalTime);

			intervalRefs.current[id] = interval;
		},
		[dispatch]
	);

	useEffect(() => {
		const refs = intervalRefs.current;
		return () => {
			Object.values(refs).forEach((i) => {
				clearInterval(i);
			});
		};
	}, []);

	return startPolling;
};

// This hook will wait until provider is ready before beginning to poll

export const usePollWhenReady = (
	id: string,
	action: () => AsyncThunkAction<any, any, any>,
	intervalTime = 20000
) => {
	const { providerReady } = Connector.useContainer();
	const startPolling = useStartPollingAction();

	useEffect(() => {
		startPolling(id, action, intervalTime);
		// eslint-disable-next-line
	}, [providerReady]);
};

// TODO: Revisit this

// export function usePolledRefetch() {
// 	// TODO: Replace with redux
// 	const futuresAccount = useRecoilValue(futuresAccountState);
// 	const cmAccount = useAppSelector(selectCrossMarginBalanceInfo);

// 	const refetchCMAccountOverview = useCallback(() => {
// 		if (!futuresAccount?.crossMarginAddress)
// 			return { freeMargin: '0', keeperEthBal: '0', allowance: '0' };
// 		const existingMargin = cmAccount.freeMargin.toString();
// 		return refetchWithComparator(
// 			() => sdk.futures.getCrossMarginBalanceInfo(futuresAccount.crossMarginAddress!),
// 			existingMargin,
// 			(a, b) => {
// 				return a?.freeMargin?.toString() === existingMargin;
// 			}
// 		);
// 	}, [
// 		futuresAccount?.crossMarginAddress,
// 		cmAccount.freeMargin,
// 		sdk.futures.getCrossMarginBalanceInfo,
// 	]);

// 	const handleRefetch = useCallback(
// 		(event: string) => {
// 			switch (event) {
// 				case 'cm-margin-changed':
// 					refetchCMAccountOverview();
// 			}
// 		},
// 		[refetchCMAccountOverview]
// 	);

// 	return handleRefetch;
// }
