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

export type PerpsMarketV2<T = Wei> = FuturesMarket<T> & {
	version: 2
	marketAddress: string
}

export type PerpsMarketV3<T = Wei> = FuturesMarket<T> & {
	version: 3
	marketId: number
	settlementStrategies: PerpsV3SettlementStrategy<T>[]
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
	sETHBTCPERP = 'sETHBTCPERP',
	sXMRPERP = 'sXMRPERP',
	sMAVPERP = 'sMAVPERP',
	sETCPERP = 'sETCPERP',
	sCOMPPERP = 'sCOMPPERP',
	sYFIPERP = 'sYFIPERP',
	sMKRPERP = 'sMKRPERP',
	sRPLPERP = 'sRPLPERP',
	sWLDPERP = 'sWLDPERP',
	sUSDTPERP = 'sUSDTPERP',
	sSEIPERP = 'sSEIPERP',
	sRUNEPERP = 'sRUNEPERP',
	sSUSHIPERP = 'sSUSHIPERP',
	sZECPERP = 'sZECPERP',
	sXTZPERP = 'sXTZPERP',
	sUMAPERP = 'sUMAPERP',
	sENJPERP = 'sENJPERP',
	sICPPERP = 'sICPPERP',
	sXLMPERP = 'sXLMPERP',
	s1INCHPERP = 's1INCHPERP',
	sEOSPERP = 'sEOSPERP',
	sCELOPERP = 'sCELOPERP',
	sALGOPERP = 'sALGOPERP',
	sZRXPERP = 'sZRXPERP',
	sBALPERP = 'sBALPERP',
	sFXSPERP = 'sFXSPERP',
	sKNCPERP = 'sKNCPERP',
	sRNDRPERP = 'sRNDRPERP',
	sONEPERP = 'sONEPERP',
	sPERPPERP = 'sPERPPERP',
	sZILPERP = 'sZILPERP',
	sSTETHETHPERP = 'sSTETHETHPERP',
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
	ETHBTC = 'ETHBTC',
	XMR = 'XMR',
	MAV = 'MAV',
	ETC = 'ETC',
	COMP = 'COMP',
	YFI = 'YFI',
	MKR = 'MKR',
	RPL = 'RPL',
	WLD = 'WLD',
	USDT = 'USDT',
	SEI = 'SEI',
	RUNE = 'RUNE',
	SUSHI = 'SUSHI',
	ZEC = 'ZEC',
	XTZ = 'XTZ',
	UMA = 'UMA',
	ENJ = 'ENJ',
	ICP = 'ICP',
	XLM = 'XLM',
	ONEINCH = '1INCH',
	EOS = 'EOS',
	CELO = 'CELO',
	ALGO = 'ALGO',
	ZRX = 'ZRX',
	BAL = 'BAL',
	FXS = 'FXS',
	KNC = 'KNC',
	RNDR = 'RNDR',
	ONE = 'ONE',
	PERP = 'PERP',
	ZIL = 'ZIL',
	STETHETH = 'STETHETH',
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

export type PerpsV2Position<T = Wei> = {
	asset: FuturesMarketAsset
	marketKey: FuturesMarketKey
	remainingMargin: T
	accessibleMargin: T
	position: FuturesFilledPosition<T> | null
}

export type PerpsV3Position<T = Wei> = {
	marketId: number
	side: PositionSide
	accruedFunding: T
	profitLoss: T
	size: T
	pnl: T
	pnlPct: T
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

export type PerpsV3AsyncOrder<T = Wei> = {
	accountId: number
	marketId: number
	sizeDelta: T
	settlementTime: number
	settlementStrategyId: number
	acceptablePrice: T
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

export type SettlementSubgraphType = {
	id: string
	marketId: string
	strategyId: string
	strategyType: string
	settlementDelay: string
	priceDeviationTolerance: string
	settlementWindowDuration: string
	url: string
	settlementReward: string
}

export type PerpsV3SettlementStrategy<T = Wei> = {
	id: string
	marketId: number
	strategyId: number
	strategyType: string
	settlementDelay: T
	settlementWindowDuration: T
	url: string
	settlementReward: T
	priceDeviationTolerance: T
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
	UNISWAP_V3_SWAP = 14,
	PERMIT2_PERMIT = 15,
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

export type Market = {
	marketAddress: string
	marketKey: FuturesMarketKey
}

export type MarketWithIdleMargin = Market & {
	position: PerpsV2Position
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

export type PerpsV3SubgraphMarket = {
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

export enum SwapDepositToken {
	SUSD = 'SUSD',
	USDC = 'USDC',
	// USDT = 'USDT',
	DAI = 'DAI',
	// LUSD = 'LUSD',
}

export interface FuturesTradeByReferral {
	timestamp: string
	account: string
	size: string
	price: string
}

export type PrepareTxParams<T extends boolean | undefined> = {
	isPrepareOnly?: T
}

export type ApproveSmartMarginDepositParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	address: string
	token: SwapDepositToken
	amount?: BigNumber
}

export type DepositSmartMarginParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	address: string
	amount: Wei
	token: SwapDepositToken
	slippage?: number
}

export type ChangeMarketBalanceParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	address: string
	amount: Wei
}

export type ModifyMarketMarginParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	address: string
	market: string
	marginDelta: Wei
}

export type ModifySmartMarginPositionParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	address: string
	market: Market
	sizeDelta: Wei
	desiredFillPrice: Wei
	cancelPendingReduceOrders?: boolean
}

export type CloseIsolatedPositionParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	marketAddress: string
	priceImpactDelta: Wei
}

export type SubmitIsolatedMarginOrdersParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	marketAddress: string
	sizeDelta: Wei
	priceImpactDelta: Wei
}

export type CancelDelayedOrderParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	marketAddress: string
	account: string
	isOffchain: boolean
}

export type ExecuteDelayedOrderParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	marketAddress: string
	account: string
}

export type ExecuteDelayedOffchainOrderParams<T extends boolean | undefined> = PrepareTxParams<T> &
	Market & {
		account: string
	}

export type SubmitSmartMarginOrderParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	market: Market
	walletAddress: string
	smAddress: string
	order: SmartMarginOrderInputs
	options?: {
		cancelPendingReduceOrders?: boolean
		cancelExpiredDelayedOrders?: boolean
		swapDeposit?: {
			token: SwapDepositToken
			amountIn: Wei
			amountOutMin: Wei
		}
	}
}

export type CloseSmartMarginPositionParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	market: Market
	address: string
	desiredFillPrice: Wei
}

export type CancelConditionalOrderParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	account: string
	orderId: number
}

export type UpdateConditionalOrderParams<T extends boolean | undefined> = PrepareTxParams<T> & {
	marketKey: FuturesMarketKey
	account: string
	params: SLTPOrderInputs
}

export type GetSkewAdjustedPriceParams = Market & {
	price: Wei
}

export type GetIsolatedMarginTradePreviewParams = {
	market: Market
	orderType: ContractOrderType
	sizeDelta: Wei
	price: Wei
	leverageSide: PositionSide
}

export type GetSmartMarginTradePreviewParams = {
	market: Market
	account: string
	tradeParams: {
		sizeDelta: Wei
		marginDelta: Wei
		orderPrice: Wei
		leverageSide: PositionSide
	}
}
