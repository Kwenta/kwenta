import { SL_TP_MAX_SIZE, ZERO_WEI } from '@kwenta/sdk/constants'
import {
	TransactionStatus,
	ConditionalOrderTypeEnum,
	PerpsV2Position,
	PositionSide,
} from '@kwenta/sdk/types'
import {
	calculateDesiredFillPrice,
	getDefaultPriceImpact,
	unserializePotentialTrade,
	MarketKeyByAsset,
	MarketAssetByKey,
	stripZeros,
} from '@kwenta/sdk/utils'
import { createSelector } from '@reduxjs/toolkit'
import Wei, { wei } from '@synthetixio/wei'
import { FuturesPositionTablePosition } from 'types/futures'

import { DEFAULT_DELAYED_CANCEL_BUFFER } from 'constants/defaults'
import { selectSNXUSDBalance } from 'state/balances/selectors'
import { deserializeWeiObject } from 'state/helpers'
import {
	selectOffchainPricesInfo,
	selectOnChainPricesInfo,
	selectPrices,
} from 'state/prices/selectors'
import { RootState } from 'state/store'
import { FetchStatus } from 'state/types'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import { computeDelayedOrderFee, sameSide } from 'utils/costCalculations'
import { getKnownError } from 'utils/formatters/error'
import {
	unserializeCmBalanceInfo,
	unserializeFuturesVolumes,
	unserializeTradeInputs,
	unserializeV2Markets,
	unserializeDelayedOrders,
	updatePositionUpnl,
	unserializePositionHistory,
	unserializeTrades,
	unserializeConditionalOrders,
} from 'utils/futures'

import { AsyncOrderWithDetails } from '../crossMargin/types'
import { futuresPositionKeys } from '../types'

import { MarkPrices, MarkPriceInfos } from './types'

export const selectV2MarketKey = createSelector(
	(state: RootState) => state.smartMargin.selectedMarketAsset,
	(marketAsset) => MarketKeyByAsset[marketAsset]
)

export const selectSmartMarginAccount = createSelector(
	selectWallet,
	selectNetwork,
	(state: RootState) => state.smartMargin,
	(wallet, network, smartMargin) => {
		return wallet ? smartMargin.accounts[network]?.[wallet]?.account : undefined
	}
)

export const selectQueryStatuses = (state: RootState) => state.smartMargin.queryStatuses

export const selectMarketsQueryStatus = (state: RootState) =>
	state.smartMargin.queryStatuses.markets

export const selectSmartMarginAccountQueryStatus = (state: RootState) =>
	state.smartMargin.queryStatuses.account

export const selectLeverageInput = createSelector(
	(state: RootState) => state.smartMargin,
	(smartMargin) => smartMargin.leverageInput
)

export const selectSmartMarginMarginDelta = createSelector(
	(state: RootState) => state.smartMargin,
	(smartMargin) => wei(smartMargin.marginDelta || 0)
)

export const selectMarginDeltaInputValue = (state: RootState) => state.smartMargin.marginDelta

export const selectSmartMarginSupportedNetwork = (state: RootState) =>
	state.wallet.networkId === 10 || state.wallet.networkId === 420

export const selectShowSmartMarginOnboard = (state: RootState) =>
	state.app.showModal === 'futures_smart_margin_onboard'

export const selectEditPositionModalMarket = (state: RootState) =>
	state.app.showPositionModal?.marketKey

export const selectSmartMarginAccountData = createSelector(
	selectWallet,
	selectNetwork,
	selectSmartMarginSupportedNetwork,
	(state: RootState) => state.smartMargin,
	(wallet, network, supportedNetwork, smartMargin) => {
		return wallet && supportedNetwork ? smartMargin.accounts[network][wallet] : null
	}
)

export const selectCMBalance = createSelector(selectSmartMarginAccountData, (account) =>
	wei(account?.balanceInfo.freeMargin || 0)
)

export const selectV2MarketAsset = (state: RootState) => state.smartMargin.selectedMarketAsset

export const selectV2Markets = createSelector(
	selectNetwork,
	(state: RootState) => state.smartMargin,
	(network, smartMargin) => {
		return smartMargin.markets[network] ? unserializeV2Markets(smartMargin.markets[network]) : []
	}
)

export const selectOptimismMarkets = createSelector(
	(state: RootState) => state.smartMargin,
	(smartMargin) => unserializeV2Markets(smartMargin.markets[10] ?? [])
)

export const selectOptimismMarkPrices = createSelector(
	selectOptimismMarkets,
	selectPrices,
	(optimismMarkets, prices) => {
		const markPrices: MarkPrices = {}
		return optimismMarkets.reduce((acc, market) => {
			const price = prices[market.asset]?.offChain ?? wei(0)
			return {
				...acc,
				[market.marketKey]: wei(price).mul(
					wei(market.marketSkew).div(market.settings.skewScale).add(1)
				),
			}
		}, markPrices)
	}
)

export const selectPerpsV2MarketVolumes = createSelector(
	(state: RootState) => state.smartMargin.dailyMarketVolumes,
	(dailyMarketVolumes) => unserializeFuturesVolumes(dailyMarketVolumes)
)

export const selectV2MarketInfo = createSelector(
	selectV2Markets,
	selectV2MarketKey,
	(markets, selectedMarket) => {
		return markets.find((market) => market.marketKey === selectedMarket)
	}
)

export const selectOrderType = createSelector(
	(state: RootState) => state.smartMargin,
	(smartMargin) => smartMargin.orderType
)

export const selectSmartMarginOrderType = (state: RootState) => state.smartMargin.orderType

export const selectCloseSMPositionOrderInputs = createSelector(
	(state: RootState) => state.smartMargin,
	(smartMargin) => {
		return smartMargin.closePositionOrderInputs
	}
)

export const selectMarketIndexPrice = createSelector(
	selectV2MarketAsset,
	selectPrices,
	(marketAsset, prices) => {
		const price = prices[marketAsset]
		// Note this assumes the order type is always delayed off chain
		return price?.offChain ?? price?.onChain ?? wei(0)
	}
)

export const selectMarketPriceInfo = createSelector(
	selectV2MarketInfo,
	selectOffchainPricesInfo,
	(marketInfo, pricesInfo) => {
		if (!marketInfo || !pricesInfo[marketInfo.asset]) return
		return pricesInfo[marketInfo.asset]
	}
)

export const selectSkewAdjustedPrice = createSelector(
	selectMarketIndexPrice,
	selectV2MarketInfo,
	(price, marketInfo) => {
		if (!marketInfo?.marketSkew || !marketInfo?.settings.skewScale) return price
		return price
			? wei(price).mul(wei(marketInfo.marketSkew).div(marketInfo.settings.skewScale).add(1))
			: ZERO_WEI
	}
)

export const selectSkewAdjustedPriceInfo = createSelector(
	selectMarketPriceInfo,
	selectV2MarketInfo,
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
	selectV2MarketAsset,
	selectPrices,
	(marketAsset, prices) => {
		return prices[marketAsset] ?? {}
	}
)

export const selectMarkPricesV2 = createSelector(
	selectV2Markets,
	selectPrices,
	(markets, prices) => {
		const markPrices: MarkPrices = {}
		return markets.reduce((acc, market) => {
			const price = prices[market.asset]?.offChain ?? wei(0)
			return {
				...acc,
				[market.marketKey]: wei(price).mul(
					wei(market.marketSkew).div(market.settings.skewScale).add(1)
				),
			}
		}, markPrices)
	}
)

export const selectMarkPriceInfosV2 = createSelector(
	selectV2Markets,
	selectOffchainPricesInfo,
	(markets, prices) => {
		const markPrices: MarkPriceInfos = {}
		return markets.reduce<MarkPriceInfos>((acc, market) => {
			const price = prices[market.asset]?.price ?? wei(0)
			return {
				...acc,
				[market.marketKey]: {
					price: wei(price).mul(wei(market.marketSkew).div(market.settings.skewScale).add(1)),
					change: prices[market.asset]?.change ?? null,
				},
			}
		}, markPrices)
	}
)

export const selectAllConditionalOrders = createSelector(
	selectSmartMarginAccountData,
	selectOnChainPricesInfo,
	(account, prices) => {
		if (!account) return []

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

export const selectSmartMarginPositionHistory = createSelector(
	selectSmartMarginAccountData,
	(accountData) => {
		return unserializePositionHistory(accountData?.positionHistory ?? [])
	}
)

export const selectSelectedMarketPositionHistory = createSelector(
	selectV2MarketAsset,
	selectSmartMarginPositionHistory,
	(marketAsset, positionHistory) => {
		return positionHistory.find(({ asset, isOpen }) => isOpen && asset === marketAsset)
	}
)

export const selectSmartMarginPositions = createSelector(
	selectSmartMarginAccountData,
	selectAllConditionalOrders,
	selectMarkPricesV2,
	selectV2Markets,
	selectSmartMarginPositionHistory,
	(account, orders, prices, markets, positionHistory) => {
		return (
			account?.positions?.reduce<FuturesPositionTablePosition[]>((acc, p) => {
				const pos = updatePositionUpnl(p, prices, positionHistory)
				const market = markets.find((m) => m.marketKey === pos.marketKey)
				const history = positionHistory.find((ph) => {
					return ph.isOpen && ph.asset === pos.asset
				})
				if (market && pos.position) {
					const stopLoss = orders.find((o) => {
						return (
							o.marketKey === market.marketKey &&
							o.size.abs().eq(SL_TP_MAX_SIZE) &&
							o.reduceOnly &&
							o.orderType === ConditionalOrderTypeEnum.STOP
						)
					})
					const takeProfit = orders.find(
						(o) =>
							o.marketKey === market.marketKey &&
							o.size.abs().eq(SL_TP_MAX_SIZE) &&
							o.reduceOnly &&
							o.orderType === ConditionalOrderTypeEnum.LIMIT
					)

					const position = {
						...pos.position,
						stopLossOrder: stopLoss,
						takeProfitOrder: takeProfit,
						avgEntryPrice: history?.avgEntryPrice ?? ZERO_WEI,
						market,
					}
					acc.push(position)
				}
				return acc
			}, []) ?? []
		)
	}
)

export const selectActiveSmartMarginPositionsCount = createSelector(
	selectSmartMarginPositions,
	(positions) => {
		return positions.length
	}
)

export const selectActiveSmartPositionsCount = createSelector(
	selectSmartMarginPositions,
	(positions) => {
		return positions.length
	}
)

export const selectTotalUnrealizedPnl = createSelector(selectSmartMarginPositions, (positions) => {
	return positions.reduce((acc, p) => {
		return acc.add(p.pnl ?? ZERO_WEI)
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

export const selectIsSubmittingSmartMarginTransfer = createSelector(
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

export const selectIsApprovingSmartMarginDeposit = createSelector(
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

export const selectIsMarketCapReached = createSelector(
	(state: RootState) => state.smartMargin.leverageSide,
	selectV2MarketInfo,
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
	selectSmartMarginPositions,
	selectV2MarketInfo,
	(positions, market) => {
		const position = positions.find((p) => p.market.marketKey === market?.marketKey)
		return position
			? (deserializeWeiObject(position, futuresPositionKeys) as PerpsV2Position)
			: undefined
	}
)

export const selectOrderFeeCap = (state: RootState) => wei(state.smartMargin.orderFeeCap || '0')

export const selectSmartMarginLeverageSide = createSelector(
	(state: RootState) => state.smartMargin,
	(smartMargin) => smartMargin.leverageSide
)

export const selectSmartMarginMaxLeverage = createSelector(selectV2MarketInfo, (market) => {
	let adjustedMaxLeverage = market?.appMaxLeverage ?? wei(1)
	return adjustedMaxLeverage
})

export const selectAboveMaxLeverage = createSelector(
	selectSmartMarginMaxLeverage,
	selectPosition,
	(maxLeverage, position) => {
		return position?.position?.leverage && maxLeverage.lt(position.position.leverage)
	}
)

export const selectSmartMarginBalanceInfo = createSelector(
	selectSmartMarginAccountData,
	(account) => {
		return account
			? unserializeCmBalanceInfo(account.balanceInfo)
			: {
					freeMargin: wei(0),
					keeperEthBal: wei(0),
					allowance: wei(0),
			  }
	}
)

export const selectSmartMarginDepositApproved = createSelector(
	selectSmartMarginAccountData,
	(account) => {
		if (!account) return false
		return wei(account.balanceInfo.allowance || 0).gt(0)
	}
)

export const selectRemainingMarketMargin = createSelector(selectPosition, (position) => {
	if (!position) return ZERO_WEI
	return position.remainingMargin
})

export const selectMarginInMarkets = (isSuspended: boolean = false) =>
	createSelector(selectSmartMarginPositions, (positions) => {
		const idleInMarkets = positions
			.filter((p) => {
				return p.market && p.market.isSuspended === isSuspended
			})
			.filter((p) => !p?.size.abs().gt(0) && p.remainingMargin?.gt(0))
			.reduce((acc, p) => acc.add(p.remainingMargin), wei(0))
		return idleInMarkets
	})

export const selectAvailableMarginInMarkets = selectMarginInMarkets()

export const selectLockedMarginInMarkets = selectMarginInMarkets(true)

export const selectIdleMargin = createSelector(
	selectAvailableMarginInMarkets,
	selectSmartMarginBalanceInfo,
	selectSNXUSDBalance,
	(idleInMarkets, { freeMargin }, balance) => {
		return balance.add(idleInMarkets).add(freeMargin)
	}
)

export const selectSmartMarginAllowanceValid = createSelector(
	selectSmartMarginAccountData,
	selectSmartMarginBalanceInfo,
	selectAvailableMarginInMarkets,
	selectSmartMarginMarginDelta,
	(account, { freeMargin }, idleInMarkets, marginDelta) => {
		const totalIdleMargin = freeMargin.add(idleInMarkets)
		if (!account) return false
		const marginDeposit = marginDelta.sub(totalIdleMargin)
		return (
			totalIdleMargin.gte(marginDelta) || wei(account.balanceInfo.allowance || 0).gte(marginDeposit)
		)
	}
)

export const selectWithdrawableSmartMargin = createSelector(
	selectAvailableMarginInMarkets,
	selectSmartMarginBalanceInfo,
	(idleInMarkets, { freeMargin }) => {
		return idleInMarkets.add(freeMargin)
	}
)

export const selectSmartMarginTradeInputs = createSelector(
	selectSmartMarginLeverageSide,
	(state: RootState) => state.smartMargin.tradeInputs,
	(side, tradeInputs) => {
		const inputs = unserializeTradeInputs(tradeInputs)
		const deltas = {
			susdSizeDelta: side === PositionSide.LONG ? inputs.susdSize : inputs.susdSize.neg(),
			nativeSizeDelta: side === PositionSide.LONG ? inputs.nativeSize : inputs.nativeSize.neg(),
		}
		return {
			...inputs,
			...deltas,
			susdSizeString: tradeInputs.susdSize,
			nativeSizeString: tradeInputs.nativeSize,
		}
	}
)

export const selectSmartMarginEditPosInputs = (state: RootState) =>
	state.smartMargin.editPositionInputs

export const selectEditMarginAllowanceValid = createSelector(
	selectSmartMarginAccountData,
	selectSmartMarginBalanceInfo,
	selectAvailableMarginInMarkets,
	selectSmartMarginEditPosInputs,
	(account, { freeMargin }, idleInMarkets, { marginDelta }) => {
		const totalIdleMargin = freeMargin.add(idleInMarkets)
		if (!account) return false
		if (isNaN(Number(marginDelta))) return false
		const marginDelatWei = wei(marginDelta || 0)
		const marginDeposit = marginDelatWei.sub(totalIdleMargin)
		return (
			totalIdleMargin.gte(marginDelatWei) ||
			wei(account.balanceInfo.allowance || 0).gte(marginDeposit)
		)
	}
)

export const selectKeeperEthBalance = createSelector(selectSmartMarginAccountData, (account) =>
	wei(account?.balanceInfo.keeperEthBal || 0)
)

export const selectWalletEthBalance = createSelector(selectSmartMarginAccountData, (account) =>
	wei(account?.balanceInfo.walletEthBal || 0)
)

export const selectSmartMarginKeeperDeposit = createSelector(
	(state: RootState) => state.smartMargin.fees,
	(fees) => {
		return wei(fees.keeperEthDeposit)
	}
)

export const selectKeeperDepositExceedsBal = createSelector(
	selectSmartMarginKeeperDeposit,
	selectWalletEthBalance,
	(keeperEthDeposit, walletEthBalance) => {
		return keeperEthDeposit.gt(walletEthBalance)
	}
)

export const selectEditPositionModalInfo = createSelector(
	selectEditPositionModalMarket,
	selectSmartMarginPositions,
	selectV2Markets,
	selectPrices,
	(modalMarketKey, smartPositions, markets, prices) => {
		const position = smartPositions.find((p) => p.market.marketKey === modalMarketKey)
		if (!position || position.market.version === 3)
			return { position: null, market: null, marketPrice: wei(0) }
		const price = prices[position.market.asset]
		// Note this assumes the order type is always delayed off chain
		return { position, market: position.market, marketPrice: price.offChain || wei(0) }
	}
)

export const selectConditionalOrdersForMarket = createSelector(
	selectV2MarketAsset,
	selectSmartMarginAccountData,
	(asset, account) => {
		return account
			? unserializeConditionalOrders(account.conditionalOrders).filter((o) => o.asset === asset)
			: []
	}
)

export const selectStopLossOrder = createSelector(
	selectConditionalOrdersForMarket,
	selectV2MarketKey,
	(selectOpenConditionalOrders, marketKey) => {
		return selectOpenConditionalOrders.find(
			(o) =>
				o.marketKey === marketKey && o.orderType === ConditionalOrderTypeEnum.STOP && o.reduceOnly
		)
	}
)

export const selectTakeProfitOrder = createSelector(
	selectConditionalOrdersForMarket,
	selectV2MarketKey,
	(selectOpenConditionalOrders, marketKey) => {
		return selectOpenConditionalOrders.find(
			(o) =>
				o.marketKey === marketKey && o.orderType === ConditionalOrderTypeEnum.LIMIT && o.reduceOnly
		)
	}
)

export const selectAllSLTPOrders = createSelector(selectAllConditionalOrders, (orders) => {
	return orders.filter((o) => o.reduceOnly && o.size.abs().eq(SL_TP_MAX_SIZE))
})

export const selectSLTPModalExistingPrices = createSelector(
	selectAllSLTPOrders,
	selectEditPositionModalInfo,
	(orders, { market }) => {
		const sl = orders.find(
			(o) => o.marketKey === market?.marketKey && o.orderType === ConditionalOrderTypeEnum.STOP
		)
		const tp = orders.find(
			(o) => o.marketKey === market?.marketKey && o.orderType === ConditionalOrderTypeEnum.LIMIT
		)

		return {
			takeProfitPrice: tp?.targetPrice ? stripZeros(tp.targetPrice.toString()) : '',
			stopLossPrice: sl?.targetPrice ? stripZeros(sl.targetPrice.toString()) : '',
		}
	}
)

export const selectSlTpTradeInputs = createSelector(
	(state: RootState) => state.smartMargin.tradeInputs,
	(tradeInputs) => ({
		stopLossPrice: tradeInputs.stopLossPrice || '',
		takeProfitPrice: tradeInputs.takeProfitPrice || '',
	})
)

export const selectNewTradeHasSlTp = createSelector(
	(state: RootState) => state.smartMargin.tradeInputs,
	(tradeInputs) => Number(tradeInputs.stopLossPrice) > 0 || Number(tradeInputs.takeProfitPrice) > 0
)

export const selectSlTpModalInputs = createSelector(
	(state: RootState) => state.smartMargin.sltpModalInputs,
	(inputs) => ({
		stopLossPrice: inputs.stopLossPrice ?? '',
		takeProfitPrice: inputs.takeProfitPrice ?? '',
	})
)

export const selectSmartMarginOrderPrice = (state: RootState) =>
	state.smartMargin.orderPrice.price ?? ''

export const selectTradePreview = createSelector(
	selectSmartMarginTradeInputs,
	selectSmartMarginOrderPrice,
	selectOrderType,
	(state: RootState) => state.smartMargin,
	({ nativeSizeDelta }, orderPrice, orderType, smartMargin) => {
		const preview = smartMargin.previews.trade
		const unserialized = preview ? unserializePotentialTrade(preview) : null
		if (unserialized) {
			const priceImpact = getDefaultPriceImpact(orderType)
			const conditionalOrderPrice = wei(orderPrice || 0)
			const price =
				orderType !== 'market' && conditionalOrderPrice.gt(0)
					? conditionalOrderPrice
					: unserialized.price
			const desiredFillPrice = calculateDesiredFillPrice(nativeSizeDelta, price, priceImpact)

			return {
				...unserialized,
				desiredFillPrice,
				leverage: unserialized.margin.gt(0)
					? unserialized.notionalValue.div(unserialized.margin).abs()
					: wei(0),
			}
		}
		return null
	}
)

export const selectEditPositionPreview = createSelector(
	selectSmartMarginEditPosInputs,
	(state: RootState) => state.smartMargin,
	({ nativeSizeDelta }, smartMargin) => {
		if (isNaN(Number(nativeSizeDelta))) return null
		const preview = smartMargin.previews.edit
		const unserialized = preview ? unserializePotentialTrade(preview) : null
		if (unserialized) {
			const priceImpact = getDefaultPriceImpact('market')
			const desiredFillPrice = calculateDesiredFillPrice(
				wei(nativeSizeDelta || 0),
				unserialized.price,
				priceImpact
			)

			return {
				...unserialized,
				desiredFillPrice,
				leverage: unserialized.margin.gt(0)
					? unserialized.notionalValue.div(unserialized.margin).abs()
					: wei(0),
			}
		}
		return null
	}
)

export const selectClosePositionPreview = createSelector(
	selectEditPositionModalInfo,
	selectCloseSMPositionOrderInputs,
	(state: RootState) => state.smartMargin,
	({ position }, { price, orderType }, smartMargin) => {
		const preview = smartMargin.previews.close
		const unserialized = preview ? unserializePotentialTrade(preview) : null
		if (unserialized) {
			const priceImpact = getDefaultPriceImpact(orderType)
			let orderPrice =
				(orderType === 'market' ? unserialized.price : wei(price?.value || 0)) ?? wei(0)
			const desiredFillPrice = calculateDesiredFillPrice(
				position?.side === PositionSide.LONG ? wei(-1) : wei(1),
				orderPrice,
				priceImpact
			)

			return {
				...unserialized,
				desiredFillPrice,
				leverage: unserialized.margin.gt(0)
					? unserialized.notionalValue.div(unserialized.margin).abs()
					: wei(0),
			}
		}
		return null
	}
)

export const selectSmartMarginLeverage = createSelector(
	selectPosition,
	selectSmartMarginTradeInputs,
	(position, { susdSize }) => {
		const remainingMargin = position?.remainingMargin
		if (!remainingMargin || remainingMargin.eq(0) || !susdSize) return wei(0)
		return susdSize.div(remainingMargin)
	}
)

export const selectSmartMarginTransfers = createSelector(
	selectSmartMarginAccountData,
	(account) => {
		return account?.marginTransfers ?? []
	}
)

export const selectIdleMarginTransfers = createSelector(
	selectWallet,
	selectNetwork,
	(state: RootState) => state.smartMargin,
	(wallet, network, smartMargin) => {
		if (!wallet) return []
		const account = smartMargin.accounts[network]?.[wallet]
		return account?.idleTransfers ?? []
	}
)

export const selectTradePreviewError = createSelector(
	(state: RootState) => state.smartMargin,
	(smartMargin) => {
		return smartMargin.queryStatuses.tradePreview.error
	}
)

export const selectIsFetchingTradePreview = createSelector(
	(state: RootState) => state.smartMargin,
	(smartMargin) => {
		return smartMargin.queryStatuses.tradePreview.status === FetchStatus.Loading
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

export const selectTradePreviewStatus = createSelector(
	(state: RootState) => state.smartMargin,
	(smartMargin) => {
		return smartMargin.queryStatuses.tradePreview
	}
)

export const selectSmartMarginDelayedOrders = createSelector(
	selectSmartMarginAccountData,
	selectV2Markets,
	(account, markets) => {
		if (!account) return []
		const orders = unserializeDelayedOrders(account?.delayedOrders ?? [])

		return orders.reduce<AsyncOrderWithDetails[]>((acc, o) => {
			const market = markets.find((m) => m.marketKey === o.marketKey)

			if (market) {
				const timePastExecution = Math.floor((Date.now() - o.executableAtTimestamp) / 1000)
				const expirationTime = o.executableAtTimestamp + market.settings.offchainDelayedOrderMaxAge
				const executable = timePastExecution <= market.settings.offchainDelayedOrderMaxAge

				const order = {
					market,
					account: Number(account.account),
					size: o.size,
					executableStartTime: o.executableAtTimestamp,
					expirationTime: expirationTime,
					marginDelta: wei(0),
					desiredFillPrice: wei(o.desiredFillPrice),
					side: o.side,
					settlementWindowDuration: market.settings.offchainDelayedOrderMaxAge,
					settlementFee: o.keeperDeposit,
					isExecutable: executable,
					isStale:
						timePastExecution >
						DEFAULT_DELAYED_CANCEL_BUFFER + (market?.settings.offchainDelayedOrderMaxAge ?? 0),
				}
				acc.push(order)
			}
			return acc
		}, [])
	}
)

export const selectPendingDelayedOrder = createSelector(
	selectSmartMarginDelayedOrders,
	selectV2MarketKey,
	(delayedOrders, marketKey) => {
		return delayedOrders.find((o) => o.market.marketKey === marketKey)
	}
)

export const selectIsConditionalOrder = createSelector(
	(state: RootState) => state.smartMargin.orderType,
	(type) => type === 'limit' || type === 'stop_market'
)

export const selectDelayedOrderFee = createSelector(
	selectV2MarketInfo,
	selectSmartMarginTradeInputs,
	selectSkewAdjustedPrice,
	(market, { nativeSizeDelta }, price) => {
		if (
			!market?.marketSkew ||
			!market?.feeRates.takerFeeOffchainDelayedOrder ||
			!market?.feeRates.makerFeeOffchainDelayedOrder ||
			!nativeSizeDelta
		) {
			return { commitDeposit: undefined, delayedOrderFee: undefined }
		}

		const notionalDiff = nativeSizeDelta.mul(price)

		const makerFee = market.feeRates.makerFeeOffchainDelayedOrder
		const takerFee = market.feeRates.takerFeeOffchainDelayedOrder

		const staticRate = sameSide(notionalDiff, market.marketSkew) ? takerFee : makerFee

		return {
			commitDeposit: notionalDiff.mul(staticRate).abs(),
			delayedOrderFee: notionalDiff.mul(staticRate).abs(),
		}
	}
)

export const selectOpenInterest = createSelector(selectV2Markets, (futuresMarkets) =>
	futuresMarkets.reduce(
		(total, { openInterest }) => total.add(openInterest.shortUSD).add(openInterest.longUSD),
		wei(0)
	)
)

export const selectUsersTradesForMarket = createSelector(
	selectV2MarketAsset,
	selectSmartMarginAccountData,
	(asset, smartAccountData) => {
		const trades = unserializeTrades(smartAccountData?.trades ?? [])
		return trades?.filter((t) => t.asset === asset) ?? []
	}
)

export const selectAllSmartMarginTrades = createSelector(
	selectSmartMarginAccountData,
	selectV2Markets,
	(smartMarginAccountData, markets) => {
		const trades = unserializeTrades(smartMarginAccountData?.trades ?? [])
		return trades.map((t) => {
			const market = markets.find((m) => m.asset === t.asset)
			return {
				...t,
				market: market,
			}
		})
	}
)

export const selectSelectedPortfolioTimeframe = (state: RootState) =>
	state.futures.dashboard.selectedPortfolioTimeframe

export const selectCancellingConditionalOrder = (state: RootState) =>
	state.smartMargin.cancellingOrder

export const selectHasRemainingMargin = createSelector(
	selectPosition,
	selectSmartMarginBalanceInfo,
	(position, balanceInfo) => {
		const posMargin = position?.remainingMargin ?? ZERO_WEI
		return balanceInfo.freeMargin.add(posMargin).gt(0)
	}
)

export const selectOrderFee = createSelector(
	selectV2MarketInfo,
	selectSmartMarginTradeInputs,
	(marketInfo, { susdSizeDelta }) => {
		return computeDelayedOrderFee(marketInfo, susdSizeDelta)
	}
)

export const selectMaxUsdSizeInput = createSelector(
	selectSmartMarginMaxLeverage,
	selectMarginDeltaInputValue,
	(maxLeverage, marginDelta) => {
		return maxLeverage.mul(marginDelta || 0)
	}
)

export const selectAvailableOi = createSelector(selectV2MarketInfo, (marketInfo) => {
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

export const selectPreviewAvailableMargin = createSelector(
	selectV2MarketInfo,
	selectTradePreview,
	selectDelayedOrderFee,
	(marketInfo, tradePreview, delayedOrderFee) => {
		if (!marketInfo || !tradePreview) return ZERO_WEI

		let inaccessible = tradePreview.notionalValue.div(marketInfo.appMaxLeverage).abs() ?? ZERO_WEI
		const totalDeposit = !!delayedOrderFee.commitDeposit
			? delayedOrderFee.commitDeposit.add(marketInfo.keeperDeposit)
			: ZERO_WEI

		// If the user has a position open, we'll enforce a min initial margin requirement.
		if (inaccessible.gt(0) && inaccessible.lt(marketInfo.minInitialMargin)) {
			inaccessible = marketInfo.minInitialMargin
		}

		// check if available margin will be less than 0
		return tradePreview.margin.sub(inaccessible).sub(totalDeposit).gt(0)
			? tradePreview.margin.sub(inaccessible).sub(totalDeposit).abs()
			: ZERO_WEI
	}
)

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

export const selectPreviewMarginChange = createSelector(
	selectTradePreview,
	selectPreviewAvailableMargin,
	selectV2MarketInfo,
	(tradePreview, previewAvailableMargin, marketInfo) => {
		const potentialMarginUsage = tradePreview?.margin.gt(0)
			? tradePreview!.margin.sub(previewAvailableMargin).div(tradePreview!.margin).abs() ?? ZERO_WEI
			: ZERO_WEI

		const maxPositionSize =
			!!tradePreview && !!marketInfo
				? tradePreview.margin
						.mul(marketInfo.appMaxLeverage)
						.mul(tradePreview.side === PositionSide.LONG ? 1 : -1)
				: null

		const potentialBuyingPower = !!maxPositionSize
			? maxPositionSize.sub(tradePreview?.notionalValue).abs()
			: ZERO_WEI

		return {
			showPreview: !!tradePreview && tradePreview.sizeDelta.abs().gt(0),
			totalMargin: tradePreview?.margin || ZERO_WEI,
			availableMargin: previewAvailableMargin.gt(0) ? previewAvailableMargin : ZERO_WEI,
			buyingPower: potentialBuyingPower.gt(0) ? potentialBuyingPower : ZERO_WEI,
			marginUsage: potentialMarginUsage.gt(1) ? wei(1) : potentialMarginUsage,
		}
	}
)

export const selectSmartMarginPreviewCount = (state: RootState) =>
	state.smartMargin.previewDebounceCount

export const selectBuyingPower = createSelector(
	selectPosition,
	selectSmartMarginMaxLeverage,
	(position, maxLeverage) => {
		const totalMargin = position?.remainingMargin ?? ZERO_WEI
		return totalMargin.gt(ZERO_WEI) ? totalMargin.mul(maxLeverage ?? ZERO_WEI) : ZERO_WEI
	}
)

export const selectMarketSuspended = createSelector(
	selectV2MarketInfo,
	(marketInfo) => marketInfo?.isSuspended
)

export const selectFuturesFees = (state: RootState) => state.smartMargin.futuresFees

export const selectFuturesFeesForAccount = (state: RootState) =>
	state.smartMargin.futuresFeesForAccount
