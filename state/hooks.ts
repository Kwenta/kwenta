import { AsyncThunkAction } from '@reduxjs/toolkit';
import { useCallback, useEffect, useRef } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import Connector from 'containers/Connector';

import type { AppDispatch, RootState } from './store';

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

const activePolls: Record<string, number> = {};

const onPollRemoved = (id: string) => {
	if (activePolls[id]) {
		activePolls[id] = activePolls[id] - 1;
	}
};

// TODO: explore potentially move polling to the sdk and register listeners from the app
// The sdk would only poll when there are registered listeners

export const useStartPollingAction = () => {
	const intervalRefs = useRef<Record<string, number>>({});
	const dispatch = useAppDispatch();

	const startPolling = useCallback(
		(id: string, action: () => AsyncThunkAction<any, any, any>, intervalTime = 20000) => {
			if (intervalRefs.current[id]) {
				clearInterval(intervalRefs.current[id]);
				onPollRemoved(id);
			}
			dispatch(action());
			activePolls[id] = activePolls[id] ? activePolls[id] + 1 : 1;
			if (activePolls[id] > 1) {
				// eslint-disable-next-line
				console.warn('There are multiple polling processes for ', id);
			}
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
			Object.keys(refs).forEach((id) => {
				const ref = refs[id];
				clearInterval(ref);
				onPollRemoved(id);
			});
		};
	}, []);

	return startPolling;
};

const DEFAULT_INTERVAL = 20000;

// This hook will wait until provider is ready before beginning to poll

export const usePollAction = (
	actionName: string,
	action: () => AsyncThunkAction<any, any, any>,
	options?: { dependencies?: any[]; disabled?: boolean; intervalTime?: number }
) => {
	const { providerReady } = Connector.useContainer();
	const startPolling = useStartPollingAction();

	useEffect(() => {
		if (!options?.disabled && providerReady) {
			startPolling(actionName, action, options?.intervalTime || DEFAULT_INTERVAL);
		}
		// eslint-disable-next-line
	}, [providerReady, options?.disabled, ...(options?.dependencies || [])]);
};

// This hook will wait until provider is ready before making a fetch

export const useFetchAction = (
	action: () => AsyncThunkAction<any, any, any>,
	options?: { changeKeys?: any[]; disabled?: boolean }
) => {
	const { providerReady } = Connector.useContainer();
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (!options?.disabled && providerReady) {
			dispatch(action());
		}
		// eslint-disable-next-line
	}, [providerReady, options?.disabled, ...(options?.changeKeys || [])]);
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
