import { PositionSide, SynthV3Asset } from '@kwenta/sdk/types'
import { MarketKeyByAsset } from '@kwenta/sdk/utils'
import { createSelector } from '@reduxjs/toolkit'
import Wei, { wei } from '@synthetixio/wei'

import { selectPrices } from 'state/prices/selectors'
import { RootState } from 'state/store'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import {
	unserializeMarkets,
	unserializePositionHistory,
	unserializeTradeInputs,
	unserializeTrades,
	updatePositionUpnl,
} from 'utils/futures'

import { MarkPrices } from './types'
import { selectSynthV3Balances } from 'state/balances/selectors'

export const selectV3MarketKey = createSelector(
	(state: RootState) => state.crossMargin.selectedMarketAsset,
	(marketAsset) => MarketKeyByAsset[marketAsset]
)

export const selectV3Markets = createSelector(
	selectNetwork,
	(state: RootState) => state.crossMargin,
	(network, crossMargin) =>
		crossMargin.markets[network] ? unserializeMarkets(crossMargin.markets[network]) : []
)

export const selectV3MarketInfo = createSelector(
	selectV3Markets,
	selectV3MarketKey,
	(markets, selectedMarket) => {
		return markets.find((market) => market.marketKey === selectedMarket)
	}
)

export const selectCrossMarginSupportedNetwork = (state: RootState) =>
	state.wallet.networkId === 10 || state.wallet.networkId === 420

export const selectCrossMarginAccount = createSelector(
	selectWallet,
	selectNetwork,
	(state: RootState) => state.crossMargin,
	(wallet, network, crossMargin) => {
		return wallet ? crossMargin.accounts[network]?.[wallet]?.account : undefined
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
		return account?.marginTransfers ?? []
	}
)

export const selectMarkPrices = createSelector(selectV3Markets, selectPrices, (markets, prices) => {
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
})

export const selectCrossMarginPositions = createSelector(
	selectMarkPrices,
	selectCrossMarginAccountData,
	selectCrossMarginPositionHistory,
	(prices, account, positionHistory) => {
		return account?.positions?.map((p) => updatePositionUpnl(p, prices, positionHistory)) ?? []
	}
)

export const selectOpenDelayedOrdersV3 = createSelector(selectCrossMarginAccount, (_) => {
	// TODO: Hook up pending v3 orders
	return []
})

export const selectShowCrossMarginOnboard = (state: RootState) =>
	state.app.showModal === 'futures_cross_margin_onboard'

export const selectWithdrawableCrossMargin = createSelector(
	(state: RootState) => state.crossMargin,
	(_) => {
		// TODO: Hook up withdrawable cross margin
		return wei(0)
	}
)
