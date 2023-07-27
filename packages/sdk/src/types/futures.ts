import Wei from '@synthetixio/wei'
import { BigNumber } from 'ethers'

export type FundingRateInput = {
	marketAddress: string | undefined
	marketKey: FuturesMarketKey
	price: Wei | undefined
	currentFundingRate: Wei | undefined
}

export type SynthSuspensionReason =
	| 'system-upgrade'
	| 'market-closure'
	| 'circuit-breaker'
	| 'emergency'

export type MarketClosureReason = SynthSuspensionReason

export type FuturesMarket<T = Wei> = {
	market: string
	marketKey: FuturesMarketKey
	marketName: string
	asset: FuturesMarketAsset
	assetHex: string
	currentFundingRate: T
	currentFundingVelocity: T
	feeRates: {
		makerFee: T
		takerFee: T
		makerFeeDelayedOrder: T
		takerFeeDelayedOrder: T
		makerFeeOffchainDelayedOrder: T
		takerFeeOffchainDelayedOrder: T
	}
	openInterest: {
		shortPct: number
		longPct: number
		shortUSD: T
		longUSD: T
		long: T
		short: T
	}
	marketDebt: T
	marketSkew: T
	marketSize: T
	contractMaxLeverage: T
	appMaxLeverage: T
	minInitialMargin: T
	keeperDeposit: T
	isSuspended: boolean
	marketClosureReason: SynthSuspensionReason
	marketLimitUsd: T
	marketLimitNative: T
	settings: {
		maxMarketValue: T
		skewScale: T
		delayedOrderConfirmWindow: number
		offchainDelayedOrderMinAge: number
		offchainDelayedOrderMaxAge: number
		minDelayTimeDelta: number
		maxDelayTimeDelta: number
	}
}

export type FundingRateUpdate = {
	funding: Wei
	timestamp: number
}

export type FundingRateResponse = {
	asset: FuturesMarketKey
	fundingTitle: string
	fundingRate: Wei | null
}

export enum FuturesMarketKey {
	sBTCPERP = 'sBTCPERP',
	sETHPERP = 'sETHPERP',
	sLINKPERP = 'sLINKPERP',
	sSOLPERP = 'sSOLPERP',
	sAVAXPERP = 'sAVAXPERP',
	sAAVEPERP = 'sAAVEPERP',
	sUNIPERP = 'sUNIPERP',
	sMATICPERP = 'sMATICPERP',
	sXAUPERP = 'sXAUPERP',
	sXAGPERP = 'sXAGPERP',
	sEURPERP = 'sEURPERP',
	sAPEPERP = 'sAPEPERP',
	sDYDXPERP = 'sDYDXPERP',
	sBNBPERP = 'sBNBPERP',
	sDOGEPERP = 'sDOGEPERP',
	sOPPERP = 'sOPPERP',
	sARBPERP = 'sARBPERP',
	sATOMPERP = 'sATOMPERP',
	sFTMPERP = 'sFTMPERP',
	sNEARPERP = 'sNEARPERP',
	sFLOWPERP = 'sFLOWPERP',
	sAXSPERP = 'sAXSPERP',
	sAUDPERP = 'sAUDPERP',
	sGBPPERP = 'sGBPPERP',
	sADAPERP = 'sADAPERP',
	sAPTPERP = 'sAPTPERP',
	sBCHPERP = 'sBCHPERP',
	sCRVPERP = 'sCRVPERP',
	sFILPERP = 'sFILPERP',
	sGMXPERP = 'sGMXPERP',
	sLDOPERP = 'sLDOPERP',
	sLTCPERP = 'sLTCPERP',
	sSHIBPERP = 'sSHIBPERP',
	sSUIPERP = 'sSUIPERP',
	sPEPEPERP = 'sPEPEPERP',
	sBLURPERP = 'sBLURPERP',
	sXRPPERP = 'sXRPPERP',
	sDOTPERP = 'sDOTPERP',
	sTRXPERP = 'sTRXPERP',
	sFLOKIPERP = 'sFLOKIPERP',
	sINJPERP = 'sINJPERP',
	sSTETHPERP = 'sSTETHPERP',
}

export enum FuturesMarketAsset {
	sBTC = 'sBTC',
	sETH = 'sETH',
	LINK = 'LINK',
	SOL = 'SOL',
	AVAX = 'AVAX',
	AAVE = 'AAVE',
	UNI = 'UNI',
	MATIC = 'MATIC',
	XAU = 'XAU',
	XAG = 'XAG',
	EUR = 'EUR',
	APE = 'APE',
	DYDX = 'DYDX',
	BNB = 'BNB',
	DOGE = 'DOGE',
	OP = 'OP',
	ARB = 'ARB',
	ATOM = 'ATOM',
	FTM = 'FTM',
	NEAR = 'NEAR',
	FLOW = 'FLOW',
	AXS = 'AXS',
	AUD = 'AUD',
	GBP = 'GBP',
	ADA = 'ADA',
	APT = 'APT',
	BCH = 'BCH',
	CRV = 'CRV',
	FIL = 'FIL',
	GMX = 'GMX',
	LDO = 'LDO',
	LTC = 'LTC',
	SHIB = 'SHIB',
	SUI = 'SUI',
	PEPE = 'PEPE',
	BLUR = 'BLUR',
	XRP = 'XRP',
	DOT = 'DOT',
	TRX = 'TRX',
	FLOKI = 'FLOKI',
	INJ = 'INJ',
	STETH = 'STETH',
}

export interface FuturesMarketConfig {
	key: FuturesMarketKey
	asset: FuturesMarketAsset
	supports: 'mainnet' | 'testnet' | 'both'
	version: 1 | 2
	pythIds?: {
		mainnet: string
		testnet: string
	}
	disabled?: boolean
}

export type FuturesVolumes<T = Wei> = {
	[asset: string]: {
		volume: T
		trades: T
	}
}

export type PositionDetail = {
	remainingMargin: BigNumber
	accessibleMargin: BigNumber
	orderPending: boolean
	order: {
		pending: boolean
		fee: BigNumber
		leverage: BigNumber
	}
	position: {
		fundingIndex: BigNumber
		lastPrice: BigNumber
		size: BigNumber
		margin: BigNumber
	}
	accruedFunding: BigNumber
	notionalValue: BigNumber
	liquidationPrice: BigNumber
	profitLoss: BigNumber
}

export enum PositionSide {
	LONG = 'long',
	SHORT = 'short',
}

export enum FuturesMarginType {
	SMART_MARGIN = 'smart_margin',
	CROSS_MARGIN = 'cross_margin',
	ISOLATED_MARGIN_LEGACY = 'isolated_margin_legacy',
}

export enum ContractOrderType {
	MARKET = 0,
	DELAYED = 1,
	DELAYED_OFFCHAIN = 2,
}

export const OrderEnumByType: Record<string, ContractOrderType> = {
	market: ContractOrderType.MARKET,
	delayed: ContractOrderType.DELAYED,
	delayed_offchain: ContractOrderType.DELAYED_OFFCHAIN,
}

export type FuturesFilledPosition<T = Wei> = {
	canLiquidatePosition: boolean
	side: PositionSide
	notionalValue: T
	accruedFunding: T
	initialMargin: T
	profitLoss: T
	fundingIndex: number
	lastPrice: T
	size: T
	liquidationPrice: T
	initialLeverage: T
	leverage: T
	pnl: T
	pnlPct: T
	marginRatio: T
}

export type FuturesPositionHistory<T = Wei> = {
	id: Number
	transactionHash: string
	timestamp: number
	openTimestamp: number
	closeTimestamp: number | undefined
	market: string
	asset: FuturesMarketAsset
	marketKey: FuturesMarketKey
	account: string
	abstractAccount: string
	accountType: FuturesMarginType
	isOpen: boolean
	isLiquidated: boolean
	size: T
	feesPaid: T
	netFunding: T
	netTransfers: T
	totalDeposits: T
	initialMargin: T
	margin: T
	entryPrice: T
	avgEntryPrice: T
	exitPrice: T
	leverage: T
	side: PositionSide
	pnl: T
	pnlWithFeesPaid: T
	totalVolume: T
	trades: number
}

export type FuturesPosition<T = Wei> = {
	asset: FuturesMarketAsset
	marketKey: FuturesMarketKey
	remainingMargin: T
	accessibleMargin: T
	position: FuturesFilledPosition<T> | null
	// This prevents TS issues when creating a union with the cross margin position type.
	stopLoss?: ConditionalOrder<T>
	takeProfit?: ConditionalOrder<T>
}

export type ModifyPositionOptions<T extends boolean> = {
	delayed?: boolean
	offchain?: boolean
	estimationOnly?: T
}

// This type exists to rename enum types from the subgraph to display-friendly types
export type FuturesOrderTypeDisplay =
	| 'Next Price'
	| 'Limit'
	| 'Stop'
	| 'Market'
	| 'Liquidation'
	| 'Delayed'
	| 'Take Profit'
	| 'Stop Loss'
	| 'Delayed Market'

export enum ConditionalOrderTypeEnum {
	LIMIT = 0,
	STOP = 1,
}

export type ConditionalOrder<T = Wei> = {
	id: number
	subgraphId: string
	account: string
	asset: FuturesMarketAsset
	market: string
	marketKey: FuturesMarketKey
	size: T
	targetPrice: T | null
	desiredFillPrice: T
	marginDelta: T
	orderType: ConditionalOrderTypeEnum
	orderTypeDisplay: FuturesOrderTypeDisplay
	sizeTxt?: string
	targetPriceTxt?: string
	reduceOnly: boolean
	side?: PositionSide
	isStale?: boolean
	isExecutable?: boolean
	isCancelling?: boolean
	isSlTp?: boolean
}

export type DelayedOrder<T = Wei> = {
	account: string
	marketAddress: string
	size: T
	commitDeposit: T
	keeperDeposit: T
	submittedAtTimestamp: number
	executableAtTimestamp: number
	isOffchain: boolean
	desiredFillPrice: T
	targetRoundId: T | null
	orderType: FuturesOrderTypeDisplay
	side: PositionSide
}

export type FuturesPotentialTradeDetails<T = Wei> = {
	marketKey: FuturesMarketKey
	size: T
	sizeDelta: T
	liqPrice: T
	margin: T
	price: T
	fee: T
	leverage: T
	notionalValue: T
	side: PositionSide
	status: PotentialTradeStatus
	showStatus: boolean
	statusMessage: string
	priceImpact: T
	exceedsPriceProtection: boolean
}

// https://github.com/Synthetixio/synthetix/blob/4d2add4f74c68ac4f1106f6e7be4c31d4f1ccc76/contracts/interfaces/IFuturesMarketBaseTypes.sol#L6-L19
export enum PotentialTradeStatus {
	// Contract status mapping
	OK = 0,
	INVALID_PRICE = 1,
	INVALID_ORDER_PRICE = 2,
	PRICE_OUT_OF_BOUNDS = 3,
	CAN_LIQUIDATE = 4,
	CANNOT_LIQUIDATE = 5,
	MAX_MARKET_SIZE_EXCEEDED = 6,
	MAX_LEVERAGE_EXCEEDED = 7,
	INSUFFICIENT_MARGIN = 8,
	NOT_PERMITTED = 9,
	NIL_ORDER = 10,
	NO_POSITION_OPEN = 11,
	PRICE_TOO_VOLATILE = 12,
	PRICE_IMPACT_TOLERANCE_EXCEEDED = 13,

	// Our own local status
	INSUFFICIENT_FREE_MARGIN = 100,
}

export type PostTradeDetailsResponse = {
	margin: BigNumber
	size: BigNumber
	price: BigNumber
	liqPrice: BigNumber
	fee: BigNumber
	status: number
}

export type SmartMarginOrderType = 'market' | 'stop_market' | 'limit'
export type FuturesOrderType = SmartMarginOrderType

export type FuturesTrade<T = Wei> = {
	account: string
	margin: T
	size: T
	asset: FuturesMarketAsset
	price: T
	txnHash: string
	timestamp: number
	positionId: string
	positionSize: T
	positionClosed: boolean
	side: PositionSide
	pnl: T
	feesPaid: T
	keeperFeesPaid: T
	orderType: FuturesOrderTypeDisplay
	accountType: FuturesMarginType
	fundingAccrued: T
}

export enum AccountExecuteFunctions {
	ACCOUNT_MODIFY_MARGIN = 0,
	ACCOUNT_WITHDRAW_ETH = 1,
	PERPS_V2_MODIFY_MARGIN = 2,
	PERPS_V2_WITHDRAW_ALL_MARGIN = 3,
	PERPS_V2_SUBMIT_ATOMIC_ORDER = 4,
	PERPS_V2_SUBMIT_DELAYED_ORDER = 5,
	PERPS_V2_SUBMIT_OFFCHAIN_DELAYED_ORDER = 6,
	PERPS_V2_CLOSE_POSITION = 7,
	PERPS_V2_SUBMIT_CLOSE_DELAYED_ORDER = 8,
	PERPS_V2_SUBMIT_CLOSE_OFFCHAIN_DELAYED_ORDER = 9,
	PERPS_V2_CANCEL_DELAYED_ORDER = 10,
	PERPS_V2_CANCEL_OFFCHAIN_DELAYED_ORDER = 11,
	GELATO_PLACE_CONDITIONAL_ORDER = 12,
	GELATO_CANCEL_CONDITIONAL_ORDER = 13,
}

export type MarginTransfer = {
	timestamp: number
	account: string
	size: number
	txHash: string
	action: string
	market?: string
	asset?: FuturesMarketAsset
}

export type MarketWithIdleMargin = {
	marketAddress: string
	marketKey: FuturesMarketKey
	position: FuturesPosition
}

export type SmartMarginOrderInputs = {
	sizeDelta: Wei
	marginDelta: Wei
	desiredFillPrice: Wei
	timeDelta?: Wei
	keeperEthDeposit?: Wei
	conditionalOrderInputs?: {
		orderType: ConditionalOrderTypeEnum
		price: Wei
		feeCap: Wei
		reduceOnly: boolean
	}
	stopLoss?: {
		price: Wei
		sizeDelta: Wei
		desiredFillPrice: Wei
	}
	takeProfit?: {
		price: Wei
		sizeDelta: Wei
		desiredFillPrice: Wei
	}
}

export type SLTPOrderInputs = {
	keeperEthDeposit: Wei
	stopLoss?: {
		price: Wei
		desiredFillPrice: Wei
		sizeDelta: Wei
		isCancelled?: boolean
	}
	takeProfit?: {
		price: Wei
		desiredFillPrice: Wei
		sizeDelta: Wei
		isCancelled?: boolean
	}
}

export type PerpsV3Market = {
	id: string
	perpsMarketId: string
	marketOwner: string
	marketName: string
	marketSymbol: string
	feedId: string
	owner: string
	maxFundingVelocity: string
	skewScale: string
	initialMarginFraction: string
	maintenanceMarginFraction: string
	liquidationRewardRatioD18: string
	maxLiquidationLimitAccumulationMultiplier: string
	lockedOiPercent: string
	makerFee: string
	takerFee: string
}
