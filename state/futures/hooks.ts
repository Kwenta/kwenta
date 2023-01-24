import { useAppSelector, useFetchAction, usePollAction } from 'state/hooks';
import { fetchStakingData } from 'state/staking/actions';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';

import {
	fetchCrossMarginAccount,
	fetchCrossMarginAccountData,
	fetchCrossMarginSettings,
	fetchFuturesPositionHistory,
	fetchFundingRates,
	fetchIsolatedMarginAccountData,
	fetchMarkets,
	fetchCrossMarginOpenOrders,
	fetchPreviousDayRates,
	fetchSharedFuturesData,
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
		disabled: !wallet || !networkSupportsCrossMargin,
	});

	useFetchAction(fetchCrossMarginSettings, { dependencies: [networkId] });
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
	usePollAction('fetchPreviousDayRates', fetchPreviousDayRates, {
		intervalTime: 60000 * 15,
		dependencies: [markets.length],
		disabled: !markets.length,
	});
	usePollAction('fetchFuturesPositionHistory', fetchFuturesPositionHistory, {
		intervalTime: 15000,
		dependencies: [wallet, crossMarginAddress],
		disabled: !wallet,
	});
	// TODO: Priority to optimise
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

	usePollAction('fetchMarkets', fetchMarkets, { intervalTime: 60000, dependencies: [networkId] });
	usePollAction('fetchFundingRates', fetchFundingRates, {
		intervalTime: 60000,
		disabled: markets.length === 0,
		dependencies: [networkId, markets.length],
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
