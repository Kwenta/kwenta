import { FuturesMarginType } from '@kwenta/sdk/types'

import { SWAP_DEPOSIT_TRADE_ENABLED } from 'constants/ui'
import {
	fetchCrossMarginAccountData,
	fetchCrossMarginMarketData,
	fetchCrossMarginOpenOrders,
	fetchCrossMarginPositions,
	fetchPerpsV3Account,
} from 'state/futures/crossMargin/actions'
import {
	selectCrossMarginAccount,
	selectCrossMarginSupportedNetwork,
} from 'state/futures/crossMargin/selectors'
import { useAppSelector, useFetchAction, usePollAction } from 'state/hooks'
import {
	fetchAllReferralData,
	fetchBoostNftForAccount,
	fetchBoostNftMinted,
} from 'state/referrals/action'
import { fetchStakeMigrateData } from 'state/staking/actions'
import {
	selectSelectedEpoch,
	selectStakingSupportedNetwork,
	selectTradingRewardsSupportedNetwork,
} from 'state/staking/selectors'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'

import { fetchFuturesPositionHistory, fetchMarginTransfers } from './actions'
import { selectFuturesType } from './common/selectors'
import { selectMarkets } from './selectors'
import {
	fetchAllV2TradesForAccount,
	fetchFuturesFees,
	fetchFuturesFeesForAccount,
	fetchSmartMarginAccount,
	fetchSmartMarginAccountData,
	fetchSmartMarginMarketData,
	fetchSmartMarginOpenOrders,
	fetchSwapDepositBalanceQuote,
} from './smartMargin/actions'
import {
	selectSmartMarginAccount,
	selectSmartMarginSupportedNetwork,
	selectSelectedSwapDepositToken,
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
	const swapDepositToken = useAppSelector(selectSelectedSwapDepositToken)
	const networkSupportTradingRewards = useAppSelector(selectTradingRewardsSupportedNetwork)

	useFetchAction(fetchBoostNftMinted, {
		dependencies: [wallet],
		disabled: !networkSupportTradingRewards,
	})

	useFetchAction(fetchBoostNftForAccount, {
		dependencies: [wallet],
		disabled: !networkSupportTradingRewards,
	})

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

	useFetchAction(fetchMarginTransfers, { dependencies: [networkId, wallet, selectedAccountType] })

	usePollAction('fetchSmartMarginMarketData', fetchSmartMarginMarketData, {
		dependencies: [networkId],
		intervalTime: 60000,
		disabled: !networkSupportsSmartMargin || selectedAccountType !== FuturesMarginType.SMART_MARGIN,
	})

	usePollAction('fetchCrossMarginMarketData', fetchCrossMarginMarketData, {
		dependencies: [networkId],
		intervalTime: 60000,
		disabled: !networkSupportsCrossMargin || selectedAccountType !== FuturesMarginType.CROSS_MARGIN,
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

	usePollAction('fetchSwapDepositBalanceQuote', fetchSwapDepositBalanceQuote, {
		dependencies: [swapDepositToken, wallet],
		intervalTime: 10 * 60 * 1000,
		disabled: !wallet || !swapDepositToken || !SWAP_DEPOSIT_TRADE_ENABLED,
	})
}

export const usePollDashboardFuturesData = () => {
	const networkId = useAppSelector(selectNetwork)
	const markets = useAppSelector(selectMarkets)
	const wallet = useAppSelector(selectWallet)
	const smartMarginAccount = useAppSelector(selectSmartMarginAccount)
	const networkSupportsCrossMargin = useAppSelector(selectSmartMarginSupportedNetwork)
	const networkSupportsSmartMargin = useAppSelector(selectSmartMarginSupportedNetwork)
	const selectedAccountType = useAppSelector(selectFuturesType)

	useFetchAction(fetchMarginTransfers, {
		dependencies: [networkId, wallet],
		disabled: !wallet,
	})

	useFetchAction(fetchSmartMarginAccount, {
		dependencies: [networkId, wallet],
		disabled: !wallet || !networkSupportsCrossMargin,
	})

	usePollAction('fetchSmartMarginMarketData', fetchSmartMarginMarketData, {
		dependencies: [networkId],
		intervalTime: 60000,
		disabled: !networkSupportsSmartMargin,
	})

	usePollAction('fetchCrossMarginMarketData', fetchCrossMarginMarketData, {
		dependencies: [networkId],
		intervalTime: 60000,
		disabled: !networkSupportsCrossMargin,
	})

	usePollAction('fetchSmartMarginAccountData', fetchSmartMarginAccountData, {
		intervalTime: 30000,
		dependencies: [smartMarginAccount, markets.length, networkId],
		disabled: !markets.length || !wallet,
	})

	// TODO: Fetch
	// usePollAction('fetchCrossMarginAccountData', fetchCrossM, {
	// 	intervalTime: 30000,
	// 	dependencies: [wallet, markets.length, networkId, crossMarginAddress],
	// 	disabled: !markets.length || !crossMarginAddress,
	// })
	usePollAction('fetchAllV2TradesForAccount', fetchAllV2TradesForAccount, {
		dependencies: [networkId, wallet, selectedAccountType, smartMarginAccount],
		intervalTime: 30000,
		disabled: !wallet,
	})
}

export const useFetchStakeMigrateData = () => {
	const networkId = useAppSelector(selectNetwork)
	const wallet = useAppSelector(selectWallet)
	const { start, end } = useAppSelector(selectSelectedEpoch)
	const networkSupportsStaking = useAppSelector(selectStakingSupportedNetwork)

	useFetchAction(fetchStakeMigrateData, {
		dependencies: [networkId, wallet],
	})
}

export const useFetchReferralData = () => {
	const networkId = useAppSelector(selectNetwork)
	const wallet = useAppSelector(selectWallet)
	const networkSupportTradingRewards = useAppSelector(selectTradingRewardsSupportedNetwork)

	useFetchAction(fetchAllReferralData, {
		dependencies: [networkId, wallet],
		disabled: !networkSupportTradingRewards,
	})
}
