import {
	ConditionalOrder,
	FuturesFilledPosition,
	FuturesPositionHistory,
	PerpsMarketV2,
	PerpsMarketV3,
} from '@kwenta/sdk/types'
import Wei from '@synthetixio/wei'

export type FuturesPositionWithDetails = FuturesFilledPosition & {
	details?: FuturesPositionHistory
}

export type FuturesPositionTablePositionCommon = {
	market: PerpsMarketV2 | PerpsMarketV3
	remainingMargin?: Wei
	stopLoss?: ConditionalOrder
	takeProfit?: ConditionalOrder
}

export type FuturesPositionTablePositionActive = FuturesPositionTablePositionCommon & {
	activePosition: FuturesPositionWithDetails
}

export type FuturesPositionTablePosition = FuturesPositionTablePositionCommon & {
	activePosition?: FuturesPositionWithDetails | null
}
