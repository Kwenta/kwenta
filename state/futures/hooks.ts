import { useRecoilValue } from 'recoil';

import { useAppSelector, useFetchAction, usePollAction } from 'state/hooks';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';
import { futuresAccountTypeState } from 'store/futures';

import {
	fetchCrossMarginAccountData,
	fetchCrossMarginSettings,
	fetchIsolatedMarginAccountData,
	fetchMarkets,
	fetchOpenOrders,
	fetchSharedFuturesData,
} from './actions';
import { selectCrossMarginAccount, selectMarkets } from './selectors';

// TODO: Optimise polling and queries

export const usePollMarketFuturesData = () => {
	const networkId = useAppSelector(selectNetwork);
	const markets = useAppSelector(selectMarkets);
	const wallet = useAppSelector(selectWallet);
	const crossMarginAddress = useAppSelector(selectCrossMarginAccount);
	const selectedAccountType = useRecoilValue(futuresAccountTypeState);

	useFetchAction(fetchCrossMarginSettings, { changeKeys: [networkId] });
	usePollAction('fetchSharedFuturesData', fetchSharedFuturesData, {
		dependencies: [networkId],
		intervalTime: 60000,
	});
	usePollAction('fetchIsolatedMarginAccountData', fetchIsolatedMarginAccountData, {
		intervalTime: 30000,
		dependencies: [wallet, markets.length],
		disabled: !wallet || !markets.length || selectedAccountType === 'cross_margin',
	});
	usePollAction('fetchCrossMarginAccountData', fetchCrossMarginAccountData, {
		intervalTime: 30000,
		dependencies: [markets.length, crossMarginAddress],
		disabled: !markets.length || !crossMarginAddress || selectedAccountType === 'isolated_margin',
	});
	// TODO: Priority to optimise
	usePollAction('fetchOpenOrders', fetchOpenOrders, {
		dependencies: [networkId, wallet],
		intervalTime: 10000,
		disabled: !wallet,
	});
};

export const usePollDashboardFuturesData = () => {
	const networkId = useAppSelector(selectNetwork);
	const markets = useAppSelector(selectMarkets);
	const wallet = useAppSelector(selectWallet);
	const crossMarginAddress = useAppSelector(selectCrossMarginAccount);

	usePollAction('fetchMarkets', fetchMarkets, { intervalTime: 60000, dependencies: [networkId] });
	usePollAction('fetchIsolatedMarginAccountData', fetchIsolatedMarginAccountData, {
		intervalTime: 30000,
		dependencies: [wallet, markets.length, networkId],
		disabled: !markets.length || !wallet,
	});
	usePollAction('fetchCrossMarginAccountData', fetchCrossMarginAccountData, {
		intervalTime: 30000,
		dependencies: [wallet, markets.length, networkId, crossMarginAddress],
		disabled: !markets.length || !crossMarginAddress,
	});
};
