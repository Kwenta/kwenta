import { FuturesMarginType } from '@kwenta/sdk/types'

import {
	fetchCrossMarginAccountData,
	fetchCrossMarginOpenOrders,
	fetchCrossMarginPositions,
	fetchPerpsV3Account,
} from 'state/futures/crossMargin/actions'
import {
	selectCrossMarginAccount,
	selectCrossMarginSupportedNetwork,
} from 'state/futures/crossMargin/selectors'
import { useAppSelector, useFetchAction, usePollAction } from 'state/hooks'
import { fetchStakingData } from 'state/staking/actions'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'

import {
	fetchFuturesPositionHistory,
	fetchSharedFuturesData,
	fetchMarginTransfers,
} from './actions'
import { selectFuturesType, selectMarkets } from './selectors'
import {
	fetchAllV2TradesForAccount,
	fetchSmartMarginAccount,
	fetchSmartMarginAccountData,
	fetchSmartMarginOpenOrders,
} from './smartMargin/actions'
import {
	selectSmartMarginAccount,
	selectSmartMarginSupportedNetwork,
} from './smartMargin/selectors'

// TODO: Optimise polling and queries

export const usePollMarketFuturesData = () => {
	const networkId = useAppSelector(selectNetwork)
	const markets = useAppSelector(selectMarkets)
	const wallet = useAppSelector(selectWallet)
	const smartMarginAddress = useAppSelector(selectSmartMarginAccount)
	const crossMarginAccount = useAppSelector(selectCrossMarginAccount)

	const selectedAccountType = useAppSelector(selectFuturesType)
	const networkSupportsSmartMargin = useAppSelector(selectSmartMarginSupportedNetwork)
	const networkSupportsCrossMargin = useAppSelector(selectCrossMarginSupportedNetwork)

	useFetchAction(fetchSmartMarginAccount, {
		dependencies: [networkId, wallet, selectedAccountType],
		disabled:
			!wallet ||
			!networkSupportsSmartMargin ||
			selectedAccountType !== FuturesMarginType.SMART_MARGIN,
	})

	useFetchAction(fetchPerpsV3Account, {
		dependencies: [networkId, wallet, selectedAccountType],
		disabled:
			!wallet ||
			!networkSupportsCrossMargin ||
			selectedAccountType !== FuturesMarginType.CROSS_MARGIN,
	})

	useFetchAction(fetchStakingData, { dependencies: [networkId, wallet] })
	useFetchAction(fetchMarginTransfers, { dependencies: [networkId, wallet, selectedAccountType] })
	usePollAction('fetchSharedFuturesData', fetchSharedFuturesData, {
		dependencies: [networkId],
		intervalTime: 60000,
		disabled: !networkSupportsSmartMargin,
	})
	usePollAction('fetchCrossMarginPositions', fetchCrossMarginPositions, {
		intervalTime: 30000,
		dependencies: [wallet, markets.length],
		disabled: !wallet || !markets.length || selectedAccountType !== FuturesMarginType.CROSS_MARGIN,
	})
	usePollAction('fetchSmartMarginAccountData', fetchSmartMarginAccountData, {
		intervalTime: 30000,
		dependencies: [markets.length, smartMarginAddress],
		disabled:
			!markets.length ||
			!smartMarginAddress ||
			selectedAccountType !== FuturesMarginType.SMART_MARGIN,
	})
	usePollAction('fetchCrossMarginAccountData', fetchCrossMarginAccountData, {
		intervalTime: 30000,
		dependencies: [markets.length, crossMarginAccount],
		disabled:
			!markets.length ||
			!crossMarginAccount ||
			selectedAccountType !== FuturesMarginType.CROSS_MARGIN,
	})
	usePollAction('fetchFuturesPositionHistory', fetchFuturesPositionHistory, {
		intervalTime: 15000,
		dependencies: [wallet, smartMarginAddress],
		disabled: !wallet,
	})
	usePollAction('fetchCrossMarginOpenOrders', fetchCrossMarginOpenOrders, {
		dependencies: [networkId, wallet, markets.length, selectedAccountType],
		intervalTime: 10000,
		disabled: !wallet || selectedAccountType !== FuturesMarginType.CROSS_MARGIN,
	})

	usePollAction('fetchSmartMarginOpenOrders', fetchSmartMarginOpenOrders, {
		dependencies: [networkId, wallet, markets.length, smartMarginAddress],
		intervalTime: 10000,
		disabled: !wallet || selectedAccountType !== FuturesMarginType.SMART_MARGIN,
	})

	usePollAction('fetchAllV2TradesForAccount', fetchAllV2TradesForAccount, {
		dependencies: [networkId, wallet, smartMarginAddress, selectedAccountType],
		intervalTime: 30000,
		disabled: !wallet,
	})
}

export const usePollDashboardFuturesData = () => {
	const networkId = useAppSelector(selectNetwork)
	const markets = useAppSelector(selectMarkets)
	const wallet = useAppSelector(selectWallet)
	const crossMarginAddress = useAppSelector(selectSmartMarginAccount)
	const networkSupportsCrossMargin = useAppSelector(selectSmartMarginSupportedNetwork)
	const selectedAccountType = useAppSelector(selectFuturesType)

	useFetchAction(fetchMarginTransfers, {
		dependencies: [networkId, wallet],
		disabled: !wallet,
	})

	useFetchAction(fetchSmartMarginAccount, {
		dependencies: [networkId, wallet],
		disabled:
			!wallet ||
			!networkSupportsCrossMargin ||
			selectedAccountType === FuturesMarginType.CROSS_MARGIN,
	})

	usePollAction('fetchSharedFuturesData', fetchSharedFuturesData, {
		dependencies: [networkId],
		intervalTime: 60000,
	})

	usePollAction('fetchSmartMarginAccountData', fetchSmartMarginAccountData, {
		intervalTime: 30000,
		dependencies: [wallet, markets.length, networkId],
		disabled: !markets.length || !wallet,
	})

	// TODO: Fetch
	// usePollAction('fetchCrossMarginAccountData', fetchCrossM, {
	// 	intervalTime: 30000,
	// 	dependencies: [wallet, markets.length, networkId, crossMarginAddress],
	// 	disabled: !markets.length || !crossMarginAddress,
	// })
	usePollAction('fetchAllV2TradesForAccount', fetchAllV2TradesForAccount, {
		dependencies: [networkId, wallet, selectedAccountType, crossMarginAddress],
		intervalTime: 30000,
		disabled: !wallet,
	})
}
