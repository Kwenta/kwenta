import { BigNumber } from '@ethersproject/bignumber'
import { formatBytes32String } from '@ethersproject/strings'
import { wei } from '@synthetixio/wei'
import BN from 'bn.js'
import { Contract as MultiCallContract } from 'ethcall'
import { ethers, Contract } from 'ethers'

import KwentaSDK from '..'
import { KWENTA_TRACKING_CODE } from '../constants/futures'
import { ZERO_WEI, ZERO_BIG_NUM, UNIT_BIG_NUM, UNIT_BN } from '../constants/number'
import { FuturesMarketKey, PotentialTradeStatus } from '../types/futures'
import { multiplyDecimal, divideDecimal } from '../utils/number'

import PerpsV2Market from './abis/PerpsV2Market.json'
import { PerpsV2Market__factory } from './types'

// Need to recreate postTradeDetails from the contract here locally
// so we can modify margin for use with cross margin

// Code replicated from the following contracts

// https://github.com/Synthetixio/synthetix/blob/4d520d726bc013f2642dceb1dad4073fc78f4859/contracts/MixinFuturesViews.sol
// https://github.com/Synthetixio/synthetix/blob/4d2add4f74c68ac4f1106f6e7be4c31d4f1ccc76/contracts/FuturesMarketBase.sol
// https://github.com/Synthetixio/synthetix/blob/4b1b1b41598ca2f7f4cfc53e462c718023fe767e/contracts/FuturesMarketSettings.sol

type TradeParams = {
	sizeDelta: BigNumber
	fillPrice: BigNumber
	desiredFillPrice: BigNumber
	takerFee: BigNumber
	makerFee: BigNumber
	trackingCode: string
}

type Position = {
	id: string
	lastPrice: BigNumber
	size: BigNumber
	margin: BigNumber
	lastFundingIndex: BigNumber
}

type MarketSettings = {
	minInitialMargin: BigNumber
	takerFeeOffchainDelayedOrder: BigNumber
	makerFeeOffchainDelayedOrder: BigNumber
	maxLeverage: BigNumber
	maxMarketValue: BigNumber
	skewScale: BigNumber
	liquidationPremiumMultiplier: BigNumber
	maxFundingVelocity: BigNumber
	liquidationBufferRatio: BigNumber
	liquidationFeeRatio: BigNumber
	maxKeeperFee: BigNumber
	minKeeperFee: BigNumber
	keeperLiquidationFee: BigNumber
}

class FuturesMarketInternal {
	_sdk: KwentaSDK
	_provider: ethers.providers.Provider
	_perpsV2MarketContract: Contract
	_perpsV2MarketSettings: MultiCallContract | undefined
	_marketKeyBytes: string
	_block: ethers.providers.Block | null

	_onChainData: {
		assetPrice: BigNumber
		marketSkew: BigNumber
		marketSize: BigNumber
		fundingSequenceLength: BigNumber
		fundingLastRecomputed: number
		fundingRateLastRecomputed: number
		accruedFunding: BigNumber
	}

	_marketSettings: MarketSettings | undefined

	_cache: Record<string, BigNumber>

	constructor(
		sdk: KwentaSDK,
		provider: ethers.providers.Provider,
		marketKey: FuturesMarketKey,
		marketAddress: string
	) {
		this._sdk = sdk
		this._provider = provider

		this._perpsV2MarketContract = PerpsV2Market__factory.connect(marketAddress, provider)
		this._perpsV2MarketSettings = sdk.context.multicallContracts.PerpsV2MarketSettings
		this._marketKeyBytes = formatBytes32String(marketKey)
		this._cache = {}
		this._block = null
		this._onChainData = {
			assetPrice: BigNumber.from(0),
			marketSkew: BigNumber.from(0),
			marketSize: BigNumber.from(0),
			fundingSequenceLength: BigNumber.from(0),
			fundingLastRecomputed: 0,
			fundingRateLastRecomputed: 0,
			accruedFunding: BigNumber.from(0),
		}
	}

	getTradePreview = async (
		account: string,
		sizeDelta: BigNumber,
		marginDelta: BigNumber,
		tradePrice: BigNumber
	) => {
		const multiCallContract = new MultiCallContract(
			this._perpsV2MarketContract.address,
			PerpsV2Market
		)
		const preFetchedData = await this._sdk.context.multicallProvider.all([
			multiCallContract.assetPrice(),
			multiCallContract.marketSkew(),
			multiCallContract.marketSize(),
			multiCallContract.accruedFunding(account),
			multiCallContract.fundingSequenceLength(),
			multiCallContract.fundingLastRecomputed(),
			multiCallContract.fundingRateLastRecomputed(),
			multiCallContract.positions(account),
		])

		const blockNum = await this._provider?.getBlockNumber()
		this._block = await fetchBlockWithRetry(blockNum, this._provider)

		this._onChainData = {
			//@ts-ignore
			assetPrice: preFetchedData[0].price as BigNumber,
			marketSkew: preFetchedData[1] as BigNumber,
			marketSize: preFetchedData[2] as BigNumber,
			//@ts-ignore
			accruedFunding: preFetchedData[3].funding as BigNumber,
			fundingSequenceLength: preFetchedData[4] as BigNumber,
			fundingLastRecomputed: preFetchedData[5] as number,
			fundingRateLastRecomputed: preFetchedData[6] as number,
		}

		const position = preFetchedData[7] as Position

		const takerFee = await this._getSetting('takerFeeOffchainDelayedOrder')
		const makerFee = await this._getSetting('makerFeeOffchainDelayedOrder')
		const fillPrice = await this._fillPrice(sizeDelta, tradePrice)

		const tradeParams = {
			sizeDelta: sizeDelta,
			fillPrice: fillPrice,
			desiredFillPrice: tradePrice,
			makerFee: makerFee,
			takerFee: takerFee,
			trackingCode: KWENTA_TRACKING_CODE,
		}

		const { newPos, fee, status } = await this._postTradeDetails(position, tradeParams, marginDelta)

		const liqPrice = await this._approxLiquidationPrice(newPos, newPos.lastPrice)

		return { ...newPos, liqPrice: liqPrice, fee, price: newPos.lastPrice, status: status }
	}

	_postTradeDetails = async (
		oldPos: Position,
		tradeParams: TradeParams,
		marginDelta: BigNumber
	): Promise<{ newPos: Position; status: PotentialTradeStatus; fee: BigNumber }> => {
		if (!this._sdk.context.contracts.Exchanger) throw new Error('Unsupported network')
		// Reverts if the user is trying to submit a size-zero order.
		if (tradeParams.sizeDelta.eq(0) && marginDelta.eq(0)) {
			return { newPos: oldPos, fee: ZERO_BIG_NUM, status: PotentialTradeStatus.NIL_ORDER }
		}

		// The order is not submitted if the user's existing position needs to be liquidated.
		if (await this._canLiquidate(oldPos, this._onChainData.assetPrice)) {
			return { newPos: oldPos, fee: ZERO_BIG_NUM, status: PotentialTradeStatus.CAN_LIQUIDATE }
		}

		const fee = await this._orderFee(tradeParams)
		const { margin, status } = await this._recomputeMarginWithDelta(
			oldPos,
			tradeParams.fillPrice,
			marginDelta.sub(fee)
		)

		if (status !== PotentialTradeStatus.OK) {
			return { newPos: oldPos, fee: ZERO_BIG_NUM, status }
		}

		const lastFundingIndex = await this._latestFundingIndex()

		const newPos: Position = {
			id: oldPos.id,
			lastFundingIndex: lastFundingIndex,
			margin: margin,
			lastPrice: tradeParams.fillPrice,
			size: oldPos.size.add(tradeParams.sizeDelta),
		}

		const minInitialMargin = await this._getSetting('minInitialMargin')

		const positionDecreasing =
			newPos.size.eq(ZERO_BIG_NUM) ||
			(oldPos.size.gte(ZERO_BIG_NUM) === newPos.size.gte(ZERO_BIG_NUM) &&
				newPos.size.abs().lt(oldPos.size.abs()))

		if (!positionDecreasing) {
			if (newPos.margin.add(fee).lt(minInitialMargin)) {
				return {
					newPos: oldPos,
					fee: ZERO_BIG_NUM,
					status: PotentialTradeStatus.INSUFFICIENT_MARGIN,
				}
			}
		}

		const liqPremium = await this._liquidationPremium(newPos.size, this._onChainData.assetPrice)
		let liqMargin = await this._liquidationMargin(newPos.size, this._onChainData.assetPrice)
		liqMargin = liqMargin.add(liqPremium)

		if (margin.lte(liqMargin)) {
			return { newPos, fee: ZERO_BIG_NUM, status: PotentialTradeStatus.CAN_LIQUIDATE }
		}
		const maxLeverage = await this._getSetting('maxLeverage')
		const maxLeverageForSize = await this._maxLeverageForSize(newPos.size)

		const leverage = divideDecimal(
			multiplyDecimal(newPos.size, tradeParams.fillPrice),
			margin.add(fee)
		)

		if (
			maxLeverage.add(UNIT_BIG_NUM.div(100)).lt(leverage.abs()) ||
			leverage.abs().gt(maxLeverageForSize)
		) {
			return {
				newPos: oldPos,
				fee: ZERO_BIG_NUM,
				status: PotentialTradeStatus.MAX_LEVERAGE_EXCEEDED,
			}
		}

		const maxMarketValue = await this._getSetting('maxMarketValue')
		const tooLarge = await this._orderSizeTooLarge(maxMarketValue, oldPos.size, newPos.size)
		if (tooLarge) {
			return {
				newPos: oldPos,
				fee: ZERO_BIG_NUM,
				status: PotentialTradeStatus.MAX_MARKET_SIZE_EXCEEDED,
			}
		}

		return { newPos, fee: fee, status: PotentialTradeStatus.OK }
	}

	_liquidationPremium = async (positionSize: BigNumber, currentPrice: BigNumber) => {
		if (positionSize.eq(0)) {
			return 0
		}

		// note: this is the same as fillPrice() where the skew is 0.
		const notional = multiplyDecimal(positionSize, currentPrice).abs()
		const skewScale = await this._getSetting('skewScale')
		const liqPremiumMultiplier = await this._getSetting('liquidationPremiumMultiplier')
		const skewedSize = divideDecimal(positionSize.abs(), skewScale)
		const value = multiplyDecimal(skewedSize, notional)
		return multiplyDecimal(value, liqPremiumMultiplier)
	}

	_orderFee = async (tradeParams: TradeParams) => {
		const notionalDiff = multiplyDecimal(tradeParams.sizeDelta, tradeParams.fillPrice)
		const marketSkew = await this._onChainData.marketSkew
		if (this._sameSide(marketSkew.add(tradeParams.sizeDelta), marketSkew)) {
			const staticRate = this._sameSide(notionalDiff, marketSkew)
				? tradeParams.takerFee
				: tradeParams.makerFee

			return multiplyDecimal(notionalDiff, staticRate).abs()
		}

		// IGNORED DYNAMIC FEE //

		const takerSize = divideDecimal(
			marketSkew.add(tradeParams.sizeDelta),
			tradeParams.sizeDelta
		).abs()
		const makerSize = UNIT_BIG_NUM.sub(takerSize)
		const takerFee = multiplyDecimal(
			multiplyDecimal(notionalDiff, takerSize),
			tradeParams.takerFee
		).abs()
		const makerFee = multiplyDecimal(
			multiplyDecimal(notionalDiff, makerSize),
			tradeParams.makerFee
		).abs()

		return takerFee.add(makerFee)
	}

	_recomputeMarginWithDelta = async (
		position: Position,
		price: BigNumber,
		marginDelta: BigNumber
	) => {
		const marginPlusProfitFunding = await this._marginPlusProfitFunding(position, price)
		const newMargin = marginPlusProfitFunding.add(marginDelta)

		if (newMargin.lt(ZERO_WEI.toBN())) {
			return { margin: ZERO_WEI.toBN(), status: PotentialTradeStatus.INSUFFICIENT_MARGIN }
		}

		const lMargin = await this._liquidationMargin(position.size, price)

		if (!position.size.isZero() && newMargin.lt(lMargin)) {
			return { margin: newMargin, status: PotentialTradeStatus.CAN_LIQUIDATE }
		}
		return { margin: newMargin, status: PotentialTradeStatus.OK }
	}

	_marginPlusProfitFunding = async (position: Position, price: BigNumber) => {
		const funding = this._onChainData.accruedFunding
		return position.margin.add(this._profitLoss(position, price)).add(funding)
	}

	_profitLoss = (position: Position, price: BigNumber) => {
		const priceShift = price.sub(position.lastPrice)
		return multiplyDecimal(position.size, priceShift)
	}

	_nextFundingEntry = async (price: BigNumber) => {
		const latestFundingIndex = await this._latestFundingIndex()
		const fundingSequenceVal = await this._perpsV2MarketContract.fundingSequence(latestFundingIndex)
		const unrecordedFunding = await this._unrecordedFunding(price)
		return fundingSequenceVal.add(unrecordedFunding)
	}

	_latestFundingIndex = async () => {
		const fundingSequenceLength = this._onChainData.fundingSequenceLength
		return fundingSequenceLength.sub(1) // at least one element is pushed in constructor
	}

	_netFundingPerUnit = async (startIndex: BigNumber, price: BigNumber) => {
		const fundingSequenceVal = await this._perpsV2MarketContract.fundingSequence(
			startIndex.toNumber()
		)
		const nextFunding = await this._nextFundingEntry(price)
		return nextFunding.sub(fundingSequenceVal)
	}

	_proportionalElapsed = async () => {
		// TODO: get block at the start
		if (!this._block) throw new Error('Missing block data')
		const fundingLastRecomputed = this._onChainData.fundingLastRecomputed
		const rate = BigNumber.from(this._block.timestamp).sub(fundingLastRecomputed)
		return divideDecimal(rate, BigNumber.from(86400))
	}

	_currentFundingVelocity = async () => {
		const maxFundingVelocity = await this._getSetting('maxFundingVelocity')
		const skew = await this._proportionalSkew()
		return multiplyDecimal(skew, maxFundingVelocity)
	}

	_currentFundingRate = async () => {
		const fundingRateLastRecomputed = this._onChainData.fundingRateLastRecomputed
		const elapsed = await this._proportionalElapsed()
		const velocity = await this._currentFundingVelocity()
		return BigNumber.from(fundingRateLastRecomputed).add(multiplyDecimal(velocity, elapsed))
	}

	_unrecordedFunding = async (price: BigNumber) => {
		const fundingRateLastRecomputed = BigNumber.from(this._onChainData.fundingRateLastRecomputed)
		const nextFundingRate = await this._currentFundingRate()
		const elapsed = await this._proportionalElapsed()
		const avgFundingRate = divideDecimal(
			fundingRateLastRecomputed.add(nextFundingRate).mul(-1),
			UNIT_BIG_NUM.mul(2)
		)
		return multiplyDecimal(multiplyDecimal(avgFundingRate, elapsed), price)
	}

	_proportionalSkew = async () => {
		const marketSkew = await this._onChainData.marketSkew
		const skewScale = await this._getSetting('skewScale')

		const pSkew = divideDecimal(marketSkew, skewScale)

		// Ensures the proportionalSkew is between -1 and 1.
		const proportionalSkew = BN.min(BN.max(UNIT_BN.neg(), new BN(pSkew.toString())), UNIT_BN)
		return BigNumber.from(proportionalSkew.toString())
	}

	_approxLiquidationPrice = async (position: Position, currentPrice: BigNumber) => {
		if (position.size.isZero()) {
			return BigNumber.from('0')
		}

		const fundingPerUnit = await this._netFundingPerUnit(position.lastFundingIndex, currentPrice)
		const liqMargin = await this._liquidationMargin(position.size, currentPrice)
		const liqPremium = await this._liquidationPremium(position.size, currentPrice)
		const result = position.lastPrice
			.add(divideDecimal(liqMargin.sub(position.margin.sub(liqPremium)), position.size))
			.sub(fundingPerUnit)
		return result.lt(0) ? BigNumber.from(0) : result
	}

	_exactLiquidationMargin = async (positionSize: BigNumber, price: BigNumber) => {
		const keeperFee = await this._liquidationFee(positionSize, price)
		const stakerFee = await this._stakerFee(positionSize, price)
		return keeperFee.add(stakerFee)
	}

	_liquidationMargin = async (positionSize: BigNumber, price: BigNumber) => {
		const liquidationBufferRatio = await this._getSetting('liquidationBufferRatio')
		const liqKeeperFee = await this._getSetting('keeperLiquidationFee')
		const liquidationBuffer = multiplyDecimal(
			multiplyDecimal(positionSize.abs(), price),
			liquidationBufferRatio
		)
		const fee = await this._liquidationFee(positionSize, price)
		return liquidationBuffer.add(fee).add(liqKeeperFee)
	}

	_liquidationFee = async (positionSize: BigNumber, price: BigNumber) => {
		const liquidationFeeRatio = await this._getSetting('liquidationFeeRatio')
		const minFee = await this._getSetting('minKeeperFee')
		const maxFee = await this._getSetting('maxKeeperFee')
		const proportionalFee = multiplyDecimal(
			multiplyDecimal(positionSize.abs(), price),
			liquidationFeeRatio
		)
		const cappedProportionalFee = proportionalFee.gt(maxFee) ? maxFee : proportionalFee
		return cappedProportionalFee.gt(minFee) ? proportionalFee : minFee
	}

	_stakerFee = async (positionSize: BigNumber, price: BigNumber) => {
		const liquidationBufferRatio = await this._getSetting('liquidationBufferRatio')
		const stakerFee = multiplyDecimal(
			multiplyDecimal(positionSize.abs(), price),
			liquidationBufferRatio
		)
		return stakerFee
	}

	_fillPrice = async (size: BigNumber, price: BigNumber) => {
		const marketSkew = await this._onChainData.marketSkew
		const skewScale = await this._getSetting('skewScale')

		const pdBefore = divideDecimal(marketSkew, skewScale)
		const pdAfter = divideDecimal(marketSkew.add(size), skewScale)
		const priceBefore = price.add(multiplyDecimal(price, pdBefore))
		const priceAfter = price.add(multiplyDecimal(price, pdAfter))

		// How is the p/d-adjusted price calculated using an example:
		//
		// price      = $1200 USD (oracle)
		// size       = 100
		// skew       = 0
		// skew_scale = 1,000,000 (1M)
		//
		// Then,
		//
		// pd_before = 0 / 1,000,000
		//           = 0
		// pd_after  = (0 + 100) / 1,000,000
		//           = 100 / 1,000,000
		//           = 0.0001
		//
		// price_before = 1200 * (1 + pd_before)
		//              = 1200 * (1 + 0)
		//              = 1200
		// price_after  = 1200 * (1 + pd_after)
		//              = 1200 * (1 + 0.0001)
		//              = 1200 * (1.0001)
		//              = 1200.12
		// Finally,
		//
		// fill_price = (price_before + price_after) / 2
		//            = (1200 + 1200.12) / 2
		//            = 1200.06
		return divideDecimal(priceBefore.add(priceAfter), UNIT_BIG_NUM.mul(2))
	}

	_canLiquidate = async (position: Position, price: BigNumber) => {
		// No liquidating empty positions.
		if (position.size.eq(0)) {
			return false
		}

		const remainingLiquidatableMargin = await this._remainingLiquidatableMargin(position, price)
		const liqMargin = await this._liquidationMargin(position.size, price)

		return remainingLiquidatableMargin.lt(liqMargin)
	}

	_remainingLiquidatableMargin = async (position: Position, price: BigNumber) => {
		const liqPremium = await this._liquidationPremium(position.size, price)
		const marginPlusProfitFunding = await this._marginPlusProfitFunding(position, price)
		const remaining = marginPlusProfitFunding.sub(liqPremium)
		return remaining.gt(0) ? remaining : ZERO_BIG_NUM
	}

	_orderSizeTooLarge = async (maxSize: BigNumber, oldSize: BigNumber, newSize: BigNumber) => {
		if ((this._sameSide(oldSize, newSize) && newSize.abs().lte(oldSize.abs())) || newSize.eq(0)) {
			return false
		}

		const marketSkew = this._onChainData.marketSkew
		const marketSize = this._onChainData.marketSize

		const newSkew = marketSkew.sub(oldSize).add(newSize)
		const newMarketSize = marketSize.sub(oldSize.abs()).add(newSize.abs())

		let newSideSize
		if (newSize.gt(ZERO_BIG_NUM)) {
			newSideSize = newMarketSize.add(newSkew)
		} else {
			newSideSize = newMarketSize.sub(newSkew)
		}

		if (maxSize.lt(newSideSize.div(2).abs())) {
			return true
		}

		return false
	}

	_maxLeverageForSize = async (size: BigNumber) => {
		const skewScale = await this._getSetting('skewScale')
		const liqPremMultiplier = await this._getSetting('liquidationPremiumMultiplier')
		const liqBufferRatio = await this._getSetting('liquidationBufferRatio')
		const liqBuffer = wei(0.5)

		const liqBufferRatioWei = wei(liqBufferRatio)
		const liqPremMultiplierWei = wei(liqPremMultiplier)
		const skewScaleWei = wei(skewScale)

		return liqBuffer
			.div(wei(size).abs().div(skewScaleWei).mul(liqPremMultiplierWei).add(liqBufferRatioWei))
			.toBN()
	}

	_sameSide(a: BigNumber, b: BigNumber) {
		return a.gte(ZERO_BIG_NUM) === b.gte(ZERO_BIG_NUM)
	}

	_batchGetSettings = async () => {
		if (!this._perpsV2MarketSettings) throw new Error('Market settings not initialized')
		const settings = (await this._sdk.context.multicallProvider.all([
			this._perpsV2MarketSettings.minInitialMargin(),
			this._perpsV2MarketSettings.takerFeeOffchainDelayedOrder(this._marketKeyBytes),
			this._perpsV2MarketSettings.makerFeeOffchainDelayedOrder(this._marketKeyBytes),
			this._perpsV2MarketSettings.maxLeverage(this._marketKeyBytes),
			this._perpsV2MarketSettings.maxMarketValue(this._marketKeyBytes),
			this._perpsV2MarketSettings.skewScale(this._marketKeyBytes),
			this._perpsV2MarketSettings.liquidationPremiumMultiplier(this._marketKeyBytes),
			this._perpsV2MarketSettings.maxFundingVelocity(this._marketKeyBytes),
			this._perpsV2MarketSettings.liquidationBufferRatio(this._marketKeyBytes),
			this._perpsV2MarketSettings.liquidationFeeRatio(),
			this._perpsV2MarketSettings.maxKeeperFee(),
			this._perpsV2MarketSettings.minKeeperFee(),
			this._perpsV2MarketSettings.keeperLiquidationFee(),
		])) as BigNumber[]
		this._marketSettings = {
			minInitialMargin: settings[0],
			takerFeeOffchainDelayedOrder: settings[1],
			makerFeeOffchainDelayedOrder: settings[2],
			maxLeverage: settings[3],
			maxMarketValue: settings[4],
			skewScale: settings[5],
			liquidationPremiumMultiplier: settings[6],
			maxFundingVelocity: settings[7],
			liquidationBufferRatio: settings[8],
			liquidationFeeRatio: settings[9],
			maxKeeperFee: settings[10],
			minKeeperFee: settings[11],
			keeperLiquidationFee: settings[12],
		}
		return this._marketSettings
	}

	_getSetting = async (settingType: keyof MarketSettings) => {
		if (this._marketSettings) return this._marketSettings[settingType]
		const settings = await this._batchGetSettings()
		return settings[settingType]
	}
}

const fetchBlockWithRetry = async (
	blockNum: number,
	provider: ethers.providers.Provider,
	count = 0
): Promise<ethers.providers.Block | null> => {
	// Sometimes the block number is returned before the block
	// is ready to fetch and so getBlock returns null
	const block = await provider?.getBlock(blockNum)
	if (block) return block
	if (count > 5) return null
	await new Promise((resolve) => setTimeout(resolve, 200))
	return fetchBlockWithRetry(blockNum, provider, count + 1)
}

export default FuturesMarketInternal
