import {
	DelayedOrder,
	FuturesMarket,
	FuturesMarketAsset,
	ConditionalOrder,
	FuturesOrderType,
	PerpsV2Position,
	FuturesPositionHistory,
	FuturesTrade,
	FuturesVolumes,
	PositionSide,
	PricesMap,
	PerpsV3AsyncOrder,
	PerpsV3SettlementStrategy,
	PerpsMarketV2,
	PerpsMarketV3,
	PerpsV3Position,
} from '@kwenta/sdk/types'
import {
	AssetDisplayByAsset,
	MarketKeyByAsset,
	formatNumber,
	getMarketName,
} from '@kwenta/sdk/utils'
import Wei, { wei } from '@synthetixio/wei'
import { TFunction } from 'i18next'

import { DelayedOrderWithDetails, TradeSizeInputs } from 'state/futures/common/types'
import { SmartMarginBalanceInfo } from 'state/futures/smartMargin/types'
import { futuresPositionKeys, FundingRate, MarkPrices } from 'state/futures/types'
import { deserializeWeiObject } from 'state/helpers'

import { CrossMarginTradePreview } from '../state/futures/crossMargin/types'

export const getSynthDescription = (synth: FuturesMarketAsset, t: TFunction) => {
	const assetDisplayName = AssetDisplayByAsset[synth]
	return t('common.currency.futures-market-short-name', {
		currencyName: assetDisplayName,
	})
}

export const isDecimalFour = (marketKeyOrAsset: string) =>
	['sEUR', 'EUR', 'sDOGE', 'DOGE'].includes(marketKeyOrAsset)

export const orderPriceInvalidLabel = (
	orderPrice: string,
	leverageSide: PositionSide,
	currentPrice: Wei,
	orderType: FuturesOrderType
): string | null => {
	if (!orderPrice || Number(orderPrice) <= 0) return null
	const isLong = leverageSide === 'long'
	if (
		((isLong && orderType === 'limit') || (!isLong && orderType === 'stop_market')) &&
		wei(orderPrice).gt(currentPrice)
	) {
		return 'max ' + formatNumber(currentPrice)
	}
	if (
		((!isLong && orderType === 'limit') || (isLong && orderType === 'stop_market')) &&
		wei(orderPrice).lt(currentPrice)
	)
		return 'min ' + formatNumber(currentPrice)
	return null
}

export const updatePositionUpnl = (
	positionDetails: PerpsV2Position<string>,
	prices: MarkPrices,
	positionHistory: FuturesPositionHistory[]
): PerpsV2Position => {
	const deserializedPositionDetails = deserializeWeiObject(
		positionDetails,
		futuresPositionKeys
	) as PerpsV2Position
	const offChainPrice = prices[MarketKeyByAsset[deserializedPositionDetails.asset]]
	const position = deserializedPositionDetails.position
	const thisPositionHistory = positionHistory.find(
		({ isOpen, asset }) => isOpen && asset === positionDetails.asset
	)
	if (!thisPositionHistory || !position || !offChainPrice) return deserializedPositionDetails

	const pnl = position.size.mul(
		thisPositionHistory.avgEntryPrice
			.sub(offChainPrice)
			.mul(position.side === PositionSide.LONG ? -1 : 1)
	)
	const pnlPct = pnl.div(position.initialMargin.add(thisPositionHistory.netTransfers))
	const accruedFunding = position.accruedFunding.add(thisPositionHistory.netFunding)

	return {
		...deserializedPositionDetails,
		position:
			!!position && !!pnl && !!pnlPct
				? {
						...position,
						accruedFunding,
						pnl,
						pnlPct,
				  }
				: position,
	}
}

export const serializeMarket = (market: FuturesMarket): FuturesMarket<string> => {
	return {
		...market,
		currentFundingRate: market.currentFundingRate.toString(),
		currentFundingVelocity: market.currentFundingVelocity.toString(),
		feeRates: {
			makerFee: market.feeRates.makerFee.toString(),
			takerFee: market.feeRates.takerFee.toString(),
			makerFeeDelayedOrder: market.feeRates.makerFeeDelayedOrder.toString(),
			takerFeeDelayedOrder: market.feeRates.takerFeeDelayedOrder.toString(),
			makerFeeOffchainDelayedOrder: market.feeRates.makerFeeOffchainDelayedOrder.toString(),
			takerFeeOffchainDelayedOrder: market.feeRates.takerFeeOffchainDelayedOrder.toString(),
		},
		openInterest: {
			...market.openInterest,
			shortUSD: market.openInterest.shortUSD.toString(),
			longUSD: market.openInterest.longUSD.toString(),
			long: market.openInterest.long.toString(),
			short: market.openInterest.short.toString(),
		},
		marketDebt: market.marketDebt.toString(),
		marketSkew: market.marketSkew.toString(),
		marketSize: market.marketSize.toString(),
		contractMaxLeverage: market.contractMaxLeverage.toString(),
		appMaxLeverage: market.appMaxLeverage.toString(),
		minInitialMargin: market.minInitialMargin.toString(),
		keeperDeposit: market.keeperDeposit.toString(),
		marketLimitUsd: market.marketLimitUsd.toString(),
		marketLimitNative: market.marketLimitNative.toString(),
		settings: {
			...market.settings,
			maxMarketValue: market.settings.maxMarketValue.toString(),
			skewScale: market.settings.skewScale.toString(),
		},
	}
}

export const unserializeMarket = (m: FuturesMarket<string>): FuturesMarket => {
	return {
		...m,
		currentFundingRate: wei(m.currentFundingRate),
		currentFundingVelocity: wei(m.currentFundingVelocity ?? 0),
		feeRates: {
			makerFee: wei(m.feeRates.makerFee),
			takerFee: wei(m.feeRates.takerFee),
			makerFeeDelayedOrder: wei(m.feeRates.makerFeeDelayedOrder),
			takerFeeDelayedOrder: wei(m.feeRates.takerFeeDelayedOrder),
			makerFeeOffchainDelayedOrder: wei(m.feeRates.makerFeeOffchainDelayedOrder),
			takerFeeOffchainDelayedOrder: wei(m.feeRates.takerFeeOffchainDelayedOrder),
		},
		openInterest: {
			...m.openInterest,
			shortUSD: wei(m.openInterest.shortUSD),
			longUSD: wei(m.openInterest.longUSD),
			short: wei(m.openInterest.short),
			long: wei(m.openInterest.long),
		},
		marketDebt: wei(m.marketDebt),
		marketSkew: wei(m.marketSkew),
		marketSize: wei(m.marketSize),
		contractMaxLeverage: wei(m.contractMaxLeverage),
		appMaxLeverage: wei(m.appMaxLeverage),
		minInitialMargin: wei(m.minInitialMargin),
		keeperDeposit: wei(m.keeperDeposit),
		marketLimitUsd: wei(m.marketLimitUsd),
		marketLimitNative: wei(m.marketLimitNative),
		settings: {
			...m.settings,
			maxMarketValue: wei(m.settings.maxMarketValue),
			skewScale: wei(m.settings.skewScale),
		},
	}
}

export const serializeV2Market = (m: PerpsMarketV2): PerpsMarketV2<string> => {
	return {
		...serializeMarket(m),
		version: 2,
		marketAddress: m.marketAddress,
	}
}

export const unserializeV2Market = (m: PerpsMarketV2<string>): PerpsMarketV2 => {
	return {
		...unserializeMarket(m),
		version: 2,
		marketAddress: m.marketAddress,
	}
}

export const serializeV3Market = (m: PerpsMarketV3): PerpsMarketV3<string> => {
	return {
		...serializeMarket(m),
		marketId: m.marketId,
		version: 3,
		settlementStrategies: m.settlementStrategies.map(serializeSettlementStrategy),
	}
}

export const unserializeV3Market = (m: PerpsMarketV3<string>): PerpsMarketV3 => {
	return {
		...unserializeMarket(m),
		marketId: m.marketId,
		version: 3,
		settlementStrategies: m.settlementStrategies.map(unserializeSettlementStrategy),
	}
}

export const serializeV2Markets = (markets: PerpsMarketV2[]): PerpsMarketV2<string>[] => {
	return markets.map((m) => serializeV2Market(m))
}

export const unserializeV2Markets = (markets: PerpsMarketV2<string>[]): PerpsMarketV2[] => {
	return markets.map((m) => unserializeV2Market(m))
}

export const serializeSettlementStrategy = (
	strat: PerpsV3SettlementStrategy
): PerpsV3SettlementStrategy<string> => {
	return {
		...strat,
		settlementDelay: strat.settlementDelay.toString(),
		settlementWindowDuration: strat.settlementWindowDuration.toString(),
		settlementReward: strat.settlementReward.toString(),
		priceDeviationTolerance: strat.priceDeviationTolerance.toString(),
	}
}

export const unserializeSettlementStrategy = (
	strat: PerpsV3SettlementStrategy<string>
): PerpsV3SettlementStrategy => {
	return {
		...strat,
		settlementDelay: wei(strat.settlementDelay),
		settlementWindowDuration: wei(strat.settlementWindowDuration),
		settlementReward: wei(strat.settlementReward),
		priceDeviationTolerance: wei(strat.priceDeviationTolerance),
	}
}

export const serializeCmBalanceInfo = (
	overview: SmartMarginBalanceInfo
): SmartMarginBalanceInfo<string> => {
	return {
		freeMargin: overview.freeMargin.toString(),
		keeperEthBal: overview.keeperEthBal.toString(),
		walletEthBal: overview.walletEthBal.toString(),
		allowance: overview.allowance.toString(),
	}
}

export const unserializeCmBalanceInfo = (
	balanceInfo: SmartMarginBalanceInfo<string>
): SmartMarginBalanceInfo<Wei> => {
	return {
		freeMargin: wei(balanceInfo.freeMargin),
		keeperEthBal: wei(balanceInfo.keeperEthBal),
		walletEthBal: wei(balanceInfo.walletEthBal),
		allowance: wei(balanceInfo.allowance),
	}
}

export const serializeFuturesVolumes = (volumes: FuturesVolumes) => {
	return Object.keys(volumes).reduce<FuturesVolumes<string>>((acc, k) => {
		acc[k] = {
			trades: volumes[k].trades.toString(),
			volume: volumes[k].volume.toString(),
		}
		return acc
	}, {})
}

export const unserializeFuturesVolumes = (volumes: FuturesVolumes<string>) => {
	return Object.keys(volumes).reduce<FuturesVolumes>((acc, k) => {
		acc[k] = {
			trades: wei(volumes[k].trades),
			volume: wei(volumes[k].volume),
		}
		return acc
	}, {})
}

export const serializeTradeInputs = (tradeInputs: TradeSizeInputs): TradeSizeInputs<string> => {
	return {
		nativeSize: tradeInputs.nativeSize.toString(),
		susdSize: tradeInputs.susdSize.toString(),
	}
}

export const unserializeTradeInputs = (tradeInputs: TradeSizeInputs<string>): TradeSizeInputs => {
	return {
		nativeSize: wei(tradeInputs.nativeSize || 0),
		susdSize: wei(tradeInputs.susdSize || 0),
	}
}

export const serializeConditionalOrders = (
	orders: ConditionalOrder[]
): ConditionalOrder<string>[] => {
	return orders.map((o) => ({
		...o,
		size: o.size.toString(),
		desiredFillPrice: o.desiredFillPrice.toString(),
		targetPrice: o.targetPrice?.toString() ?? null,
		marginDelta: o.marginDelta.toString(),
	}))
}

export const unserializeConditionalOrders = (
	orders: ConditionalOrder<string>[]
): ConditionalOrder[] => {
	return orders.map((o) => ({
		...o,
		size: wei(o.size),
		targetPrice: o.targetPrice ? wei(o.targetPrice) : null,
		desiredFillPrice: wei(o.desiredFillPrice || 0),
		marginDelta: wei(o.marginDelta),
	}))
}

export const serializeDelayedOrder = (
	order: DelayedOrderWithDetails
): DelayedOrderWithDetails<string> => ({
	...order,
	size: order.size.toString(),
	commitDeposit: order.commitDeposit.toString(),
	keeperDeposit: order.keeperDeposit.toString(),
	desiredFillPrice: order.desiredFillPrice.toString(),
	targetRoundId: order.targetRoundId?.toString() ?? '',
})

export const serializeDelayedOrders = (
	orders: DelayedOrderWithDetails[]
): DelayedOrderWithDetails<string>[] => orders.map((o) => serializeDelayedOrder(o))

export const unserializeDelayedOrder = (
	order: DelayedOrderWithDetails<string>
): DelayedOrderWithDetails => ({
	...order,
	size: wei(order.size),
	commitDeposit: wei(order.commitDeposit),
	keeperDeposit: wei(order.keeperDeposit),
	desiredFillPrice: wei(order.desiredFillPrice),
	targetRoundId: wei(order.targetRoundId),
})

export const unserializeDelayedOrders = (
	orders: DelayedOrderWithDetails<string>[]
): DelayedOrderWithDetails[] => orders.map((o) => unserializeDelayedOrder(o))

export const serializeV3AsyncOrder = (order: PerpsV3AsyncOrder): PerpsV3AsyncOrder<string> => ({
	...order,
	sizeDelta: order.sizeDelta.toString(),
	acceptablePrice: order.sizeDelta.toString(),
})

export const unserializeV3AsyncOrder = (order: PerpsV3AsyncOrder<string>): PerpsV3AsyncOrder => ({
	...order,
	sizeDelta: wei(order.sizeDelta),
	acceptablePrice: wei(order.sizeDelta),
})

export const serializePrices = (prices: PricesMap) => {
	return Object.entries(prices).reduce<PricesMap<string>>((acc, [key, price]) => {
		acc[key as FuturesMarketAsset] = price.toString()
		return acc
	}, {})
}

export const serializeV3Positions = (positions: PerpsV3Position[]): PerpsV3Position<string>[] => {
	return positions.map((p) => ({
		...p,
		accruedFunding: p.accruedFunding.toString(),
		profitLoss: p.profitLoss.toString(),
		size: p.size.toString(),
		pnl: p.pnl.toString(),
		pnlPct: p.pnlPct.toString(),
	}))
}

export const unserializeV3Positions = (positions: PerpsV3Position<string>[]): PerpsV3Position[] => {
	return positions.map((p) => ({
		...p,
		accruedFunding: wei(p.accruedFunding),
		profitLoss: wei(p.profitLoss),
		size: wei(p.size),
		pnl: wei(p.pnl),
		pnlPct: wei(p.pnlPct),
	}))
}

export const serializePositionHistory = (
	positions: FuturesPositionHistory[]
): FuturesPositionHistory<string>[] => {
	return positions.map((p) => ({
		...p,
		size: p.size.toString(),
		feesPaid: p.feesPaid.toString(),
		netFunding: p.netFunding.toString(),
		netTransfers: p.netTransfers.toString(),
		totalDeposits: p.totalDeposits.toString(),
		initialMargin: p.initialMargin.toString(),
		margin: p.margin.toString(),
		entryPrice: p.entryPrice.toString(),
		exitPrice: p.exitPrice.toString(),
		pnl: p.pnl.toString(),
		pnlWithFeesPaid: p.pnlWithFeesPaid.toString(),
		totalVolume: p.totalVolume.toString(),
		avgEntryPrice: p.avgEntryPrice.toString(),
		leverage: p.leverage.toString(),
	}))
}

export const unserializePositionHistory = (
	positions: FuturesPositionHistory<string>[]
): FuturesPositionHistory[] => {
	return positions.map((p) => ({
		...p,
		size: wei(p.size),
		feesPaid: wei(p.feesPaid),
		netFunding: wei(p.netFunding),
		netTransfers: wei(p.netTransfers),
		totalDeposits: wei(p.totalDeposits),
		initialMargin: wei(p.initialMargin),
		margin: wei(p.margin),
		entryPrice: wei(p.entryPrice),
		exitPrice: wei(p.exitPrice),
		pnl: wei(p.pnl),
		pnlWithFeesPaid: wei(p.pnlWithFeesPaid),
		totalVolume: wei(p.totalVolume),
		avgEntryPrice: wei(p.avgEntryPrice),
		leverage: wei(p.leverage),
	}))
}

export const serializeTrades = (trades: FuturesTrade[]): FuturesTrade<string>[] => {
	return trades.map((t) => ({
		...t,
		margin: t.margin.toString(),
		size: t.size.toString(),
		price: t.price.toString(),
		positionSize: t.positionSize.toString(),
		pnl: t.pnl.toString(),
		feesPaid: t.feesPaid.toString(),
		keeperFeesPaid: t.keeperFeesPaid.toString(),
		fundingAccrued: t.fundingAccrued.toString(),
	}))
}

export const unserializeTrades = (trades: FuturesTrade<string>[]): FuturesTrade<Wei>[] => {
	return trades.map((t) => ({
		...t,
		margin: wei(t.margin),
		size: wei(t.size),
		price: wei(t.price),
		positionSize: wei(t.positionSize),
		pnl: wei(t.pnl),
		feesPaid: wei(t.feesPaid),
		keeperFeesPaid: wei(t.keeperFeesPaid),
		fundingAccrued: wei(t.fundingAccrued),
	}))
}

export const unserializeFundingRates = (rates: FundingRate<string>[]): FundingRate[] => {
	return rates.map((r) => ({ ...r, fundingRate: r.fundingRate ? wei(r.fundingRate) : null }))
}

export const formatDelayedOrders = (orders: DelayedOrder[], markets: PerpsMarketV2[]) => {
	return orders
		.filter((o) => o.size.abs().gt(0))
		.reduce((acc, o) => {
			const market = markets.find((m) => m.marketAddress === o.marketAddress)
			if (!market) return acc

			acc.push({
				...o,
				marketKey: market.marketKey,
				asset: market.asset,
				market: getMarketName(market.asset),
				executableAtTimestamp:
					market && o.isOffchain // Manual fix for an incorrect
						? o.submittedAtTimestamp +
						  (o.isOffchain
								? market.settings.offchainDelayedOrderMinAge * 1000
								: market.settings.minDelayTimeDelta * 1000)
						: o.executableAtTimestamp,
			})
			return acc
		}, [] as DelayedOrderWithDetails[])
}

export const serializeCrossMarginTradePreview = (
	preview: CrossMarginTradePreview
): CrossMarginTradePreview<string> => ({
	...preview,
	settlementFee: preview.settlementFee.toString(),
	sizeDelta: preview.sizeDelta.toString(),
	fillPrice: preview.fillPrice.toString(),
	fee: preview.fee.toString(),
	leverage: preview.leverage.toString(),
	notionalValue: preview.notionalValue.toString(),
	priceImpact: preview.priceImpact.toString(),
})

export const unserializeCrossMarginTradePreview = (
	preview: CrossMarginTradePreview<string>
): CrossMarginTradePreview => ({
	...preview,
	settlementFee: wei(preview.settlementFee),
	sizeDelta: wei(preview.sizeDelta),
	fillPrice: wei(preview.fillPrice),
	fee: wei(preview.fee),
	leverage: wei(preview.leverage),
	notionalValue: wei(preview.notionalValue),
	priceImpact: wei(preview.priceImpact),
})
// Disable stop loss when it is within 0% of the liquidation price
const SL_LIQ_DISABLED_PERCENT = 0

// Warn users when their stop loss is within 7.5% of their liquidation price
const SL_LIQ_PERCENT_WARN = 0.075

export const minMaxSLPrice = (liqPrice: Wei | undefined, leverageSide: PositionSide) => {
	return leverageSide === PositionSide.LONG
		? liqPrice?.mul(1 + SL_LIQ_DISABLED_PERCENT)
		: liqPrice?.mul(1 - SL_LIQ_DISABLED_PERCENT)
}

export const stopLossValidity = (
	stopLossPrice: string,
	liqPrice: Wei | undefined,
	side: PositionSide,
	currentPrice: Wei
) => {
	const minMaxStopPrice = minMaxSLPrice(liqPrice, side)

	if (stopLossPrice === '' || stopLossPrice === undefined)
		return {
			invalid: false,
			minMaxStopPrice,
		}

	if (!minMaxStopPrice || !liqPrice || liqPrice.eq(0))
		return { invalid: false, minMaxStopPrice, invalidReason: 'no_liquidation_price' }

	let invalid = false
	if (side === 'long') {
		invalid =
			wei(stopLossPrice || 0).gt(currentPrice) || wei(stopLossPrice || 0).lt(minMaxStopPrice || 0)
	} else {
		invalid =
			wei(stopLossPrice || 0).lt(currentPrice) || wei(stopLossPrice || 0).gt(minMaxStopPrice || 0)
	}

	const percent = wei(stopLossPrice || 0)
		.div(liqPrice)
		.sub(1)
		.abs()

	return {
		invalid,
		minMaxStopPrice,
		invalidReason: invalid ? 'exceeds_max_stop' : undefined,
		showWarning: percent.lt(SL_LIQ_PERCENT_WARN),
	}
}
