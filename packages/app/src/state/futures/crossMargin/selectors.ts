import { ZERO_WEI } from '@kwenta/sdk/constants'
import { PositionSide, SynthV3Asset } from '@kwenta/sdk/types'
import {
	MarketKeyByAsset,
	calculateDesiredFillPrice,
	getDefaultPriceImpact,
} from '@kwenta/sdk/utils'
import { createSelector } from '@reduxjs/toolkit'
import Wei, { wei } from '@synthetixio/wei'
import { FuturesPositionTablePosition, FuturesPositionTablePositionActive } from 'types/futures'

import { DEFAULT_DELAYED_CANCEL_BUFFER } from 'constants/defaults'
import { selectSynthV3Balances } from 'state/balances/selectors'
import { selectOffchainPricesInfo, selectPrices } from 'state/prices/selectors'
import { RootState } from 'state/store'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import {
	unserializePositionHistory,
	unserializeTradeInputs,
	unserializeTrades,
	unserializeV3AsyncOrder,
	unserializeV3Market,
	unserializeV3Positions,
} from 'utils/futures'

import { unserializeCrossMarginTradePreview } from '../../../utils/futures'
import { selectMarketIndexPrice, selectMarketPriceInfo } from '../common/selectors'
import { MarkPriceInfos } from '../types'

import { AsyncOrderWithDetails, MarkPrices } from './types'

export const selectV3MarketKey = createSelector(
	(state: RootState) => state.crossMargin.selectedMarketAsset,
	(marketAsset) => MarketKeyByAsset[marketAsset]
)

export const selectV3Markets = createSelector(
	selectNetwork,
	(state: RootState) => state.crossMargin,
	(network, crossMargin) => {
		const markets = crossMargin.markets[network] ? crossMargin.markets[network] : []
		return markets.map(unserializeV3Market)
	}
)

export const selectV3MarketInfo = createSelector(
	selectV3Markets,
	selectV3MarketKey,
	(markets, selectedMarket) => {
		return markets.find((market) => market.marketKey === selectedMarket)
	}
)

export const selectV3MarketId = createSelector(
	selectV3MarketInfo,
	(marketInfo) => marketInfo?.marketId
)

export const selectCrossMarginSupportedNetwork = (state: RootState) =>
	// TODO: Add support for mainnet
	state.wallet.networkId === 420

export const selectCrossMarginAccount = createSelector(
	selectWallet,
	selectNetwork,
	(state: RootState) => state.crossMargin,
	(wallet, network, crossMargin) => {
		return wallet ? crossMargin.accounts[network]?.[wallet]?.account : undefined
	}
)

export const selectAccountContext = createSelector(
	selectWallet,
	selectNetwork,
	selectCrossMarginAccount,
	(wallet, network, accountId) => {
		return { wallet, network, accountId }
	}
)

export const selectCrossMarginAccountData = createSelector(
	selectWallet,
	selectNetwork,
	selectCrossMarginSupportedNetwork,
	(state: RootState) => state.crossMargin,
	(wallet, network, supportedNetwork, crossMargin) => {
		return wallet && supportedNetwork ? crossMargin.accounts[network][wallet] : null
	}
)

export const selectCrossMarginAvailableMargin = createSelector(
	selectCrossMarginAccountData,
	(account) => {
		return wei(account?.availableMargin || 0)
	}
)

export const selectV3ProxyAddress = createSelector(
	(state: RootState) => state.crossMargin,
	(crossMargin) => crossMargin.perpsV3MarketProxyAddress
)

export const selectDepositAllowances = createSelector(
	selectV3ProxyAddress,
	selectSynthV3Balances,
	(proxyAddress, balancesAndAllowances) => {
		if (!proxyAddress) return {}
		return Object.keys(balancesAndAllowances).reduce<Partial<Record<SynthV3Asset, Wei>>>(
			(acc, asset) => {
				const key = asset as SynthV3Asset
				acc[key] = balancesAndAllowances[key]!.allowances[proxyAddress]
				return acc
			},
			{}
		)
	}
)

export const selectCrossMarginPositionHistory = createSelector(
	selectCrossMarginAccountData,
	(accountData) => {
		return unserializePositionHistory(accountData?.positionHistory ?? [])
	}
)

export const selectCrossMarginLeverageSide = (state: RootState) => state.crossMargin.leverageSide

export const selectCrossMarginTradeInputs = createSelector(
	selectCrossMarginLeverageSide,
	(state: RootState) => state.crossMargin.tradeInputs,
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

export const selectAllCrossMarginTrades = createSelector(
	selectCrossMarginAccountData,
	selectV3Markets,
	(isolatedAccountData, markets) => {
		const trades = unserializeTrades(isolatedAccountData?.trades ?? [])
		return trades.map((t) => {
			const market = markets.find((m) => m.asset === t.asset)
			return {
				...t,
				market: market,
			}
		})
	}
)

export const selectCrossMarginMarginTransfers = createSelector(
	selectWallet,
	selectNetwork,
	(state: RootState) => state.crossMargin,
	(wallet, network, futures) => {
		if (!wallet) return []
		const account = futures.accounts[network]?.[wallet]
		return account?.marketMarginTransfers ?? []
	}
)

export const selectMarkPricesV3 = createSelector(
	selectV3Markets,
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

export const selectMarkPriceInfosV3 = createSelector(
	selectV3Markets,
	selectOffchainPricesInfo,
	(markets, prices) => {
		const markPrices: MarkPriceInfos = {}
		return markets.reduce((acc, market) => {
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

export const selectCrossMarginPositions = createSelector(
	selectCrossMarginAccountData,
	selectV3Markets,
	selectMarkPricesV3,
	(account, markets, markPrices) => {
		const positions = unserializeV3Positions(account?.positions ?? [])
		return positions.reduce<FuturesPositionTablePosition[]>((acc, position) => {
			const market = markets.find((market) => market.marketId === position.marketId)

			if (market) {
				const markPrice = markPrices[market?.marketKey!] ?? wei(0)

				acc.push({
					market: market,
					activePosition: {
						...position,
						// TODO: Liquidation state
						canLiquidatePosition: false,
						liquidationPrice: wei(0),
						notionalValue: position.size.mul(markPrice),
						lastPrice: markPrice,
						initialMargin: wei(0),
						leverage: wei(0),
						marginRatio: wei(0),
						fundingIndex: 0,
						initialLeverage: wei(0),
						// TODO: Map position history from subgraph ata
						details: undefined,
					},
				})
			}
			return acc
		}, [])
	}
)

export const selectCrossMarginActivePositions = createSelector(
	selectCrossMarginPositions,
	(positions) => {
		return positions.filter((p) => !!p.activePosition) as FuturesPositionTablePositionActive[]
	}
)

export const selectSelectedCrossMarginPosition = createSelector(
	selectCrossMarginActivePositions,
	selectV3MarketInfo,
	(positions, market) => {
		const position = positions.find((p) => p.market.marketKey === market?.marketKey)
		return position
	}
)

export const selectAsyncCrossMarginOrders = createSelector(
	selectV3Markets,
	selectCrossMarginAccountData,
	(markets, account) => {
		return (account?.asyncOrders.map(unserializeV3AsyncOrder) ?? []).reduce<
			AsyncOrderWithDetails[]
		>((acc, o) => {
			const market = markets.find((m) => m.marketId === o.marketId)

			const strategy = market?.settlementStrategies.find(
				(s) => s.strategyId === o.settlementStrategyId
			)
			if (account && market && strategy) {
				const startTime = Number(o.settlementTime)
				const expirationTime = startTime + Number(strategy.settlementWindowDuration)
				const timePastExecution = Math.floor((Date.now() - startTime) / 1000)
				const executable = timePastExecution <= expirationTime
				const isStale =
					timePastExecution >
					DEFAULT_DELAYED_CANCEL_BUFFER + strategy.settlementWindowDuration.toNumber()

				const order = {
					market,
					account: Number(account.account),
					size: o.sizeDelta,
					executableStartTime: startTime,
					expirationTime: expirationTime,
					marginDelta: wei(0),
					desiredFillPrice: wei(o.acceptablePrice),
					settlementWindowDuration: strategy.settlementWindowDuration.toNumber(),
					side: o.side,
					isStale: isStale,
					isExecutable: executable,
					settlementFee: strategy.settlementReward,
				}
				acc.push(order)
			}
			return acc
		}, [])
	}
)

export const selectShowCrossMarginOnboard = (state: RootState) =>
	state.app.showModal === 'futures_cross_margin_onboard'

export const selectWithdrawableCrossMargin = createSelector(
	selectCrossMarginAvailableMargin,
	(available) => {
		// TODO: Calculate withdrawable based on maintenance margin
		return available
	}
)

export const selectCrossMarginTradePreview = createSelector(
	selectCrossMarginTradeInputs,
	(state: RootState) => state.crossMargin.previews.trade,
	({ nativeSizeDelta }, preview) => {
		const priceImpact = getDefaultPriceImpact('market')
		const desiredFillPrice = calculateDesiredFillPrice(
			nativeSizeDelta,
			wei(preview?.fillPrice || 0),
			priceImpact
		)

		const unserialized = preview ? unserializeCrossMarginTradePreview(preview) : undefined
		return {
			...unserialized,
			desiredFillPrice,
		}
	}
)

// TODO: Correct max leverage calc for V3
export const selectCrossMarginMaxLeverage = createSelector(selectV3MarketInfo, (market) => {
	let adjustedMaxLeverage = market?.appMaxLeverage ?? wei(1)
	return adjustedMaxLeverage
})

export const selectEditCMPositionModalMarketId = (state: RootState) =>
	state.app.showPositionModal?.marketKey

export const selectCloseCMPositionModalInfo = createSelector(
	selectEditCMPositionModalMarketId,
	selectCrossMarginActivePositions,
	selectV3Markets,
	selectPrices,
	(marketKey, crossPositions, markets, prices) => {
		const position = crossPositions.find(
			(p) => p.market.version === 3 && p.market.marketKey === marketKey
		)
		const market = markets.find((m) => m.marketKey === marketKey)
		if (!market) return { position: null, market: null, marketPrice: wei(0) }
		const price = prices[market.asset]
		// Note this assumes the order type is always delayed off chain
		return { position, market, marketPrice: price.offChain || wei(0) }
	}
)

export const selectCloseCMPositionOrderInputs = createSelector(
	(state: RootState) => state.crossMargin,
	(crossMargin) => {
		return crossMargin.closePositionOrderInputs
	}
)

export const selectCloseCMPositionPreview = createSelector(
	selectCloseCMPositionModalInfo,
	(state: RootState) => state.crossMargin,
	({ position, marketPrice }, crossMargin) => {
		const preview = crossMargin.previews.close
		const unserialized = preview ? unserializeCrossMarginTradePreview(preview) : null
		if (unserialized) {
			const priceImpact = getDefaultPriceImpact('market')
			const desiredFillPrice = calculateDesiredFillPrice(
				position?.activePosition.side === PositionSide.LONG ? wei(-1) : wei(1),
				marketPrice,
				priceImpact
			)

			return {
				...unserialized,
				price: marketPrice,
				desiredFillPrice,
				leverage: wei(0),
			}
		}
		return null
	}
)

export const selectPendingAsyncOrdersCount = createSelector(
	selectAsyncCrossMarginOrders,
	(orders) => {
		return orders.length
	}
)

export const selectActiveCrossMarginPositionsCount = createSelector(
	selectCrossMarginPositions,
	(positions) => {
		return positions.filter((p) => !!p).length
	}
)

export const selectV3SkewAdjustedPrice = createSelector(
	selectMarketIndexPrice,
	selectV3MarketInfo,
	(price, marketInfo) => {
		if (!marketInfo?.marketSkew || !marketInfo?.settings.skewScale) return price
		return price
			? wei(price).mul(wei(marketInfo.marketSkew).div(marketInfo.settings.skewScale).add(1))
			: ZERO_WEI
	}
)

export const selectV3SkewAdjustedPriceInfo = createSelector(
	selectMarketPriceInfo,
	selectV3MarketInfo,
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
