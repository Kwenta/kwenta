import {
	ConditionalOrder,
	FuturesPositionHistory,
	PerpsMarketV2,
	PerpsMarketV3,
	PositionSide,
} from '@kwenta/sdk/types'
import Wei from '@synthetixio/wei'

export type FuturesPositionTablePosition = {
	market: PerpsMarketV2 | PerpsMarketV3
	remainingMargin?: Wei
	canLiquidatePosition?: boolean
	side: PositionSide
	notionalValue: Wei
	accruedFunding: Wei
	initialMargin?: Wei
	size: Wei
	liquidationPrice?: Wei
	leverage?: Wei
	pnl: Wei
	pnlPct: Wei
	marginRatio: Wei
	avgEntryPrice: Wei
	lastPrice: Wei
	stopLoss?: ConditionalOrder
	takeProfit?: ConditionalOrder
	history?: FuturesPositionHistory
}
