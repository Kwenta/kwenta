import { ZERO_WEI, PERIOD_IN_SECONDS, Period } from '@kwenta/sdk/constants'
import {
	TransactionStatus,
	PerpsV2Position,
	PositionSide,
	FuturesMarginType,
	FuturesMarket,
} from '@kwenta/sdk/types'
import { truncateTimestamp, MarketKeyByAsset, MarketAssetByKey } from '@kwenta/sdk/utils'
import { createSelector } from '@reduxjs/toolkit'
import Wei, { wei } from '@synthetixio/wei'

import { ETH_UNIT } from 'constants/network'
import {
	selectAllCrossMarginTrades,
	selectCrossMarginAccountData,
	selectCrossMarginAvailableMargin,
	selectCrossMarginMarginTransfers,
	selectCrossMarginMaxLeverage,
	selectCrossMarginPositionHistory,
	selectCrossMarginPositions,
	selectCrossMarginTradeInputs,
	selectMarkPriceInfosV3,
	selectMarkPricesV3,
	selectPendingAsyncOrdersCount,
	selectV3MarketInfo,
	selectV3MarketKey,
	selectV3Markets,
} from 'state/futures/crossMargin/selectors'
import { deserializeWeiObject } from 'state/helpers'
import {
	selectOffchainPricesInfo,
	selectOnChainPricesInfo,
	selectPrices,
} from 'state/prices/selectors'
import { RootState } from 'state/store'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import { getKnownError } from 'utils/formatters/error'
import {
	unserializeFuturesVolumes,
	unserializePositionHistory,
	unserializeTrades,
	unserializeConditionalOrders,
	stopLossValidity,
} from 'utils/futures'

import { selectFuturesState, selectFuturesType, selectMarketAsset } from './common/selectors'
import { CrossPerpsPortfolio } from './crossMargin/types'
import {
	selectIdleMarginTransfers,
	selectMarginDeltaInputValue,
	selectOpenDelayedOrders,
	selectV2Markets,
	selectSmartMarginAccount,
	selectSmartMarginAccountData,
	selectSmartMarginBalanceInfo,
	selectSmartMarginMarginDelta,
	selectTradePreview,
	selectV2MarketInfo,
	selectV2MarketKey,
	selectSmartMarginTradeInputs,
	selectSmartMarginOrderPrice,
	selectMarketIndexPrice,
	selectSmartMarginMaxLeverage,
	selectSlTpTradeInputs,
	selectSlTpModalInputs,
	selectEditPositionModalInfo,
	selectMarkPricesV2,
	selectMarkPriceInfosV2,
	selectSmartMarginPositions,
	selectAllSmartMarginTrades,
} from './smartMargin/selectors'
import { SmartPerpsPortfolio } from './smartMargin/types'
import { FuturesAction, futuresPositionKeys, PortfolioValues } from './types'

export const selectQueryStatuses = createSelector(
	selectFuturesState,
	(state) => state.queryStatuses
)

export const selectMarketsQueryStatus = createSelector(
	selectQueryStatuses,
	(statuses) => statuses.markets
)

export const selectLeverageInput = createSelector(
	selectFuturesState,
	(state) => state.leverageInput
)

export const selectSelectedTrader = (state: RootState) => state.futures.leaderboard.selectedTrader

export const selectShowHistory = (state: RootState) => !!state.futures.preferences.showHistory

export const selectAccountData = createSelector(
	selectFuturesType,
	selectSmartMarginAccountData,
	selectCrossMarginAccountData,
	(type, smartAccountData, crossAccountData) =>
		type === FuturesMarginType.SMART_MARGIN ? smartAccountData : crossAccountData
)

export const selectMarkets = createSelector(
	selectFuturesType,
	selectV2Markets,
	selectV3Markets,
	(futuresType, v2Markets, v3Markets) => {
		return futuresType === FuturesMarginType.CROSS_MARGIN ? v3Markets : v2Markets
	}
)

export const selectMarketVolumes = createSelector(selectFuturesState, (state) =>
	unserializeFuturesVolumes(state.dailyMarketVolumes)
)

export const selectMarketKeys = createSelector(selectMarkets, (markets) =>
	markets.map(({ asset }) => MarketKeyByAsset[asset])
)

export const selectMarketAssets = createSelector(selectMarkets, (markets) =>
	markets.map(({ asset }) => asset)
)

export const selectMarketKey = createSelector(
	selectFuturesType,
	selectV2MarketKey,
	selectV3MarketKey,
	(type, v2Key, v3Key) => (type === FuturesMarginType.CROSS_MARGIN ? v3Key : v2Key)
)

export const selectMarketInfo = createSelector(
	selectFuturesType,
	selectV2MarketInfo,
	selectV3MarketInfo,
	(type, v2MarketInfo, v3MarketInfo) => {
		return type === FuturesMarginType.SMART_MARGIN ? v2MarketInfo : v3MarketInfo
	}
)

export const selectMarketPriceInfo = createSelector(
	selectMarketInfo,
	selectOffchainPricesInfo,
	(marketInfo, pricesInfo) => {
		if (!marketInfo || !pricesInfo[marketInfo.asset]) return
		return pricesInfo[marketInfo.asset]
	}
)

export const selectSkewAdjustedPrice = createSelector(
	selectMarketIndexPrice,
	selectMarketInfo,
	(price, marketInfo) => {
		if (!marketInfo?.marketSkew || !marketInfo?.settings.skewScale) return price
		return price
			? wei(price).mul(wei(marketInfo.marketSkew).div(marketInfo.settings.skewScale).add(1))
			: ZERO_WEI
	}
)

export const selectSkewAdjustedPriceInfo = createSelector(
	selectMarketPriceInfo,
	selectMarketInfo,
	(priceInfo, marketInfo) => {
		if (!marketInfo?.marketSkew || !marketInfo?.settings.skewScale) return priceInfo
		return priceInfo
			? {
					price: wei(priceInfo.price).mul(
						wei(marketInfo.marketSkew).div(marketInfo.settings.skewScale).add(1)
					),
					change: priceInfo?.change,
			  }
			: undefined
	}
)

export const selectMarketPrices = createSelector(
	selectMarketAsset,
	selectPrices,
	(marketAsset, prices) => {
		return prices[marketAsset] ?? {}
	}
)

export const selectMarkPrices = createSelector(
	selectMarkPricesV2,
	selectMarkPricesV3,
	selectFuturesType,
	(v2, v3, type) => {
		return type === FuturesMarginType.CROSS_MARGIN ? v3 : v2
	}
)

export const selectMarkPriceInfos = createSelector(
	selectMarkPriceInfosV2,
	selectMarkPriceInfosV3,
	selectFuturesType,
	(v2, v3, type) => {
		return type === FuturesMarginType.CROSS_MARGIN ? v3 : v2
	}
)

export const selectFuturesAccount = createSelector(
	selectFuturesType,
	selectWallet,
	selectSmartMarginAccount,
	(selectedType, wallet, smartMarginAccount) => {
		return selectedType === FuturesMarginType.SMART_MARGIN ? smartMarginAccount : wallet
	}
)

export const selectAllConditionalOrders = createSelector(
	selectFuturesType,
	selectSmartMarginAccountData,
	selectOnChainPricesInfo,
	(selectedType, account, prices) => {
		if (!account || selectedType !== FuturesMarginType.SMART_MARGIN) return []

		const orders = unserializeConditionalOrders(account.conditionalOrders)
		return orders.map((o) => {
			const price = prices[MarketAssetByKey[o.marketKey]]
			return {
				...o,
				currentPrice: price,
			}
		})
	}
)

export const selectPositionHistory = createSelector(
	selectFuturesType,
	selectSmartMarginAccountData,
	selectCrossMarginPositionHistory,
	(type, smartAccountData, crossPositionHistory) => {
		if (type === FuturesMarginType.CROSS_MARGIN) {
			return crossPositionHistory
		} else {
			return unserializePositionHistory(smartAccountData?.positionHistory ?? [])
		}
	}
)

export const selectSelectedMarketPositionHistory = createSelector(
	selectMarketAsset,
	selectPositionHistory,
	(marketAsset, positionHistory) => {
		return positionHistory.find(({ asset, isOpen }) => isOpen && asset === marketAsset)
	}
)

export const selectPositionHistoryForSelectedTrader = createSelector(
	selectNetwork,
	(state: RootState) => state.futures,
	(networkId, futures) => {
		const { selectedTrader } = futures.leaderboard
		if (!selectedTrader) return []
		const history =
			futures.leaderboard.selectedTraderPositionHistory[networkId]?.[selectedTrader.trader] ?? []
		return unserializePositionHistory(history)
	}
)

export const selectFuturesPositions = createSelector(
	selectSmartMarginPositions,
	selectCrossMarginPositions,
	(state: RootState) => state.futures.selectedType,
	(smartPositions, crossPositions, selectedType) => {
		return selectedType === FuturesMarginType.CROSS_MARGIN ? crossPositions : smartPositions
	}
)

export const selectTotalUnrealizedPnl = createSelector(selectFuturesPositions, (positions) => {
	return positions.reduce((acc, p) => {
		return acc.add(p?.pnl ?? ZERO_WEI)
	}, ZERO_WEI)
})

export const selectSubmittingFuturesTx = createSelector(
	(state: RootState) => state.app,
	(app) => {
		return (
			app.transaction?.status === TransactionStatus.AwaitingExecution ||
			app.transaction?.status === TransactionStatus.Executed
		)
	}
)

export const selectIsClosingPosition = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return (
			(app.transaction?.type === 'close_isolated' ||
				app.transaction?.type === 'close_cross_margin') &&
			submitting
		)
	}
)

export const selectIsSubmittingCrossTransfer = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return (
			(app.transaction?.type === 'deposit_smart_margin' ||
				app.transaction?.type === 'withdraw_smart_margin') &&
			submitting
		)
	}
)

export const selectIsApprovingCrossDeposit = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return app.transaction?.type === 'approve_cross_margin' && submitting
	}
)

export const selectIsSubmittingIsolatedTransfer = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return (
			(app.transaction?.type === 'deposit_isolated' ||
				app.transaction?.type === 'withdraw_isolated') &&
			submitting
		)
	}
)

export const selectIsolatedTransferError = createSelector(
	(state: RootState) => state.app,
	(app) => {
		return (app.transaction?.type === 'deposit_isolated' ||
			app.transaction?.type === 'withdraw_isolated') &&
			app.transaction?.status === TransactionStatus.Failed
			? app.transaction?.error ?? 'Transaction failed'
			: null
	}
)

export const selectIsCancellingOrder = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return app.transaction?.type === 'cancel_delayed_isolated' && submitting
	}
)

export const selectIsExecutingOrder = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.app,
	(submitting, app) => {
		return app.transaction?.type === 'execute_delayed_isolated' && submitting
	}
)

export const selectLeverageSide = createSelector(selectFuturesState, (state) => state.leverageSide)

export const selectIsMarketCapReached = createSelector(
	selectLeverageSide,
	selectMarketInfo,
	selectMarketIndexPrice,
	(leverageSide, marketInfo, marketAssetRate) => {
		const maxMarketValueUSD = marketInfo?.marketLimitUsd ?? wei(0)
		const marketSize = marketInfo?.marketSize ?? wei(0)
		const marketSkew = marketInfo?.marketSkew ?? wei(0)

		return leverageSide === PositionSide.LONG
			? marketSize.add(marketSkew).div('2').abs().mul(marketAssetRate).gte(maxMarketValueUSD)
			: marketSize.sub(marketSkew).div('2').abs().mul(marketAssetRate).gte(maxMarketValueUSD)
	}
)

export const selectPosition = createSelector(
	selectFuturesPositions,
	selectMarketInfo,
	(positions, market) => {
		const position = positions.find((p) => p.market.marketKey === market?.marketKey)
		return position
			? (deserializeWeiObject(position, futuresPositionKeys) as PerpsV2Position)
			: undefined
	}
)

export const selectMaxLeverage = createSelector(
	selectCrossMarginMaxLeverage,
	selectSmartMarginMaxLeverage,
	selectFuturesType,
	(cmMax, smMax, type) => {
		return type === FuturesMarginType.CROSS_MARGIN ? cmMax : smMax
	}
)

export const selectAboveMaxLeverage = createSelector(
	selectMaxLeverage,
	selectPosition,
	(maxLeverage, position) => {
		return position?.position?.leverage && maxLeverage.lt(position.position.leverage)
	}
)

export const selectPlaceOrderTranslationKey = createSelector(
	selectPosition,
	selectSmartMarginMarginDelta,
	selectSmartMarginBalanceInfo,
	selectFuturesType,
	(state: RootState) => state.smartMargin.orderType,
	selectIsMarketCapReached,
	(position, marginDelta, { freeMargin }, selectedType, orderType) => {
		let remainingMargin
		if (selectedType === FuturesMarginType.CROSS_MARGIN) {
			remainingMargin = position?.remainingMargin || ZERO_WEI
		} else {
			remainingMargin = marginDelta
		}

		if (selectedType === FuturesMarginType.SMART_MARGIN)
			return remainingMargin.add(freeMargin).lt('50')
				? 'futures.market.trade.button.deposit-margin-minimum'
				: 'futures.market.trade.button.place-delayed-order'
		if (orderType === 'limit') return 'futures.market.trade.button.place-limit-order'
		if (orderType === 'stop_market') return 'futures.market.trade.button.place-stop-order'
		if (!!position?.position) return 'futures.market.trade.button.modify-position'
		return 'futures.market.trade.button.open-position'
	}
)

export const selectRemainingMarketMargin = createSelector(selectPosition, (position) => {
	if (!position) return ZERO_WEI
	return position.remainingMargin
})

export const selectSelectedInputDenomination = (state: RootState) =>
	state.futures.selectedInputDenomination

export const selectSelectedInputHours = (state: RootState) => state.futures.selectedInputHours

export const selectTradeSizeInputs = createSelector(
	selectFuturesType,
	selectCrossMarginTradeInputs,
	selectSmartMarginTradeInputs,
	(type, crossInputs, smartInputs) => {
		return type === FuturesMarginType.CROSS_MARGIN ? crossInputs : smartInputs
	}
)

export const selectTradePrice = createSelector(
	selectFuturesType,
	selectSmartMarginOrderPrice,
	selectMarketIndexPrice,
	(type, orderPrice, indexPrice) => {
		return type === FuturesMarginType.CROSS_MARGIN ? indexPrice : wei(orderPrice || 0)
	}
)

export const selectTradeSizeInputsDisabled = createSelector(
	selectMarginDeltaInputValue,
	selectFuturesType,
	selectCrossMarginAvailableMargin,
	(marginDeltaInput, selectedAccountType, availableMargin) => {
		const remaining =
			selectedAccountType === FuturesMarginType.CROSS_MARGIN
				? availableMargin || ZERO_WEI
				: wei(marginDeltaInput || 0)
		return remaining.lte(0)
	}
)

export const selectNextPriceDisclaimer = createSelector(
	selectMaxLeverage,
	selectLeverageInput,
	(maxLeverage, leverage) => {
		return wei(leverage || 0).gte(maxLeverage.sub(wei(1))) && wei(leverage || 0).lte(maxLeverage)
	}
)

export const selectFuturesPortfolio = createSelector(
	selectSmartMarginPositions,
	selectCrossMarginPositions,
	selectSmartMarginBalanceInfo,
	(smartPositions, crossPositions, { freeMargin }) => {
		const crossValue =
			crossPositions.reduce((sum, { remainingMargin }) => sum.add(remainingMargin), wei(0)) ??
			wei(0)
		const smartValue =
			smartPositions.reduce((sum, { remainingMargin }) => sum.add(remainingMargin), wei(0)) ??
			wei(0)
		const totalValue = smartValue.add(crossValue).add(freeMargin)

		return {
			total: totalValue,
			smartMargin: smartValue.add(freeMargin),
			crossMargin: crossValue,
		}
	}
)

export const selectSmartMarginTransfers = createSelector(
	selectSmartMarginAccountData,
	(account) => {
		return account?.marginTransfers ?? []
	}
)

export const selectMarginTransfers = createSelector(
	selectFuturesType,
	selectCrossMarginMarginTransfers,
	selectSmartMarginTransfers,
	(state: RootState) => state.futures,
	(type, smTransfers, cmTransfers) => {
		return type === FuturesMarginType.CROSS_MARGIN ? cmTransfers : smTransfers
	}
)

export const selectMarketMarginTransfers = createSelector(
	selectMarginTransfers,
	selectMarketAsset,
	(state: RootState) => state.futures,
	(transfers, asset) => {
		return transfers.filter((o) => o.asset === asset)
	}
)

export const selectModifyPositionError = createSelector(
	(state: RootState) => state.app,
	(app) => {
		return app.transaction?.type === 'modify_isolated' && app.transaction?.error
			? getKnownError(app.transaction.error)
			: null
	}
)

export const selectPendingDelayedOrder = createSelector(
	selectOpenDelayedOrders,
	selectMarketKey,
	(delayedOrders, marketKey) => {
		return delayedOrders.find((o) => o.market.marketKey === marketKey)
	}
)

export const selectOpenInterest = createSelector(selectMarkets, (futuresMarkets) =>
	(futuresMarkets as FuturesMarket[]).reduce(
		(total, { openInterest }) => total.add(openInterest.shortUSD).add(openInterest.longUSD),
		wei(0)
	)
)

export const selectUsersTradesForMarket = createSelector(
	selectFuturesType,
	selectFuturesAccount,
	selectMarketAsset,
	selectSmartMarginAccountData,
	selectCrossMarginAccountData,
	(type, account, asset, smartAccountData, crossAccountData) => {
		let trades
		if (type === FuturesMarginType.SMART_MARGIN) {
			trades = unserializeTrades(smartAccountData?.trades ?? [])
		} else if (account) {
			trades = unserializeTrades(crossAccountData?.trades ?? [])
		}
		return trades?.filter((t) => t.asset === asset) ?? []
	}
)

export const selectAllUsersTrades = createSelector(
	selectCrossMarginAccountData,
	selectSmartMarginAccountData,
	(crossAccountData, smartAccountData) => {
		const allTrades = [...(crossAccountData?.trades ?? []), ...(smartAccountData?.trades ?? [])]
		return unserializeTrades(allTrades)
	}
)

export const selectAllTradesForAccountType = createSelector(
	selectAllCrossMarginTrades,
	selectAllSmartMarginTrades,
	selectFuturesType,
	(crossMarginTrades, smartMarginTrades, accountType) => {
		return accountType === FuturesMarginType.CROSS_MARGIN ? crossMarginTrades : smartMarginTrades
	}
)

export const selectSelectedPortfolioTimeframe = (state: RootState) =>
	state.futures.dashboard.selectedPortfolioTimeframe

export const selectCrossMarginPortfolioValues = createSelector(
	selectAllCrossMarginTrades,
	selectCrossMarginMarginTransfers,
	selectFuturesPortfolio,
	(trades, transfers, portfolioTotal) => {
		const tradeActions = trades.map(({ account, timestamp, asset, margin }) => ({
			account,
			timestamp,
			asset,
			margin: margin.div(ETH_UNIT).toNumber(),
			size: 0,
		}))

		const transferActions = transfers.map(({ account, timestamp, asset, size }) => ({
			account,
			timestamp,
			asset,
			size,
			margin: 0,
		}))

		const actions = [...tradeActions, ...transferActions]
			.filter((action): action is FuturesAction => !!action)
			.sort((a, b) => a.timestamp - b.timestamp)

		const accountHistory = actions.reduce((acc, action) => {
			if (acc.length === 0) {
				const newTotal = action.size !== 0 ? action.size : action.margin
				const lastAction = {
					account: action.account,
					timestamp: action.timestamp,
					assets: {
						[action.asset]: newTotal,
					},
					total: newTotal,
				}
				return [lastAction]
			} else {
				const lastAction = acc[acc.length - 1]
				const newAssets = {
					...lastAction.assets,
					[action.asset]:
						action.size !== 0
							? (lastAction.assets[action.asset] ?? 0) + action.size
							: action.margin,
				}
				const newTotal = Object.entries(newAssets).reduce((acc, asset) => acc + asset[1], 0)

				const newAction = {
					...lastAction,
					timestamp: action.timestamp,
					assets: newAssets,
					total: newTotal,
				}
				const replacePrevious = newAction.timestamp === lastAction.timestamp

				return [...acc.slice(0, acc.length - (replacePrevious ? 1 : 0)), newAction]
			}
		}, [] as CrossPerpsPortfolio[])
		return [
			...accountHistory.map(({ timestamp, total }) => ({ timestamp: timestamp * 1000, total })),
			{
				timestamp: Date.now(),
				total: portfolioTotal.crossMargin.toNumber(),
			},
		]
	}
)

export const selectSmartMarginPortfolioValues = createSelector(
	selectAllSmartMarginTrades,
	selectSmartMarginTransfers,
	selectIdleMarginTransfers,
	selectFuturesPortfolio,
	(trades, transfers, idleTransfers, portfolioTotal) => {
		const tradeActions = trades.map(({ account, timestamp, asset, margin }) => ({
			account,
			timestamp,
			asset,
			margin: margin.div(ETH_UNIT).toNumber(),
			size: 0,
		}))

		const transferActions = transfers.map(({ account, timestamp, asset, size }) => ({
			account,
			timestamp,
			asset,
			size,
			margin: 0,
		}))

		const idleTransferActions = idleTransfers.map(({ account, timestamp, asset, size }) => ({
			account,
			timestamp,
			asset,
			size,
			margin: 0,
		}))

		const actions = [...tradeActions, ...transferActions, ...idleTransferActions]
			.filter((action): action is FuturesAction => !!action)
			.sort((a, b) => a.timestamp - b.timestamp)

		const accountHistory = actions.reduce((acc, action) => {
			if (acc.length === 0) {
				const newTotal = action.size !== 0 ? action.size : action.margin
				const isIdle = action.size !== 0 && !action.asset ? true : false
				const lastAction = isIdle
					? {
							account: action.account,
							timestamp: action.timestamp,
							assets: {},
							idle: newTotal,
							total: newTotal,
					  }
					: {
							account: action.account,
							timestamp: action.timestamp,
							assets: {
								[action.asset]: newTotal,
							},
							idle: 0,
							total: newTotal,
					  }
				return [lastAction]
			} else {
				const lastAction = acc[acc.length - 1]
				const newAssets = !action.asset
					? lastAction.assets
					: {
							...lastAction.assets,
							[action.asset]:
								action.size !== 0
									? (lastAction.assets[action.asset] ?? 0) + action.size
									: action.margin,
					  }
				const newIdle = !action.asset
					? lastAction.idle + action.size
					: lastAction.idle + action.size * -1

				const newTotal =
					Object.entries(newAssets).reduce((acc, asset) => acc + asset[1], 0) + lastAction.idle

				const newAction = {
					...lastAction,
					timestamp: action.timestamp,
					assets: newAssets,
					idle: newIdle,
					total: newTotal,
				}
				const replacePrevious = newAction.timestamp === lastAction.timestamp

				return [...acc.slice(0, acc.length - (replacePrevious ? 1 : 0)), newAction]
			}
		}, [] as SmartPerpsPortfolio[])
		return [
			...accountHistory.map(({ timestamp, total }) => ({ timestamp: timestamp * 1000, total })),
			{
				timestamp: Date.now(),
				total: portfolioTotal.smartMargin.toNumber(),
			},
		]
	}
)

export const selectPortfolioChartData = createSelector(
	selectCrossMarginPortfolioValues,
	selectSmartMarginPortfolioValues,
	selectSelectedPortfolioTimeframe,
	(crossPortfolioValues, smartPortfolioValues, timeframe) => {
		// get the timeframe for interpolation
		const interpolationGap =
			timeframe === Period.ONE_YEAR
				? PERIOD_IN_SECONDS[Period.ONE_DAY]
				: PERIOD_IN_SECONDS[Period.ONE_HOUR] * 6

		const minTimestamp = Date.now() - PERIOD_IN_SECONDS[timeframe] * 1000
		const createPortfolioData = (portfolioValues: PortfolioValues[]) => {
			if (portfolioValues.length === 0) return []
			const filteredPortfolioValues = portfolioValues.filter(
				({ timestamp }) => timestamp >= minTimestamp
			)

			const portfolioData: PortfolioValues[] = []
			for (let i = 0; i < filteredPortfolioValues.length; i++) {
				if (i < filteredPortfolioValues.length - 1) {
					const currentTimestamp = truncateTimestamp(
						filteredPortfolioValues[i].timestamp,
						interpolationGap * 1000
					)
					const nextTimestamp = truncateTimestamp(
						filteredPortfolioValues[i + 1].timestamp,
						interpolationGap * 1000
					)
					const timeDiff = nextTimestamp - currentTimestamp

					if (nextTimestamp !== currentTimestamp) {
						portfolioData.push({
							timestamp: currentTimestamp,
							total: filteredPortfolioValues[i].total,
						})
					}
					if (timeDiff > interpolationGap * 1000) {
						const gapCount = Math.floor(timeDiff / (interpolationGap * 1000)) - 1
						for (let j = 1; j <= gapCount; j++) {
							portfolioData.push({
								timestamp: currentTimestamp + j * interpolationGap * 1000,
								total: filteredPortfolioValues[i].total,
							})
						}
					}
				}
			}
			portfolioData.push(portfolioValues[portfolioValues.length - 1])
			return portfolioData
		}

		const crossPortfolioData = createPortfolioData(crossPortfolioValues)
		const smartPortfolioData = createPortfolioData(smartPortfolioValues)
		return {
			[FuturesMarginType.CROSS_MARGIN]: crossPortfolioData,
			[FuturesMarginType.SMART_MARGIN]: smartPortfolioData,
		}
	}
)

export const selectHasRemainingMargin = createSelector(
	selectPosition,
	selectCrossMarginAvailableMargin,
	selectFuturesType,
	selectSmartMarginBalanceInfo,
	(position, availableMargin, futuresType, balanceInfo) => {
		const posMargin = position?.remainingMargin ?? ZERO_WEI
		return futuresType === FuturesMarginType.SMART_MARGIN
			? balanceInfo.freeMargin.add(posMargin).gt(0)
			: availableMargin.gt(0)
	}
)

export const selectMaxUsdSizeInput = createSelector(
	selectFuturesType,
	selectCrossMarginAvailableMargin,
	selectMaxLeverage,
	selectMarginDeltaInputValue,
	(futuresType, availableMargin, maxLeverage, marginDelta) => {
		const margin =
			futuresType === FuturesMarginType.SMART_MARGIN ? marginDelta || 0 : availableMargin
		return maxLeverage.mul(margin)
	}
)

export const selectAvailableOi = createSelector(selectMarketInfo, (marketInfo) => {
	const availableOiUsdShort =
		marketInfo?.marketLimitUsd.sub(marketInfo.openInterest.shortUSD) ?? wei(0)

	const availableOiUsdLong =
		marketInfo?.marketLimitUsd.sub(marketInfo.openInterest.longUSD) ?? wei(0)

	const availableOiNativeShort =
		marketInfo?.marketLimitNative.sub(marketInfo.openInterest.short) ?? wei(0)

	const availableOiNativeLong =
		marketInfo?.marketLimitNative.sub(marketInfo.openInterest.long) ?? wei(0)

	return {
		short: {
			usd: availableOiUsdShort,
			native: availableOiNativeShort,
		},
		long: {
			usd: availableOiUsdLong,
			native: availableOiNativeLong,
		},
	}
})

export const selectAverageEntryPrice = createSelector(
	selectTradePreview,
	selectSelectedMarketPositionHistory,
	(tradePreview, positionHistory) => {
		if (positionHistory && tradePreview) {
			const { avgEntryPrice, side, size } = positionHistory
			const currentSize = side === PositionSide.SHORT ? size.neg() : size

			// If the trade switched sides (long -> short or short -> long), use oracle price
			if (currentSize.mul(tradePreview.size).lt(0)) return tradePreview.price

			// If the trade reduced position size on the same side, average entry remains the same
			if (tradePreview.size.abs().lt(size)) return avgEntryPrice

			// If the trade increased position size on the same side, calculate new average
			const existingValue = avgEntryPrice.mul(size)
			const newValue = tradePreview.price.mul(tradePreview.sizeDelta.abs())
			const totalValue = existingValue.add(newValue)
			return tradePreview.size.abs().gt(0) ? totalValue.div(tradePreview.size.abs()) : wei(0)
		}
		return null
	}
)

type PositionPreviewData = {
	fillPrice: Wei
	sizeIsNotZero: boolean
	positionSide: string
	positionSize: Wei
	leverage: Wei
	liquidationPrice: Wei
	avgEntryPrice: Wei
	notionalValue: Wei
	showStatus: boolean
}

export const selectPositionPreviewData = createSelector(
	selectTradePreview,
	selectPosition,
	selectAverageEntryPrice,
	(tradePreview, position, modifiedAverage) => {
		if (!position?.position || tradePreview === null) {
			return null
		}

		return {
			fillPrice: tradePreview.price,
			sizeIsNotZero: tradePreview.size && !tradePreview.size?.eq(0),
			positionSide: tradePreview.size?.gt(0) ? PositionSide.LONG : PositionSide.SHORT,
			positionSize: tradePreview.size?.abs(),
			notionalValue: tradePreview.notionalValue,
			leverage: tradePreview.margin.gt(0)
				? tradePreview.notionalValue.div(tradePreview.margin).abs()
				: ZERO_WEI,
			liquidationPrice: tradePreview.liqPrice,
			avgEntryPrice: modifiedAverage || ZERO_WEI,
			showStatus: tradePreview.showStatus,
		} as PositionPreviewData
	}
)

export const selectBuyingPower = createSelector(
	selectPosition,
	selectMaxLeverage,
	(position, maxLeverage) => {
		const totalMargin = position?.remainingMargin ?? ZERO_WEI
		return totalMargin.gt(ZERO_WEI) ? totalMargin.mul(maxLeverage ?? ZERO_WEI) : ZERO_WEI
	}
)

export const selectMarketSuspended = createSelector(
	selectMarketInfo,
	(marketInfo) => marketInfo?.isSuspended
)

export const selectHistoricalFundingRatePeriod = (state: RootState) =>
	state.futures.historicalFundingRatePeriod

export const selectTradePanelSLValidity = createSelector(
	selectSlTpTradeInputs,
	selectTradePreview,
	selectMarketIndexPrice,
	selectLeverageSide,
	({ stopLossPrice }, preview, currentPrice, leverageSide) => {
		return stopLossValidity(stopLossPrice, preview?.liqPrice, leverageSide, currentPrice)
	}
)

export const selectModalSLValidity = createSelector(
	selectSlTpModalInputs,
	selectEditPositionModalInfo,
	({ stopLossPrice }, { position, marketPrice }) => {
		return stopLossValidity(
			stopLossPrice,
			position?.liquidationPrice,
			position?.side || PositionSide.LONG,
			marketPrice
		)
	}
)

export const selectPendingOrdersCount = createSelector(
	selectPendingAsyncOrdersCount,
	selectOpenDelayedOrders,
	selectFuturesType,
	(asyncCount, delayedOrders, type) =>
		type === FuturesMarginType.CROSS_MARGIN ? asyncCount : delayedOrders.length
)
