import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import Connector from 'containers/Connector';
import { useAppSelector, useStartPollingAction } from 'state/hooks';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';
import { futuresAccountTypeState } from 'store/futures';

import {
	fetchCrossMarginAccountData,
	fetchIsolatedMarginPositions,
	fetchSharedFuturesData,
} from './actions';
import { selectCrossMarginAccount, selectMarkets } from './selectors';

export const usePollFuturesData = () => {
	const startPolling = useStartPollingAction();

	const networkId = useAppSelector(selectNetwork);
	const markets = useAppSelector(selectMarkets);
	const wallet = useAppSelector(selectWallet);
	const crossMarginAddress = useAppSelector(selectCrossMarginAccount);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);

	const { providerReady } = Connector.useContainer();

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
			startPolling('fetchIsolatedMarginPositions', fetchIsolatedMarginPositions, 30000);
		}
		// eslint-disable-next-line
	}, [wallet, markets.length, selectedAccountType, networkId]);

	useEffect(() => {
		// Poll cross margin data
		if (markets.length && wallet && crossMarginAddress) {
			startPolling('fetchCrossMarginAccountData', fetchCrossMarginAccountData, 30000);
		}
		// eslint-disable-next-line
	}, [wallet, markets.length, crossMarginAddress, networkId]);
};
