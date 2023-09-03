import { ZERO_WEI, PERIOD_IN_SECONDS, Period } from '@kwenta/sdk/constants'
import {
	TransactionStatus,
	PositionSide,
	FuturesMarginType,
	FuturesMarket,
} from '@kwenta/sdk/types'
import { truncateTimestamp } from '@kwenta/sdk/utils'
import { createSelector } from '@reduxjs/toolkit'
import { wei } from '@synthetixio/wei'

import {
	selectAllCrossMarginTrades,
	selectCrossMarginAccountData,
	selectCrossMarginAvailableMargin,
	selectCrossMarginMarginTransfers,
	selectCrossMarginMaxLeverage,
	selectSelectedCrossMarginPosition,
	selectCrossMarginPositionHistory,
	selectCrossMarginPositions,
	selectCrossMarginTradeInputs,
	selectMarkPriceInfosV3,
	selectMarkPricesV3,
	selectPendingAsyncOrdersCount,
	selectV3MarketInfo,
	selectV3MarketKey,
	selectV3Markets,
	selectV3SkewAdjustedPrice,
	selectV3SkewAdjustedPriceInfo,
} from 'state/futures/crossMargin/selectors'
import { selectPrices } from 'state/prices/selectors'
import { RootState } from 'state/store'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import { getKnownError } from 'utils/formatters/error'
import {
	unserializeFuturesVolumes,
	unserializePositionHistory,
	unserializeTrades,
	stopLossValidity,
	takeProfitValidity,
} from 'utils/futures'

import {
	selectFuturesState,
	selectFuturesType,
	selectMarketAsset,
	selectMarketIndexPrice,
	selectMarketOnchainPrice,
} from './common/selectors'
import { CrossPerpsPortfolio } from './crossMargin/types'
import {
	selectAccountMarginTransfers,
	selectMarginDeltaInputValue,
	selectSmartMarginDelayedOrders,
	selectV2Markets,
	selectSmartMarginAccount,
	selectSmartMarginAccountData,
	selectTradePreview,
	selectV2MarketKey,
	selectSmartMarginTradeInputs,
	selectSmartMarginOrderPrice,
	selectSmartMarginMaxLeverage,
	selectSlTpTradeInputs,
	selectSlTpModalInputs,
	selectEditPositionModalInfo,
	selectMarkPricesV2,
	selectMarkPriceInfosV2,
	selectSmartMarginActivePositions,
	selectAllSmartMarginTrades,
	selectV2MarketInfo,
	selectSelectedSmartMarginPosition,
	selectV2SkewAdjustedPrice,
	selectV2SkewAdjustedPriceInfo,
	selectIdleAccountMargin,
} from './smartMargin/selectors'
import { SmartPerpsPortfolio } from './smartMargin/types'
import { FuturesAction, PortfolioValues } from './types'

export const selectQueryStatuses = createSelector(
	selectFuturesState,
	(state: RootState) => state.futures.queryStatuses,
	(selectedFuturesState, globalFuturesState) => ({
		...selectedFuturesState.queryStatuses,
		...globalFuturesState,
	})
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

export const selectMarketVolumes = createSelector(
	(state: RootState) => state.smartMargin.dailyMarketVolumes,
	(dailyMarketVolumes) => unserializeFuturesVolumes(dailyMarketVolumes)
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
	(type, v2Key, v3Key) => (type === FuturesMarginType.CROSS_MARGIN ? v3Key : v2Key)
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

export const selectPosition = createSelector(
	selectSelectedSmartMarginPosition,
	selectSelectedCrossMarginPosition,
	selectFuturesType,
	(v2, v3, type) => {
		return type === FuturesMarginType.CROSS_MARGIN ? v3 : v2
	}
)

export const selectSkewAdjustedPrice = createSelector(
	selectV2SkewAdjustedPrice,
	selectV3SkewAdjustedPrice,
	selectFuturesType,
	(v2, v3, type) => {
		return type === FuturesMarginType.CROSS_MARGIN ? v3 : v2
	}
)

export const selectSkewAdjustedPriceInfo = createSelector(
	selectV2SkewAdjustedPriceInfo,
	selectV3SkewAdjustedPriceInfo,
	selectFuturesType,
	(v2, v3, type) => {
		return type === FuturesMarginType.CROSS_MARGIN ? v3 : v2
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
	selectSmartMarginActivePositions,
	selectCrossMarginPositions,
	(state: RootState) => state.futures.selectedType,
	(smartPositions, crossPositions, selectedType) => {
		return selectedType === FuturesMarginType.CROSS_MARGIN ? crossPositions : smartPositions
	}
)

export const selectUsersPositionHistory = createSelector(
	selectNetwork,
	selectWallet,
	(state: RootState) => state.futures,
	(networkId, wallet, futures) => {
		if (!wallet) return []
		const history = futures.leaderboard.selectedTraderPositionHistory[networkId]?.[wallet] ?? []
		return unserializePositionHistory(history)
	}
)

export const selectTotalUnrealizedPnl = createSelector(selectFuturesPositions, (positions) => {
	return positions.reduce((acc, p) => {
		return acc.add(p?.activePosition?.pnl ?? ZERO_WEI)
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

export const selectMaxLeverage = createSelector(
	selectCrossMarginMaxLeverage,
	selectSmartMarginMaxLeverage,
	selectFuturesType,
	(cmMax, smMax, type) => {
		return type === FuturesMarginType.CROSS_MARGIN ? cmMax : smMax
	}
)

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
		return type === FuturesMarginType.CROSS_MARGIN ? indexPrice : wei(orderPrice || indexPrice)
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
	selectSmartMarginActivePositions,
	selectCrossMarginPositions,
	selectIdleAccountMargin,
	(smartPositions, crossPositions, idleMargin) => {
		// TODO: Update this for cross margin
		const crossValue =
			crossPositions.reduce((sum, { remainingMargin }) => sum.add(remainingMargin ?? 0), wei(0)) ??
			wei(0)
		const smartValue =
			smartPositions.reduce((sum, { remainingMargin }) => sum.add(remainingMargin), wei(0)) ??
			wei(0)
		const totalValue = smartValue.add(crossValue).add(idleMargin)

		return {
			total: totalValue,
			smartMargin: smartValue.add(idleMargin),
			crossMargin: crossValue,
		}
	}
)

export const selectSmartMarginTransfers = createSelector(
	selectSmartMarginAccountData,
	(account) => {
		return account?.marketMarginTransfers ?? []
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
	selectSmartMarginDelayedOrders,
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
			margin: margin.toNumber(),
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
	selectAccountMarginTransfers,
	selectFuturesPortfolio,
	(trades, transfers, accountTransfers, portfolioTotal) => {
		const tradeActions = trades.map(({ account, timestamp, asset, margin }) => ({
			account,
			timestamp,
			asset,
			margin: margin.toNumber(),
			size: 0,
			type: 'trade',
		}))

		const transferActions = transfers.map(({ account, timestamp, asset, size }) => ({
			account,
			timestamp,
			asset,
			size,
			margin: 0,
			type: 'market_transfer',
		}))

		const accountTransferActions = accountTransfers.map(({ account, timestamp, asset, size }) => ({
			account,
			timestamp,
			asset,
			size,
			margin: 0,
			type: 'account_transfer',
		}))

		const actions = [...tradeActions, ...transferActions, ...accountTransferActions]
			.filter((action) => !!action)
			.sort((a, b) => {
				if (a.timestamp === b.timestamp) return a.type === 'account_transfer' ? -1 : 1
				return a.timestamp - b.timestamp
			})

		const accountHistory = actions.reduce((acc, action) => {
			if (acc.length === 0) {
				const newTotal = action.size !== 0 ? action.size : action.margin
				const lastAction =
					action.type === 'account_transfer' || !action.asset
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

export const selectMarketSuspended = createSelector(
	selectMarketInfo,
	(marketInfo) => marketInfo?.isSuspended
)

export const selectHistoricalFundingRatePeriod = (state: RootState) =>
	state.futures.historicalFundingRatePeriod

export const selectTradePanelSLTPValidity = createSelector(
	selectSlTpTradeInputs,
	selectTradePreview,
	selectMarketIndexPrice,
	selectMarketOnchainPrice,
	selectLeverageSide,
	({ stopLossPrice, takeProfitPrice }, preview, currentPrice, onChainPrice, leverageSide) => {
		const tpValidity = takeProfitValidity(takeProfitPrice, leverageSide, onChainPrice, currentPrice)
		const slValidity = stopLossValidity(
			stopLossPrice,
			preview?.liqPrice || wei(0),
			leverageSide,
			onChainPrice,
			currentPrice
		)
		return {
			takeProfit: tpValidity,
			stopLoss: slValidity,
		}
	}
)

export const selectModalSLTPValidity = createSelector(
	selectSlTpModalInputs,
	selectEditPositionModalInfo,
	({ takeProfitPrice, stopLossPrice }, { position, marketPrice, onChainPrice }) => {
		const tpValidity = takeProfitValidity(
			takeProfitPrice,
			position?.activePosition?.side || PositionSide.LONG,
			onChainPrice,
			marketPrice
		)
		const slValidity = stopLossValidity(
			stopLossPrice,
			position?.activePosition?.liquidationPrice,
			position?.activePosition?.side || PositionSide.LONG,
			onChainPrice,
			marketPrice
		)

		return {
			takeProfit: tpValidity,
			stopLoss: slValidity,
		}
	}
)

export const selectPendingOrdersCount = createSelector(
	selectPendingAsyncOrdersCount,
	selectSmartMarginDelayedOrders,
	selectFuturesType,
	(asyncCount, delayedOrders, type) =>
		type === FuturesMarginType.CROSS_MARGIN ? asyncCount : delayedOrders.length
)

export const selectCsvExport = (state: RootState) => state.futures.csvExport
