import { useAppSelector, useFetchAction, usePollAction } from 'state/hooks'
import { fetchStakingData } from 'state/staking/actions'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'

import {
	fetchCrossMarginAccount,
	fetchCrossMarginAccountData,
	fetchFuturesPositionHistory,
	fetchIsolatedMarginAccountData,
	fetchCrossMarginOpenOrders,
	fetchSharedFuturesData,
	fetchIsolatedOpenOrders,
	fetchMarginTransfers,
	fetchAllTradesForAccount,
	fetchCombinedMarginTransfers,
} from './actions'
import {
	selectCrossMarginAccount,
	selectFuturesSupportedNetwork,
	selectFuturesType,
	selectMarkets,
} from './selectors'
import { fetchPerpsV3Account } from 'state/perpsV3/actions'
import { selectPerpsV3SupportedNetwork } from 'state/perpsV3/selectors'

// TODO: Optimise polling and queries

export const usePollMarketFuturesData = () => {
	const networkId = useAppSelector(selectNetwork)
	const markets = useAppSelector(selectMarkets)
	const wallet = useAppSelector(selectWallet)
	const crossMarginAddress = useAppSelector(selectCrossMarginAccount)
	const selectedAccountType = useAppSelector(selectFuturesType)
	const networkSupportsCrossMargin = useAppSelector(selectFuturesSupportedNetwork)
	const networkSupportsFutures = useAppSelector(selectFuturesSupportedNetwork)
	const networkSupportsPerpsV3 = useAppSelector(selectPerpsV3SupportedNetwork)

	useFetchAction(fetchCrossMarginAccount, {
		dependencies: [networkId, wallet],
		disabled: !wallet || !networkSupportsCrossMargin || selectedAccountType !== 'cross_margin',
	})

	useFetchAction(fetchPerpsV3Account, {
		dependencies: [networkId, wallet],
		disabled: !wallet || !networkSupportsPerpsV3 || selectedAccountType !== 'isolated_margin', // TODO: Change to perps v3
	})

	useFetchAction(fetchStakingData, { dependencies: [networkId, wallet] })
	useFetchAction(fetchMarginTransfers, { dependencies: [networkId, wallet, selectedAccountType] })
	usePollAction('fetchSharedFuturesData', fetchSharedFuturesData, {
		dependencies: [networkId],
		intervalTime: 60000,
		disabled: !networkSupportsFutures,
	})
	usePollAction('fetchIsolatedMarginAccountData', fetchIsolatedMarginAccountData, {
		intervalTime: 30000,
		dependencies: [wallet, markets.length],
		disabled: !wallet || !markets.length || selectedAccountType !== 'isolated_margin',
	})
	usePollAction('fetchCrossMarginAccountData', fetchCrossMarginAccountData, {
		intervalTime: 30000,
		dependencies: [markets.length, crossMarginAddress],
		disabled: !markets.length || !crossMarginAddress || selectedAccountType !== 'cross_margin',
	})
	usePollAction('fetchFuturesPositionHistory', fetchFuturesPositionHistory, {
		intervalTime: 15000,
		dependencies: [wallet, crossMarginAddress],
		disabled: !wallet,
	})
	usePollAction('fetchIsolatedOpenOrders', fetchIsolatedOpenOrders, {
		dependencies: [networkId, wallet, markets.length, selectedAccountType],
		intervalTime: 10000,
		disabled: !wallet || selectedAccountType !== 'isolated_margin',
	})

	usePollAction('fetchCrossMarginOpenOrders', fetchCrossMarginOpenOrders, {
		dependencies: [networkId, wallet, markets.length, crossMarginAddress],
		intervalTime: 10000,
		disabled: !wallet || selectedAccountType !== 'cross_margin',
	})

	usePollAction('fetchAllTradesForAccount', fetchAllTradesForAccount, {
		dependencies: [networkId, wallet, crossMarginAddress, selectedAccountType],
		intervalTime: 30000,
		disabled: !wallet,
	})
}

export const usePollDashboardFuturesData = () => {
	const networkId = useAppSelector(selectNetwork)
	const markets = useAppSelector(selectMarkets)
	const wallet = useAppSelector(selectWallet)
	const crossMarginAddress = useAppSelector(selectCrossMarginAccount)
	const networkSupportsCrossMargin = useAppSelector(selectFuturesSupportedNetwork)
	const selectedAccountType = useAppSelector(selectFuturesType)

	useFetchAction(fetchCombinedMarginTransfers, {
		dependencies: [networkId, wallet],
		disabled: !wallet,
	})

	useFetchAction(fetchCrossMarginAccount, {
		dependencies: [networkId, wallet],
		disabled: !wallet || !networkSupportsCrossMargin || selectedAccountType === 'isolated_margin',
	})

	usePollAction('fetchSharedFuturesData', fetchSharedFuturesData, {
		dependencies: [networkId],
		intervalTime: 60000,
	})

	usePollAction('fetchIsolatedMarginAccountData', fetchIsolatedMarginAccountData, {
		intervalTime: 30000,
		dependencies: [wallet, markets.length, networkId],
		disabled: !markets.length || !wallet,
	})
	usePollAction('fetchCrossMarginAccountData', fetchCrossMarginAccountData, {
		intervalTime: 30000,
		dependencies: [wallet, markets.length, networkId, crossMarginAddress],
		disabled: !markets.length || !crossMarginAddress,
	})
	usePollAction('fetchAllTradesForAccount', fetchAllTradesForAccount, {
		dependencies: [networkId, wallet, selectedAccountType, crossMarginAddress],
		intervalTime: 30000,
		disabled: !wallet,
	})
}
