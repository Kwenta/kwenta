import {
	NetworkId,
	TransactionStatus,
	SmartMarginOrderType,
	FuturesPositionHistory,
	FuturesPotentialTradeDetails,
	PositionSide,
	ConditionalOrder as SmartMarginOrder,
	FuturesMarketKey,
	FuturesMarketAsset,
	MarginTransfer,
	FuturesFilledPosition,
	FuturesMarginType,
} from '@kwenta/sdk/types'
import Wei from '@synthetixio/wei'

import { PricesInfo } from 'state/prices/types'
import { QueryStatus } from 'state/types'
import { FuturesAccountData, FuturesTransactionType } from '../shared.ts/types'

type excludedOptions = typeof FuturesMarginType.ISOLATED_MARGIN_LEGACY
export type AppFuturesMarginType = Exclude<FuturesMarginType, excludedOptions>

export type TradeSizeInputs<T = Wei> = {
	nativeSize: T
	susdSize: T
}

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

export type FuturesAction = {
	account: string
	timestamp: number
	asset: FuturesMarketAsset
	margin: number
	size: number
	action: 'trade' | 'deposit' | 'withdraw'
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

export type FuturesQueryStatuses = {
	markets: QueryStatus
	smartMarginBalanceInfo: QueryStatus
	dailyVolumes: QueryStatus
	smartMarginPositions: QueryStatus
	smartMarginPositionHistory: QueryStatus
	openOrders: QueryStatus
	smartMarginTradePreview: QueryStatus
	smartMarginAccount: QueryStatus
	positionHistory: QueryStatus
	trades: QueryStatus
	selectedTraderPositionHistory: QueryStatus
	marginTransfers: QueryStatus
	historicalFundingRates: QueryStatus
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

export type AccountContext = {
	type: AppFuturesMarginType
	network: NetworkId
	wallet: string
	cmAccount?: string
}

export type PreviewAction = 'edit' | 'trade' | 'close'

export type SmartMarginAccountData = FuturesAccountData & {
	idleTransfers: MarginTransfer[]
	balanceInfo: SmartMarginBalanceInfo<string>
	conditionalOrders: SmartMarginOrder<string>[]
}

export type SmartMarginState = {
	tradeInputs: SmartMarginTradeInputs<string>
	editPositionInputs: EditPositionInputs<string>
	sltpModalInputs: SLTPInputs<string>
	marginDelta: string
	orderType: SmartMarginOrderType
	orderFeeCap: string
	leverageInput: string
	selectedLeverageByAsset: Partial<Record<FuturesMarketKey, string>>
	leverageSide: PositionSide
	selectedMarketKey: FuturesMarketKey
	selectedMarketAsset: FuturesMarketAsset
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
}

export type SharePositionParams = {
	asset?: FuturesMarketAsset
	position?: FuturesFilledPosition
	positionHistory?: FuturesPositionHistory
	marketPrice?: Wei
}
