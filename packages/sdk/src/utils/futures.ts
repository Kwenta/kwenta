import { BigNumber } from '@ethersproject/bignumber'
import { formatBytes32String, parseBytes32String } from '@ethersproject/strings'
import Wei, { wei } from '@synthetixio/wei'
import { defaultAbiCoder } from 'ethers/lib/utils.js'

import {
	APP_MAX_LEVERAGE,
	FUTURES_ENDPOINTS,
	MAINNET_MARKETS,
	TESTNET_MARKETS,
	AGGREGATE_ASSET_KEY,
	MAIN_ENDPOINTS,
	SL_TP_MAX_SIZE,
	KWENTA_PYTH_SERVER,
	PUBLIC_PYTH_SERVER,
	DEFAULT_PRICE_IMPACT_DELTA_PERCENT,
} from '../constants/futures'
import { ZERO_WEI } from '../constants/number'
import { SECONDS_PER_DAY } from '../constants/period'
import { ETH_UNIT } from '../constants/transactions'
import { IContext } from '../context'
import { IPerpsV2MarketConsolidated } from '../contracts/types/PerpsV2Market'
import { NetworkId, PriceServer } from '../types/common'
import {
	DelayedOrder,
	SmartMarginOrderType,
	FundingRateUpdate,
	FuturesMarketAsset,
	FuturesMarketKey,
	ConditionalOrder,
	FuturesOrderType,
	FuturesOrderTypeDisplay,
	FuturesPosition,
	FuturesPositionHistory,
	FuturesPotentialTradeDetails,
	FuturesTrade,
	FuturesVolumes,
	PositionDetail,
	PositionSide,
	PostTradeDetailsResponse,
	PotentialTradeStatus,
	MarginTransfer,
	ConditionalOrderTypeEnum,
} from '../types/futures'
import { formatCurrency, formatDollars } from '../utils/number'
import {
	FuturesAggregateStatResult,
	FuturesOrderType as SubgraphOrderType,
	FuturesPositionResult,
	FuturesTradeResult,
	FuturesMarginTransferResult,
	CrossMarginAccountTransferResult,
} from '../utils/subgraph'

export const getFuturesEndpoint = (networkId: number) => {
	return FUTURES_ENDPOINTS[networkId] || FUTURES_ENDPOINTS[10]
}

export const getMainEndpoint = (networkId: number) => {
	return MAIN_ENDPOINTS[networkId] || MAIN_ENDPOINTS[10]
}

export const calculateFundingRate = (
	minTimestamp: number,
	periodLength: number,
	fundingRates: FundingRateUpdate[],
	assetPrice: Wei,
	currentFundingRate: Wei
): Wei | null => {
	const numUpdates = fundingRates.length
	if (numUpdates < 2) return null

	// variables to keep track
	let fundingPaid = wei(0)
	let timeTotal = 0
	let lastTimestamp = minTimestamp

	// iterate through funding updates
	for (let ind = 0; ind < numUpdates - 1; ind++) {
		const minFunding = fundingRates[ind]
		const maxFunding = fundingRates[ind + 1]

		const fundingStart = new Wei(minFunding.funding, 18, true)
		const fundingEnd = new Wei(maxFunding.funding, 18, true)

		const fundingDiff = fundingStart.sub(fundingEnd)
		const timeDiff = maxFunding.timestamp - Math.max(minFunding.timestamp, lastTimestamp)
		const timeMax = maxFunding.timestamp - minFunding.timestamp

		if (timeMax > 0) {
			fundingPaid = fundingPaid.add(fundingDiff.mul(timeDiff).div(timeMax))
			timeTotal += timeDiff
		}
		lastTimestamp = maxFunding.timestamp
	}

	// add funding from current rate
	const timeLeft = Math.max(periodLength - timeTotal, 0)
	if (timeLeft > 0) {
		fundingPaid = fundingPaid.add(
			wei(currentFundingRate).mul(timeLeft).div(SECONDS_PER_DAY).mul(assetPrice)
		)
	}

	const fundingRate = fundingPaid.div(assetPrice)
	return fundingRate
}

export const marketsForNetwork = (networkId: number, logError: IContext['logError']) => {
	switch (networkId) {
		case 10:
			return MAINNET_MARKETS
		case 420:
			return TESTNET_MARKETS
		default:
			logError?.(new Error('Futures is not supported on this network.'))
			return []
	}
}

export const getMarketName = (asset: FuturesMarketAsset | null) => {
	return `${getDisplayAsset(asset)}/sUSD`
}

export const getDisplayAsset = (asset: string | null) => {
	if (!asset) return null
	if (asset === 'STETH') return 'stETH'
	return asset[0] === 's' ? asset.slice(1) : asset
}

export const calculateVolumes = (
	futuresHourlyStats: FuturesAggregateStatResult[]
): FuturesVolumes => {
	const volumes: FuturesVolumes = futuresHourlyStats.reduce(
		(acc: FuturesVolumes, { marketKey, volume, trades }) => {
			const cleanMarketKey =
				marketKey !== AGGREGATE_ASSET_KEY ? parseBytes32String(marketKey) : marketKey
			return {
				...acc,
				[cleanMarketKey]: {
					volume: volume.div(ETH_UNIT).add(acc[cleanMarketKey]?.volume ?? 0),
					trades: trades.add(acc[cleanMarketKey]?.trades ?? 0),
				},
			}
		},
		{}
	)
	return volumes
}

export const mapFuturesPosition = (
	positionDetail: PositionDetail,
	canLiquidatePosition: boolean,
	asset: FuturesMarketAsset,
	marketKey: FuturesMarketKey
): FuturesPosition => {
	const {
		remainingMargin,
		accessibleMargin,
		position: { fundingIndex, lastPrice, size, margin },
		accruedFunding,
		notionalValue,
		liquidationPrice,
		profitLoss,
	} = positionDetail
	const initialMargin = wei(margin)
	const pnl = wei(profitLoss).add(wei(accruedFunding))
	const pnlPct = initialMargin.gt(0) ? pnl.div(wei(initialMargin)) : wei(0)

	return {
		asset,
		marketKey,
		remainingMargin: wei(remainingMargin),
		accessibleMargin: wei(accessibleMargin),
		position: wei(size).eq(ZERO_WEI)
			? null
			: {
					canLiquidatePosition: !!canLiquidatePosition,
					side: wei(size).gt(ZERO_WEI) ? PositionSide.LONG : PositionSide.SHORT,
					notionalValue: wei(notionalValue).abs(),
					accruedFunding: wei(accruedFunding),
					initialMargin,
					profitLoss: wei(profitLoss),
					fundingIndex: Number(fundingIndex),
					lastPrice: wei(lastPrice),
					size: wei(size).abs(),
					liquidationPrice: wei(liquidationPrice),
					initialLeverage: initialMargin.gt(0)
						? wei(size).mul(wei(lastPrice)).div(initialMargin).abs()
						: wei(0),
					pnl,
					pnlPct,
					marginRatio: wei(notionalValue).eq(ZERO_WEI)
						? ZERO_WEI
						: wei(remainingMargin).div(wei(notionalValue).abs()),
					leverage: wei(remainingMargin).eq(ZERO_WEI)
						? ZERO_WEI
						: wei(notionalValue).div(wei(remainingMargin)).abs(),
			  },
	}
}

export const mapFuturesPositions = (
	futuresPositions: FuturesPositionResult[]
): FuturesPositionHistory[] => {
	return futuresPositions.map(
		({
			id,
			lastTxHash,
			openTimestamp,
			closeTimestamp,
			timestamp,
			market,
			asset,
			marketKey,
			account,
			abstractAccount,
			accountType,
			isOpen,
			isLiquidated,
			trades,
			totalVolume,
			size,
			initialMargin,
			margin,
			pnl,
			feesPaid,
			netFunding,
			pnlWithFeesPaid,
			netTransfers,
			totalDeposits,
			entryPrice,
			avgEntryPrice,
			exitPrice,
		}: FuturesPositionResult) => {
			const entryPriceWei = wei(entryPrice).div(ETH_UNIT)
			const feesWei = wei(feesPaid || 0).div(ETH_UNIT)
			const sizeWei = wei(size).div(ETH_UNIT)
			const marginWei = wei(margin).div(ETH_UNIT)
			return {
				id: Number(id.split('-')[1].toString()),
				transactionHash: lastTxHash,
				timestamp: timestamp.mul(1000).toNumber(),
				openTimestamp: openTimestamp.mul(1000).toNumber(),
				closeTimestamp: closeTimestamp?.mul(1000).toNumber(),
				market,
				asset: parseBytes32String(asset) as FuturesMarketAsset,
				marketKey: parseBytes32String(marketKey) as FuturesMarketKey,
				account,
				abstractAccount,
				accountType,
				isOpen,
				isLiquidated,
				size: sizeWei.abs(),
				feesPaid: feesWei,
				netFunding: wei(netFunding || 0).div(ETH_UNIT),
				netTransfers: wei(netTransfers || 0).div(ETH_UNIT),
				totalDeposits: wei(totalDeposits || 0).div(ETH_UNIT),
				initialMargin: wei(initialMargin).div(ETH_UNIT),
				margin: marginWei,
				entryPrice: entryPriceWei,
				exitPrice: wei(exitPrice || 0).div(ETH_UNIT),
				pnl: wei(pnl).div(ETH_UNIT),
				pnlWithFeesPaid: wei(pnlWithFeesPaid).div(ETH_UNIT),
				totalVolume: wei(totalVolume).div(ETH_UNIT),
				trades: trades.toNumber(),
				avgEntryPrice: wei(avgEntryPrice).div(ETH_UNIT),
				leverage: marginWei.eq(wei(0)) ? wei(0) : sizeWei.mul(entryPriceWei).div(marginWei).abs(),
				side: sizeWei.gte(wei(0)) ? PositionSide.LONG : PositionSide.SHORT,
			}
		}
	)
}

// TODO: Move to app
export const serializePotentialTrade = (
	preview: FuturesPotentialTradeDetails
): FuturesPotentialTradeDetails<string> => ({
	...preview,
	size: preview.size.toString(),
	sizeDelta: preview.sizeDelta.toString(),
	liqPrice: preview.liqPrice.toString(),
	margin: preview.margin.toString(),
	price: preview.price.toString(),
	fee: preview.fee.toString(),
	leverage: preview.leverage.toString(),
	notionalValue: preview.notionalValue.toString(),
	priceImpact: preview.priceImpact.toString(),
})

// TODO: Move to app
export const unserializePotentialTrade = (
	preview: FuturesPotentialTradeDetails<string>
): FuturesPotentialTradeDetails => ({
	...preview,
	size: wei(preview.size),
	sizeDelta: wei(preview.sizeDelta),
	liqPrice: wei(preview.liqPrice),
	margin: wei(preview.margin),
	price: wei(preview.price),
	fee: wei(preview.fee),
	leverage: wei(preview.leverage),
	notionalValue: wei(preview.notionalValue),
	priceImpact: wei(preview.priceImpact),
})

export const formatDelayedOrder = (
	account: string,
	marketAddress: string,
	order: IPerpsV2MarketConsolidated.DelayedOrderStructOutput
): DelayedOrder => {
	const {
		isOffchain,
		sizeDelta,
		desiredFillPrice,
		targetRoundId,
		commitDeposit,
		keeperDeposit,
		executableAtTime,
		intentionTime,
	} = order

	return {
		account: account,
		marketAddress: marketAddress,
		size: wei(sizeDelta),
		commitDeposit: wei(commitDeposit),
		keeperDeposit: wei(keeperDeposit),
		submittedAtTimestamp: intentionTime.toNumber() * 1000,
		executableAtTimestamp: executableAtTime.toNumber() * 1000,
		isOffchain: isOffchain,
		desiredFillPrice: wei(desiredFillPrice),
		targetRoundId: wei(targetRoundId),
		orderType: isOffchain ? 'Delayed Market' : 'Delayed',
		side: wei(sizeDelta).gt(0) ? PositionSide.LONG : PositionSide.SHORT,
	}
}

export const formatPotentialTrade = (
	preview: PostTradeDetailsResponse,
	skewAdjustedPrice: Wei,
	nativeSizeDelta: Wei,
	leverageSide: PositionSide
) => {
	const { fee, liqPrice, margin, price, size, status } = preview

	const notionalValue = wei(size).mul(wei(price))
	const leverage = margin.gt(0) ? notionalValue.div(wei(margin)) : ZERO_WEI
	const priceImpact = wei(price).sub(skewAdjustedPrice).div(skewAdjustedPrice).abs()

	return {
		fee: wei(fee),
		liqPrice: wei(liqPrice),
		margin: wei(margin),
		price: wei(price),
		size: wei(size),
		sizeDelta: nativeSizeDelta,
		side: leverageSide,
		leverage: leverage,
		notionalValue: notionalValue,
		status,
		showStatus: status > 0, // 0 is success
		statusMessage: getTradeStatusMessage(status),
		priceImpact: priceImpact,
		exceedsPriceProtection: priceImpact.mul(100).gt(getDefaultPriceImpact('market')),
	}
}

const SUCCESS = 'Success'
const UNKNOWN = 'Unknown'

export const getTradeStatusMessage = (status: PotentialTradeStatus): string => {
	if (typeof status !== 'number') {
		return UNKNOWN
	}

	if (status === 0) {
		return SUCCESS
	} else if (PotentialTradeStatus[status]) {
		return POTENTIAL_TRADE_STATUS_TO_MESSAGE[PotentialTradeStatus[status]]
	} else {
		return UNKNOWN
	}
}

// https://github.com/Synthetixio/synthetix/blob/4d2add4f74c68ac4f1106f6e7be4c31d4f1ccc76/contracts/PerpsV2MarketBase.sol#L130-L141
export const POTENTIAL_TRADE_STATUS_TO_MESSAGE: { [key: string]: string } = {
	OK: 'Ok',
	INVALID_PRICE: 'Invalid price',
	INVALID_ORDER_PRICE: 'Invalid order price',
	PRICE_OUT_OF_BOUNDS: 'Price out of acceptable range',
	CAN_LIQUIDATE: 'Position can be liquidated',
	CANNOT_LIQUIDATE: 'Position cannot be liquidated',
	MAX_MARKET_SIZE_EXCEEDED: 'Open interest limit exceeded',
	MAX_LEVERAGE_EXCEEDED: 'Max leverage exceeded (larger positions have lower max leverage)',
	INSUFFICIENT_MARGIN: 'Insufficient margin',
	NOT_PERMITTED: 'Not permitted by this address',
	NO_POSITION_OPEN: 'No position open',
	PRICE_TOO_VOLATILE: 'Price too volatile',
	PRICE_IMPACT_TOLERANCE_EXCEEDED: 'Price impact tolerance exceeded',
	INSUFFICIENT_FREE_MARGIN: `You don't have enough sUSD for this trade`,
}

export const getPythNetworkUrl = (networkId: NetworkId, server: PriceServer = 'KWENTA') => {
	const defaultPythServer = server === 'KWENTA' ? KWENTA_PYTH_SERVER : PUBLIC_PYTH_SERVER
	return networkId === 420 ? 'https://xc-testnet.pyth.network' : defaultPythServer
}

export const normalizePythId = (id: string) => (id.startsWith('0x') ? id : '0x' + id)

export type ConditionalOrderResult = {
	conditionalOrderType: number
	desiredFillPrice: BigNumber
	gelatoTaskId: string
	marginDelta: BigNumber
	marketKey: string
	reduceOnly: boolean
	sizeDelta: BigNumber
	targetPrice: BigNumber
}

export const mapConditionalOrderFromContract = (
	orderDetails: ConditionalOrderResult & { id: number },
	account: string
): ConditionalOrder => {
	const marketKey = parseBytes32String(orderDetails.marketKey) as FuturesMarketKey
	const asset = MarketAssetByKey[marketKey]
	const sizeDelta = wei(orderDetails.sizeDelta)
	const size = sizeDelta.abs()

	return {
		id: orderDetails.id,
		subgraphId: `CM-${account}-${orderDetails.id}`,
		account: account,
		size: sizeDelta,
		marginDelta: wei(orderDetails.marginDelta),
		orderType: orderDetails.conditionalOrderType,
		orderTypeDisplay: formatOrderDisplayType(
			orderDetails.conditionalOrderType,
			orderDetails.reduceOnly
		),
		// TODO: Rename when ABI is updated
		desiredFillPrice: wei(orderDetails.desiredFillPrice),
		targetPrice: wei(orderDetails.targetPrice),
		reduceOnly: orderDetails.reduceOnly,
		sizeTxt: size.abs().eq(SL_TP_MAX_SIZE)
			? 'Close'
			: formatCurrency(asset, size, {
					currencyKey: getDisplayAsset(asset) ?? '',
					minDecimals: size.lt(0.01) ? 4 : 2,
			  }),
		targetPriceTxt: formatDollars(wei(orderDetails.targetPrice)),
		marketKey: marketKey,
		market: getMarketName(asset),
		asset: asset,
		side: sizeDelta.gt(0) ? PositionSide.LONG : PositionSide.SHORT,
		isStale: false,
		isExecutable: false,
		isSlTp: size.eq(SL_TP_MAX_SIZE),
	}
}

export const OrderNameByType: Record<FuturesOrderType, FuturesOrderTypeDisplay> = {
	market: 'Market',
	stop_market: 'Stop',
	limit: 'Limit',
}

const mapOrderType = (orderType: Partial<SubgraphOrderType>): FuturesOrderTypeDisplay => {
	return orderType === 'NextPrice'
		? 'Next Price'
		: orderType === 'StopMarket'
		? 'Stop'
		: orderType === 'DelayedOffchain'
		? 'Delayed Market'
		: orderType
}

export const mapTrades = (futuresTrades: FuturesTradeResult[]): FuturesTrade[] => {
	return futuresTrades.map(
		({
			id,
			timestamp,
			account,
			margin,
			size,
			price,
			asset,
			positionId,
			positionSize,
			positionClosed,
			pnl,
			feesPaid,
			keeperFeesPaid,
			orderType,
			accountType,
		}) => {
			return {
				asset: parseBytes32String(asset) as FuturesMarketAsset,
				account,
				accountType,
				margin: new Wei(margin, 18, true),
				size: new Wei(size, 18, true),
				price: new Wei(price, 18, true),
				txnHash: id.split('-')[0].toString(),
				timestamp: timestamp.toNumber(),
				positionId,
				positionSize: new Wei(positionSize, 18, true),
				positionClosed,
				side: size.gt(0) ? PositionSide.LONG : PositionSide.SHORT,
				pnl: new Wei(pnl, 18, true),
				feesPaid: new Wei(feesPaid, 18, true),
				keeperFeesPaid: new Wei(keeperFeesPaid, 18, true),
				orderType: mapOrderType(orderType),
			}
		}
	)
}

export const mapMarginTransfers = (
	marginTransfers: FuturesMarginTransferResult[]
): MarginTransfer[] => {
	return marginTransfers.map(
		({ timestamp, account, market, size, asset, txHash }): MarginTransfer => {
			const sizeWei = new Wei(size)
			const numTimestamp = wei(timestamp).toNumber()

			return {
				timestamp: numTimestamp,
				account,
				market,
				size: sizeWei.div(ETH_UNIT).toNumber(),
				action: sizeWei.gt(0) ? 'deposit' : 'withdraw',
				asset: parseBytes32String(asset) as FuturesMarketAsset,
				txHash,
			}
		}
	)
}

export const mapSmartMarginTransfers = (
	marginTransfers: CrossMarginAccountTransferResult[]
): MarginTransfer[] => {
	return marginTransfers.map(
		({ timestamp, account, size, txHash }): MarginTransfer => {
			const sizeWei = new Wei(size)
			const numTimestamp = wei(timestamp).toNumber()

			return {
				timestamp: numTimestamp,
				account,
				size: sizeWei.div(ETH_UNIT).toNumber(),
				action: sizeWei.gt(0) ? 'deposit' : 'withdraw',
				txHash,
			}
		}
	)
}

type TradeInputParams = {
	marginDelta: Wei
	sizeDelta: Wei
	price: Wei
	desiredFillPrice: Wei
}

export const encodeConditionalOrderParams = (
	marketKey: FuturesMarketKey,
	tradeInputs: TradeInputParams,
	type: ConditionalOrderTypeEnum,
	reduceOnly: boolean
) => {
	return defaultAbiCoder.encode(
		['bytes32', 'int256', 'int256', 'uint256', 'uint256', 'uint256', 'bool'],
		[
			formatBytes32String(marketKey),
			tradeInputs.marginDelta.toBN(),
			tradeInputs.sizeDelta.toBN(),
			tradeInputs.price.toBN(),
			type,
			tradeInputs.desiredFillPrice.toBN(),
			reduceOnly,
		]
	)
}

export const encodeSubmitOffchainOrderParams = (
	marketAddress: string,
	sizeDelta: Wei,
	desiredFillPrice: Wei
) => {
	return defaultAbiCoder.encode(
		['address', 'int256', 'uint256'],
		[marketAddress, sizeDelta.toBN(), desiredFillPrice.toBN()]
	)
}

export const encodeCloseOffchainOrderParams = (marketAddress: string, desiredFillPrice: Wei) => {
	return defaultAbiCoder.encode(['address', 'uint256'], [marketAddress, desiredFillPrice.toBN()])
}

export const encodeModidyMarketMarginParams = (marketAddress: string, marginDelta: Wei) => {
	return defaultAbiCoder.encode(['address', 'int256'], [marketAddress, marginDelta.toBN()])
}

export const formatOrderDisplayType = (
	orderType: ConditionalOrderTypeEnum,
	reduceOnly: boolean
) => {
	if (reduceOnly) {
		return orderType === ConditionalOrderTypeEnum.LIMIT ? 'Take Profit' : 'Stop Loss'
	}
	return orderType === ConditionalOrderTypeEnum.LIMIT ? 'Limit' : 'Stop'
}

export const calculateDesiredFillPrice = (
	sizeDelta: Wei,
	marketPrice: Wei,
	priceImpactPercent: Wei
) => {
	const priceImpactDecimalPct = priceImpactPercent.div(100)
	return sizeDelta.lt(0)
		? marketPrice.mul(wei(1).sub(priceImpactDecimalPct))
		: marketPrice.mul(priceImpactDecimalPct.add(1))
}

export const getDefaultPriceImpact = (orderType: SmartMarginOrderType) => {
	switch (orderType) {
		case 'market':
			return wei(DEFAULT_PRICE_IMPACT_DELTA_PERCENT.MARKET)
		case 'limit':
			return wei(DEFAULT_PRICE_IMPACT_DELTA_PERCENT.LIMIT)
		case 'stop_market':
			return wei(DEFAULT_PRICE_IMPACT_DELTA_PERCENT.STOP)
	}
}

// Returns the max leverage without buffer

export const appAdjustedLeverage = (marketLeverage: Wei) => {
	if (marketLeverage.gte(APP_MAX_LEVERAGE)) return APP_MAX_LEVERAGE
	return wei(25)
}

export const MarketAssetByKey: Record<FuturesMarketKey, FuturesMarketAsset> = {
	[FuturesMarketKey.sBTCPERP]: FuturesMarketAsset.sBTC,
	[FuturesMarketKey.sETHPERP]: FuturesMarketAsset.sETH,
	[FuturesMarketKey.sLINKPERP]: FuturesMarketAsset.LINK,
	[FuturesMarketKey.sSOLPERP]: FuturesMarketAsset.SOL,
	[FuturesMarketKey.sAVAXPERP]: FuturesMarketAsset.AVAX,
	[FuturesMarketKey.sAAVEPERP]: FuturesMarketAsset.AAVE,
	[FuturesMarketKey.sUNIPERP]: FuturesMarketAsset.UNI,
	[FuturesMarketKey.sMATICPERP]: FuturesMarketAsset.MATIC,
	[FuturesMarketKey.sXAUPERP]: FuturesMarketAsset.XAU,
	[FuturesMarketKey.sXAGPERP]: FuturesMarketAsset.XAG,
	[FuturesMarketKey.sEURPERP]: FuturesMarketAsset.EUR,
	[FuturesMarketKey.sAPEPERP]: FuturesMarketAsset.APE,
	[FuturesMarketKey.sDYDXPERP]: FuturesMarketAsset.DYDX,
	[FuturesMarketKey.sBNBPERP]: FuturesMarketAsset.BNB,
	[FuturesMarketKey.sDOGEPERP]: FuturesMarketAsset.DOGE,
	[FuturesMarketKey.sOPPERP]: FuturesMarketAsset.OP,
	[FuturesMarketKey.sARBPERP]: FuturesMarketAsset.ARB,
	[FuturesMarketKey.sATOMPERP]: FuturesMarketAsset.ATOM,
	[FuturesMarketKey.sFTMPERP]: FuturesMarketAsset.FTM,
	[FuturesMarketKey.sNEARPERP]: FuturesMarketAsset.NEAR,
	[FuturesMarketKey.sFLOWPERP]: FuturesMarketAsset.FLOW,
	[FuturesMarketKey.sAXSPERP]: FuturesMarketAsset.AXS,
	[FuturesMarketKey.sAUDPERP]: FuturesMarketAsset.AUD,
	[FuturesMarketKey.sGBPPERP]: FuturesMarketAsset.GBP,
	[FuturesMarketKey.sAPTPERP]: FuturesMarketAsset.APT,
	[FuturesMarketKey.sLDOPERP]: FuturesMarketAsset.LDO,
	[FuturesMarketKey.sADAPERP]: FuturesMarketAsset.ADA,
	[FuturesMarketKey.sGMXPERP]: FuturesMarketAsset.GMX,
	[FuturesMarketKey.sFILPERP]: FuturesMarketAsset.FIL,
	[FuturesMarketKey.sLTCPERP]: FuturesMarketAsset.LTC,
	[FuturesMarketKey.sBCHPERP]: FuturesMarketAsset.BCH,
	[FuturesMarketKey.sSHIBPERP]: FuturesMarketAsset.SHIB,
	[FuturesMarketKey.sCRVPERP]: FuturesMarketAsset.CRV,
	[FuturesMarketKey.sSUIPERP]: FuturesMarketAsset.SUI,
	[FuturesMarketKey.sPEPEPERP]: FuturesMarketAsset.PEPE,
	[FuturesMarketKey.sBLURPERP]: FuturesMarketAsset.BLUR,
	[FuturesMarketKey.sXRPPERP]: FuturesMarketAsset.XRP,
	[FuturesMarketKey.sDOTPERP]: FuturesMarketAsset.DOT,
	[FuturesMarketKey.sFLOKIPERP]: FuturesMarketAsset.FLOKI,
	[FuturesMarketKey.sINJPERP]: FuturesMarketAsset.INJ,
	[FuturesMarketKey.sTRXPERP]: FuturesMarketAsset.TRX,
	[FuturesMarketKey.sSTETHPERP]: FuturesMarketAsset.STETH,
} as const

export const MarketKeyByAsset: Record<FuturesMarketAsset, FuturesMarketKey> = {
	[FuturesMarketAsset.sBTC]: FuturesMarketKey.sBTCPERP,
	[FuturesMarketAsset.sETH]: FuturesMarketKey.sETHPERP,
	[FuturesMarketAsset.LINK]: FuturesMarketKey.sLINKPERP,
	[FuturesMarketAsset.SOL]: FuturesMarketKey.sSOLPERP,
	[FuturesMarketAsset.AVAX]: FuturesMarketKey.sAVAXPERP,
	[FuturesMarketAsset.AAVE]: FuturesMarketKey.sAAVEPERP,
	[FuturesMarketAsset.UNI]: FuturesMarketKey.sUNIPERP,
	[FuturesMarketAsset.MATIC]: FuturesMarketKey.sMATICPERP,
	[FuturesMarketAsset.XAU]: FuturesMarketKey.sXAUPERP,
	[FuturesMarketAsset.XAG]: FuturesMarketKey.sXAGPERP,
	[FuturesMarketAsset.EUR]: FuturesMarketKey.sEURPERP,
	[FuturesMarketAsset.APE]: FuturesMarketKey.sAPEPERP,
	[FuturesMarketAsset.DYDX]: FuturesMarketKey.sDYDXPERP,
	[FuturesMarketAsset.BNB]: FuturesMarketKey.sBNBPERP,
	[FuturesMarketAsset.DOGE]: FuturesMarketKey.sDOGEPERP,
	[FuturesMarketAsset.OP]: FuturesMarketKey.sOPPERP,
	[FuturesMarketAsset.ARB]: FuturesMarketKey.sARBPERP,
	[FuturesMarketAsset.ATOM]: FuturesMarketKey.sATOMPERP,
	[FuturesMarketAsset.FTM]: FuturesMarketKey.sFTMPERP,
	[FuturesMarketAsset.NEAR]: FuturesMarketKey.sNEARPERP,
	[FuturesMarketAsset.FLOW]: FuturesMarketKey.sFLOWPERP,
	[FuturesMarketAsset.AXS]: FuturesMarketKey.sAXSPERP,
	[FuturesMarketAsset.AUD]: FuturesMarketKey.sAUDPERP,
	[FuturesMarketAsset.GBP]: FuturesMarketKey.sGBPPERP,
	[FuturesMarketAsset.APT]: FuturesMarketKey.sAPTPERP,
	[FuturesMarketAsset.LDO]: FuturesMarketKey.sLDOPERP,
	[FuturesMarketAsset.ADA]: FuturesMarketKey.sADAPERP,
	[FuturesMarketAsset.GMX]: FuturesMarketKey.sGMXPERP,
	[FuturesMarketAsset.FIL]: FuturesMarketKey.sFILPERP,
	[FuturesMarketAsset.LTC]: FuturesMarketKey.sLTCPERP,
	[FuturesMarketAsset.BCH]: FuturesMarketKey.sBCHPERP,
	[FuturesMarketAsset.SHIB]: FuturesMarketKey.sSHIBPERP,
	[FuturesMarketAsset.CRV]: FuturesMarketKey.sCRVPERP,
	[FuturesMarketAsset.SUI]: FuturesMarketKey.sSUIPERP,
	[FuturesMarketAsset.PEPE]: FuturesMarketKey.sPEPEPERP,
	[FuturesMarketAsset.BLUR]: FuturesMarketKey.sBLURPERP,
	[FuturesMarketAsset.XRP]: FuturesMarketKey.sXRPPERP,
	[FuturesMarketAsset.DOT]: FuturesMarketKey.sDOTPERP,
	[FuturesMarketAsset.FLOKI]: FuturesMarketKey.sFLOKIPERP,
	[FuturesMarketAsset.INJ]: FuturesMarketKey.sINJPERP,
	[FuturesMarketAsset.TRX]: FuturesMarketKey.sTRXPERP,
	[FuturesMarketAsset.STETH]: FuturesMarketKey.sSTETHPERP,
} as const

export const AssetDisplayByAsset: Record<FuturesMarketAsset, string> = {
	[FuturesMarketAsset.sBTC]: 'Bitcoin',
	[FuturesMarketAsset.sETH]: 'Ether',
	[FuturesMarketAsset.LINK]: 'Chainlink',
	[FuturesMarketAsset.SOL]: 'Solana',
	[FuturesMarketAsset.AVAX]: 'Avalanche',
	[FuturesMarketAsset.AAVE]: 'Aave',
	[FuturesMarketAsset.UNI]: 'Uniswap',
	[FuturesMarketAsset.MATIC]: 'Polygon',
	[FuturesMarketAsset.XAU]: 'Gold',
	[FuturesMarketAsset.XAG]: 'Silver',
	[FuturesMarketAsset.EUR]: 'Euro',
	[FuturesMarketAsset.APE]: 'ApeCoin',
	[FuturesMarketAsset.DYDX]: 'DYDX',
	[FuturesMarketAsset.BNB]: 'Binance Coin',
	[FuturesMarketAsset.DOGE]: 'Dogecoin',
	[FuturesMarketAsset.OP]: 'Optimism',
	[FuturesMarketAsset.ARB]: 'Arbitrum',
	[FuturesMarketAsset.ATOM]: 'Cosmos',
	[FuturesMarketAsset.FTM]: 'Fantom',
	[FuturesMarketAsset.NEAR]: 'Near',
	[FuturesMarketAsset.FLOW]: 'Flow',
	[FuturesMarketAsset.AXS]: 'Axie Infinity',
	[FuturesMarketAsset.AUD]: 'Australian Dollar',
	[FuturesMarketAsset.GBP]: 'Pound Sterling',
	[FuturesMarketAsset.APT]: 'Aptos',
	[FuturesMarketAsset.LDO]: 'Lido',
	[FuturesMarketAsset.ADA]: 'Cardano',
	[FuturesMarketAsset.GMX]: 'GMX',
	[FuturesMarketAsset.FIL]: 'Filecoin',
	[FuturesMarketAsset.LTC]: 'Litecoin',
	[FuturesMarketAsset.BCH]: 'Bitcoin Cash',
	[FuturesMarketAsset.SHIB]: 'Shiba Inu',
	[FuturesMarketAsset.CRV]: 'Curve DAO',
	[FuturesMarketAsset.SUI]: 'Sui',
	[FuturesMarketAsset.PEPE]: 'Pepe',
	[FuturesMarketAsset.BLUR]: 'Blur',
	[FuturesMarketAsset.XRP]: 'XRP',
	[FuturesMarketAsset.DOT]: 'Polkadot',
	[FuturesMarketAsset.FLOKI]: 'Floki',
	[FuturesMarketAsset.INJ]: 'Injective',
	[FuturesMarketAsset.TRX]: 'Tron',
	[FuturesMarketAsset.STETH]: 'Lido Staked ETH',
} as const

export const marketOverrides: Partial<Record<FuturesMarketKey, Record<string, any>>> = {}
