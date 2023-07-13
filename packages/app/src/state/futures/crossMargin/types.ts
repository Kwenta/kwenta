import { Period } from '@kwenta/sdk/constants'
import {
	TransactionStatus,
	FuturesPositionHistory,
	FuturesPotentialTradeDetails,
	FuturesVolumes,
	PositionSide,
	FuturesMarketKey,
	FuturesMarketAsset,
	FuturesFilledPosition,
	FuturesMarket,
} from '@kwenta/sdk/types'
import Wei from '@synthetixio/wei'

import { PricesInfo } from 'state/prices/types'

import { FuturesAccountData, FuturesQueryStatuses, TradeSizeInputs } from '../common/types'

export type EditPositionInputs<T = Wei> = {
	nativeSizeDelta: T
	marginDelta: T
}

export type ClosePositionInputs<T = Wei> = {
	nativeSizeDelta: T
}

export type MarkPrices<T = Wei> = Partial<Record<FuturesMarketKey, T>>

export type MarkPriceInfos<T = Wei> = Partial<Record<FuturesMarketKey, PricesInfo<T>>>

export type FundingRate<T = Wei> = {
	asset: FuturesMarketKey
	fundingTitle: string
	fundingRate: T | null
}

export type PerpsV3Portfolio = {
	account: string
	timestamp: number
	assets: {
		[asset: string]: number
	}
	total: number
}

export type PortfolioValues = {
	timestamp: number
	total: number
}

export type CrossMarginTransactionType =
	| 'deposit_perps_v3'
	| 'withdraw_perps_v3'
	| 'approve_perps_v3'
	| 'modify_perps_v3'
	| 'close_perps_v3'
	| 'cancel_delayed_perps_v3'
	| 'execute_delayed_perps_v3'
	| 'create_account_perps_v3'

export type CrossMarginTransaction = {
	type: CrossMarginTransactionType
	status: TransactionStatus
	error?: string
	hash: string | null
}

type FuturesNetwork = number

export type InputCurrencyDenomination = 'usd' | 'native'

export type FundingRatePeriods = {
	[key: number]: string
}

export type CrossMarginAccountData = FuturesAccountData & {
	balances: { [asset: string]: { balance: Wei; allowance: Wei } }
}

export type CrossMarginState = {
	markets: Record<FuturesNetwork, FuturesMarket<string>[]>
	tradeInputs: TradeSizeInputs<string>
	editPositionInputs: EditPositionInputs<string>
	orderType: 'market'
	previews: {
		trade: FuturesPotentialTradeDetails<string> | null
		close: FuturesPotentialTradeDetails<string> | null
		edit: FuturesPotentialTradeDetails<string> | null
	}
	confirmationModalOpen: boolean
	closePositionOrderInputs: ClosePositionInputs<string>
	previewDebounceCount: number
	leverageSide: PositionSide
	selectedMarketAsset: FuturesMarketAsset
	leverageInput: string
	tradeFee: string
	perpsV3MarketProxyAddress: string | undefined
	accounts: Record<
		FuturesNetwork,
		{
			[wallet: string]: CrossMarginAccountData
		}
	>
	fundingRates: FundingRate<string>[]
	queryStatuses: FuturesQueryStatuses
	dailyMarketVolumes: FuturesVolumes<string>
	selectedInputDenomination: InputCurrencyDenomination
	selectedInputHours: number
	selectedChart: 'price' | 'funding'
	preferences: {
		showHistory?: boolean
	}
	dashboard: {
		selectedPortfolioTimeframe: Period
	}
	leaderboard: {
		selectedTrader: string | undefined
		selectedTraderPositionHistory: Record<
			FuturesNetwork,
			{
				[wallet: string]: FuturesPositionHistory<string>[]
			}
		>
	}
	historicalFundingRates: Partial<
		Record<FuturesMarketAsset, { timestamp: string; funding: string }[]>
	>
}

export type SharePositionParams = {
	asset?: FuturesMarketAsset
	position?: FuturesFilledPosition
	positionHistory?: FuturesPositionHistory
	marketPrice?: Wei
}

export type CrossPerpsPortfolio = {
	account: string
	timestamp: number
	assets: {
		[asset: string]: number
	}
	total: number
}
