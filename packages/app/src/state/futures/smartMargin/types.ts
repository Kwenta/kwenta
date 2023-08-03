import {
	TransactionStatus,
	SmartMarginOrderType,
	FuturesPositionHistory,
	FuturesPotentialTradeDetails,
	PositionSide,
	ConditionalOrder as SmartMarginOrder,
	FuturesMarketKey,
	FuturesMarketAsset,
	MarginTransfer,
	FuturesVolumes,
	PerpsMarketV2,
	PerpsV2Position,
} from '@kwenta/sdk/types'
import Wei from '@synthetixio/wei'

import { PricesInfo } from 'state/prices/types'

import {
	DelayedOrderWithDetails,
	FuturesAccountData,
	FuturesTransactionType,
	HistoricalFundingRates,
	SmartMarginQueryStatuses,
	TradeSizeInputs,
} from '../common/types'

export type SLTPInputs<T = Wei> = {
	stopLossPrice?: T
	takeProfitPrice?: T
}

export type SmartMarginTradeInputs<T = Wei> = TradeSizeInputs<T> & {
	stopLossPrice?: T
	takeProfitPrice?: T
}

export type EditPositionInputs<T = Wei> = {
	nativeSizeDelta: T
	marginDelta: T
}

export type ClosePositionInputs<T = Wei> = {
	nativeSizeDelta: T
	price?: {
		value?: string | undefined | null
		invalidLabel: string | undefined | null
	}
	orderType: SmartMarginOrderType
}

export type MarkPrices<T = Wei> = Partial<Record<FuturesMarketKey, T>>

export type MarkPriceInfos<T = Wei> = Partial<Record<FuturesMarketKey, PricesInfo<T>>>

export type FundingRate<T = Wei> = {
	asset: FuturesMarketKey
	fundingTitle: string
	fundingRate: T | null
}

export type SmartPerpsPortfolio = {
	account: string
	timestamp: number
	assets: {
		[asset: string]: number
	}
	idle: number
	total: number
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

export type SmartMarginBalanceInfo<T = Wei> = {
	freeMargin: T
	keeperEthBal: T
	allowance: T
	walletEthBal: T
}

export type SmartMarginTradeFees<T = Wei> = {
	delayedOrderFee: T
	keeperEthDeposit: T
}

type FuturesNetwork = number

export type InputCurrencyDenomination = 'usd' | 'native'

export type FundingRatePeriods = {
	[key: number]: string
}

export type SmartMarginAccountData = FuturesAccountData & {
	account: string
	idleTransfers: MarginTransfer[]
	balanceInfo: SmartMarginBalanceInfo<string>
	conditionalOrders: SmartMarginOrder<string>[]
	delayedOrders: DelayedOrderWithDetails<string>[]
	position?: PerpsV2Position<string>
	positions?: PerpsV2Position<string>[]
	positionHistory?: FuturesPositionHistory<string>[]
}

export type SmartMarginState = {
	markets: Record<FuturesNetwork, PerpsMarketV2<string>[]>
	selectedMarketAsset: FuturesMarketAsset
	dailyMarketVolumes: FuturesVolumes<string>
	fundingRates: FundingRate<string>[]
	historicalFundingRates: HistoricalFundingRates
	queryStatuses: SmartMarginQueryStatuses
	tradeInputs: SmartMarginTradeInputs<string>
	editPositionInputs: EditPositionInputs<string>
	closePositionOrderInputs: ClosePositionInputs<string>
	sltpModalInputs: SLTPInputs<string>
	marginDelta: string
	orderType: SmartMarginOrderType
	orderFeeCap: string
	leverageInput: string
	selectedLeverageByAsset: Partial<Record<FuturesMarketKey, string>>
	leverageSide: PositionSide
	showSmartMarginOnboard: boolean
	previews: {
		trade: FuturesPotentialTradeDetails<string> | null
		close: FuturesPotentialTradeDetails<string> | null
		edit: FuturesPotentialTradeDetails<string> | null
	}
	previewDebounceCount: number
	fees: SmartMarginTradeFees<string>
	depositApproved: boolean
	cancellingOrder: number | undefined
	accounts: Record<
		FuturesNetwork,
		{
			[wallet: string]: SmartMarginAccountData
		}
	>

	orderPrice: {
		price?: string | undefined | null
		invalidLabel: string | undefined | null
	}
	futuresFees: string
	futuresFeesForAccount: string
}
