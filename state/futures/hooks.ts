import { useEffect } from 'react';

import { useAppDispatch } from 'state/hooks';

import { fetchMarkets } from './actions';

export const usePollMarkets = () => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(fetchMarkets());
		const interval = setInterval(() => {
			dispatch(fetchMarkets());
		}, 15000);
		return () => {
			clearInterval(interval);
		};
	}, [dispatch]);
};
