import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';
import { useAppDispatch, useAppSelector, useStartPollingAction } from 'state/hooks';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';
import { futuresAccountTypeState } from 'store/futures';

import {
	fetchCrossMarginAccountData,
	fetchCrossMarginSettings,
	fetchIsolatedMarginAccountData,
	fetchSharedFuturesData,
} from './actions';
import { selectCrossMarginAccount, selectMarkets } from './selectors';

export const usePollFuturesData = () => {
	const startPolling = useStartPollingAction();
	const dispatch = useAppDispatch();
	const networkId = useAppSelector(selectNetwork);
	const markets = useAppSelector(selectMarkets);
	const wallet = useAppSelector(selectWallet);
	const crossMarginAddress = useAppSelector(selectCrossMarginAccount);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);

	const { providerReady } = Connector.useContainer();

	useEffect(() => {
		if (providerReady) dispatch(fetchCrossMarginSettings());
	}, [providerReady, networkId, dispatch]);

	useEffect(() => {
		// Poll shared futures data
		if (providerReady) {
			startPolling('fetchSharedFuturesData', fetchSharedFuturesData, 60000);
		}
		// eslint-disable-next-line
	}, [providerReady, networkId]);

	useEffect(() => {
		// Poll isolated margin data
		if (markets.length && wallet && selectedAccountType === 'isolated_margin') {
			startPolling('fetchIsolatedMarginAccountData', fetchIsolatedMarginAccountData, 30000);
		}
		// eslint-disable-next-line
	}, [wallet, markets.length, selectedAccountType, networkId]);

	useEffect(() => {
		// Poll cross margin data
		if (markets.length && wallet && crossMarginAddress && selectedAccountType === 'cross_margin') {
			startPolling('fetchCrossMarginAccountData', fetchCrossMarginAccountData, 30000);
		}
		// eslint-disable-next-line
	}, [wallet, markets.length, crossMarginAddress, networkId, selectedAccountType]);
};
