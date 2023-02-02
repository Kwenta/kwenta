import { useAppSelector, useFetchAction, usePollAction } from 'state/hooks';
import { fetchStakingData } from 'state/staking/actions';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';

import {
	fetchCrossMarginAccount,
	fetchCrossMarginAccountData,
	fetchCrossMarginSettings,
	fetchFuturesPositionHistory,
	fetchIsolatedMarginAccountData,
	fetchCrossMarginOpenOrders,
	fetchSharedFuturesData,
	fetchIsolatedOpenOrders,
} from './actions';
import {
	selectCrossMarginAccount,
	selectCrossMarginSupportedNetwork,
	selectFuturesSupportedNetwork,
	selectFuturesType,
	selectMarkets,
} from './selectors';

// TODO: Optimise polling and queries

export const usePollMarketFuturesData = () => {
	const networkId = useAppSelector(selectNetwork);
	const markets = useAppSelector(selectMarkets);
	const wallet = useAppSelector(selectWallet);
	const crossMarginAddress = useAppSelector(selectCrossMarginAccount);
	const selectedAccountType = useAppSelector(selectFuturesType);
	const networkSupportsCrossMargin = useAppSelector(selectCrossMarginSupportedNetwork);
	const networkSupportsFutures = useAppSelector(selectFuturesSupportedNetwork);

	useFetchAction(fetchCrossMarginAccount, {
		dependencies: [networkId, wallet],
		disabled: !wallet || !networkSupportsCrossMargin || selectedAccountType === 'isolated_margin',
	});

	useFetchAction(fetchCrossMarginSettings, {
		dependencies: [networkId],
		disabled: !networkSupportsCrossMargin || selectedAccountType === 'isolated_margin',
	});
	useFetchAction(fetchStakingData, { dependencies: [networkId, wallet] });
	usePollAction('fetchSharedFuturesData', fetchSharedFuturesData, {
		dependencies: [networkId],
		intervalTime: 60000,
		disabled: !networkSupportsFutures,
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
	usePollAction('fetchFuturesPositionHistory', fetchFuturesPositionHistory, {
		intervalTime: 15000,
		dependencies: [wallet, crossMarginAddress],
		disabled: !wallet,
	});
	usePollAction('fetchIsolatedOpenOrders', fetchIsolatedOpenOrders, {
		dependencies: [networkId, wallet, markets.length],
		intervalTime: 10000,
		disabled: !wallet || selectedAccountType === 'cross_margin',
	});

	usePollAction('fetchCrossMarginOpenOrders', fetchCrossMarginOpenOrders, {
		dependencies: [networkId, wallet, markets.length],
		intervalTime: 20000,
		disabled: !wallet || selectedAccountType === 'isolated_margin',
	});
};

export const usePollDashboardFuturesData = () => {
	const networkId = useAppSelector(selectNetwork);
	const markets = useAppSelector(selectMarkets);
	const wallet = useAppSelector(selectWallet);
	const crossMarginAddress = useAppSelector(selectCrossMarginAccount);
	const networkSupportsCrossMargin = useAppSelector(selectCrossMarginSupportedNetwork);

	useFetchAction(fetchCrossMarginAccount, {
		dependencies: [networkId, wallet],
		disabled: !wallet || !networkSupportsCrossMargin,
	});

	usePollAction('fetchSharedFuturesData', fetchSharedFuturesData, {
		dependencies: [networkId],
		intervalTime: 60000,
	});

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
