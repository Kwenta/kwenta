import { AsyncThunkAction } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './store';

export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const usePollAction = (
	action: () => AsyncThunkAction<any, any, any>,
	intervalTime = 20000
) => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(action());
		const interval = setInterval(() => {
			dispatch(action());
		}, intervalTime);
		return () => {
			clearInterval(interval);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch]);
};
