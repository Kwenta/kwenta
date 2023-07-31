import { Period } from '@kwenta/sdk/constants'
import {
	TransactionStatus,
	FuturesPositionHistory,
	FuturesMarketKey,
	FuturesMarketAsset,
} from '@kwenta/sdk/types'
import Wei from '@synthetixio/wei'

import { PricesInfo } from 'state/prices/types'
import { QueryStatus } from 'state/types'

import { AppFuturesMarginType, FuturesTransactionType } from './common/types'

export type MarkPrices<T = Wei> = Partial<Record<FuturesMarketKey, T>>

export type MarkPriceInfos<T = Wei> = Partial<Record<FuturesMarketKey, PricesInfo<T>>>

export type FundingRate<T = Wei> = {
	asset: FuturesMarketKey
	fundingTitle: string
	fundingRate: T | null
}

export type FuturesAction = {
	account: string
	timestamp: number
	asset: FuturesMarketAsset
	margin: number
	size: number
	action: 'trade' | 'deposit' | 'withdraw'
}

export type PortfolioValues = {
	timestamp: number
	total: number
}

export type FuturesTransaction = {
	type: FuturesTransactionType
	status: TransactionStatus
	error?: string
	hash: string | null
}

type FuturesNetwork = number

export type InputCurrencyDenomination = 'usd' | 'native'

export type FundingRatePeriods = {
	[key: number]: string
}

export type FuturesState = {
	selectedType: AppFuturesMarginType
	confirmationModalOpen: boolean
	selectedInputDenomination: InputCurrencyDenomination
	selectedInputHours: number
	selectedChart: 'price' | 'funding'
	historicalFundingRatePeriod: Period
	preferences: {
		showHistory?: boolean
	}
	dashboard: {
		selectedPortfolioTimeframe: Period
	}
	leaderboard: {
		selectedTrader?: { trader: string; traderEns?: string | null }
		selectedTraderPositionHistory: Record<
			FuturesNetwork,
			{
				[wallet: string]: FuturesPositionHistory<string>[]
			}
		>
	}
	tradePanelDrawerOpen: boolean
	queryStatuses: {
		selectedTraderPositionHistory: QueryStatus
	}
}

export type ExecuteDelayedOrderInputs = {
	marketKey: FuturesMarketKey
	marketAddress: string
}

export type ExecuteAsyncOrderInputs = {
	marketKey: FuturesMarketKey
	marketId: number
}

export const futuresPositionKeys = new Set([
	'remainingMargin',
	'accessibleMargin',
	'order.fee',
	'order.leverage',
	'position.notionalValue',
	'position.accruedFunding',
	'position.initialMargin',
	'position.profitLoss',
	'position.lastPrice',
	'position.size',
	'position.liquidationPrice',
	'position.initialLeverage',
	'position.leverage',
	'position.pnl',
	'position.pnlPct',
	'position.marginRatio',
])
