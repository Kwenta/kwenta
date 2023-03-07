import BN from 'bn.js';
import { Provider, Contract as MultiCallContract } from 'ethcall';
import { BigNumber, ethers, Contract } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';

import { KWENTA_TRACKING_CODE } from 'sdk/constants/futures';
import FuturesMarket from 'sdk/contracts/abis/FuturesMarket.json';
import { FuturesMarket__factory } from 'sdk/contracts/types';
import { FuturesMarketKey, PotentialTradeStatus } from 'sdk/types/futures';
import { sdk } from 'state/config';
import {
	zeroBN,
	ZERO_BIG_NUM,
	UNIT_BIG_NUM,
	UNIT_BN,
	multiplyDecimal,
	divideDecimal,
} from 'utils/formatters/number';

// Need to recreate postTradeDetails from the contract here locally
// so we can modify margin for use with cross margin

// Code replicated from the following contracts

// https://github.com/Synthetixio/synthetix/blob/4d520d726bc013f2642dceb1dad4073fc78f4859/contracts/MixinFuturesViews.sol
// https://github.com/Synthetixio/synthetix/blob/4d2add4f74c68ac4f1106f6e7be4c31d4f1ccc76/contracts/FuturesMarketBase.sol
// https://github.com/Synthetixio/synthetix/blob/4b1b1b41598ca2f7f4cfc53e462c718023fe767e/contracts/FuturesMarketSettings.sol

type TradeParams = {
	sizeDelta: BigNumber;
	price: BigNumber;
	takerFee: BigNumber;
	makerFee: BigNumber;
	trackingCode: string;
};

type Position = {
	id: string;
	lastPrice: BigNumber;
	size: BigNumber;
	margin: BigNumber;
	lastFundingIndex: BigNumber;
};

const ethcallProvider = new Provider();

class FuturesMarketInternal {
	_provider: ethers.providers.Provider;
	_futuresMarketContract: Contract;
	_futuresSettingsContract: Contract | undefined;
	_marketKeyBytes: string;

	_onChainData: {
		assetPrice: BigNumber;
		marketSkew: BigNumber;
		marketSize: BigNumber;
		fundingSequenceLength: BigNumber;
		fundingLastRecomputed: number;
		accruedFunding: BigNumber;
	};

	_cache: Record<string, BigNumber>;

	constructor(
		provider: ethers.providers.Provider,
		marketKey: FuturesMarketKey,
		marketAddress: string
	) {
		this._provider = provider;

		this._futuresMarketContract = FuturesMarket__factory.connect(marketAddress, provider);
		this._futuresSettingsContract = sdk.context.contracts.FuturesMarketSettings;
		this._marketKeyBytes = formatBytes32String(marketKey);
		this._cache = {};
		this._onChainData = {
			assetPrice: BigNumber.from(0),
			marketSkew: BigNumber.from(0),
			marketSize: BigNumber.from(0),
			fundingSequenceLength: BigNumber.from(0),
			fundingLastRecomputed: 0,
			accruedFunding: BigNumber.from(0),
		};
	}

	getTradePreview = async (
		account: string,
		sizeDelta: BigNumber,
		marginDelta: BigNumber,
		limitStopPrice?: BigNumber
	) => {
		const multiCallContract = new MultiCallContract(
			this._futuresMarketContract.address,
			FuturesMarket
		);
		await ethcallProvider.init(this._provider as any);
		const preFetchedData = await ethcallProvider.all([
			multiCallContract.assetPrice(),
			multiCallContract.marketSkew(),
			multiCallContract.marketSize(),
			multiCallContract.accruedFunding(account),
			multiCallContract.fundingSequenceLength(),
			multiCallContract.fundingLastRecomputed(),
			multiCallContract.positions(account),
		]);

		this._onChainData = {
			//@ts-ignore
			assetPrice: preFetchedData[0].price as BigNumber,
			marketSkew: preFetchedData[1] as BigNumber,
			marketSize: preFetchedData[2] as BigNumber,
			//@ts-ignore
			accruedFunding: preFetchedData[3].funding as BigNumber,
			fundingSequenceLength: preFetchedData[4] as BigNumber,
			fundingLastRecomputed: preFetchedData[5] as number,
		};

		const position = preFetchedData[6] as Position;
		const price = limitStopPrice || this._onChainData.assetPrice;

		const takerFee = await this._getSetting('takerFee', [this._marketKeyBytes]);
		const makerFee = await this._getSetting('makerFee', [this._marketKeyBytes]);

		const tradeParams = {
			sizeDelta,
			price: price,
			takerFee,
			makerFee,
			trackingCode: KWENTA_TRACKING_CODE,
		};

		const { newPos, fee, status } = await this._postTradeDetails(
			position,
			tradeParams,
			marginDelta
		);

		const liqPrice = await this._approxLiquidationPrice(newPos, newPos.lastPrice);
		return { ...newPos, liqPrice, fee, price: tradeParams.price, status: status };
	};

	_postTradeDetails = async (
		oldPos: Position,
		tradeParams: TradeParams,
		marginDelta: BigNumber
	) => {
		if (!sdk.context.contracts.Exchanger) throw new Error('Unsupported network');
		const dynamicFee = await sdk.context.contracts.Exchanger?.dynamicFeeRateForExchange(
			formatBytes32String('sUSD'),
			this._marketKeyBytes
		);

		if (dynamicFee.tooVolatile) {
			return { newPos: oldPos, fee: ZERO_BIG_NUM, status: PotentialTradeStatus.PRICE_TOO_VOLATILE };
		}

		const fee = await this._orderFee(tradeParams, dynamicFee.feeRate);

		const { margin, status } = await this._recomputeMarginWithDelta(
			oldPos,
			tradeParams.price,
			marginDelta.add(fee.mul(-1))
		);

		if (status !== PotentialTradeStatus.OK) {
			return { newPos: oldPos, fee: ZERO_BIG_NUM, status };
		}

		const lastFundingIndex = await this._latestFundingIndex();

		const newPos: Position = {
			id: oldPos.id,
			lastFundingIndex: lastFundingIndex,
			margin: margin,
			lastPrice: tradeParams.price,
			size: oldPos.size.add(tradeParams.sizeDelta),
		};

		const minInitialMargin = await this._getSetting('minInitialMargin');

		const positionDecreasing =
			oldPos.size.gte(ZERO_BIG_NUM) === newPos.size.gte(ZERO_BIG_NUM) &&
			newPos.size.abs().lt(oldPos.size.abs());
		if (!positionDecreasing) {
			if (newPos.margin.add(fee).lt(minInitialMargin)) {
				return {
					newPos: oldPos,
					fee: ZERO_BIG_NUM,
					status: PotentialTradeStatus.INSUFFICIENT_MARGIN,
				};
			}
		}

		const liqMargin = await this._liquidationMargin(newPos.size, tradeParams.price);
		if (margin.lte(liqMargin)) {
			return { newPos, fee: ZERO_BIG_NUM, status: PotentialTradeStatus.CAN_LIQUIDATE };
		}
		const maxLeverage = await this._getSetting('maxLeverage', [this._marketKeyBytes]);

		const leverage = divideDecimal(
			multiplyDecimal(newPos.size, tradeParams.price),
			margin.add(fee)
		);

		if (maxLeverage.add(UNIT_BIG_NUM.div(100)).lt(leverage.abs())) {
			return {
				newPos: oldPos,
				fee: ZERO_BIG_NUM,
				status: PotentialTradeStatus.MAX_LEVERAGE_EXCEEDED,
			};
		}

		const maxMarketValueUSD = await this._getSetting('maxMarketValueUSD', [this._marketKeyBytes]);
		const max = maxMarketValueUSD.add(UNIT_BIG_NUM.mul(100));
		const tooLarge = await this._orderSizeTooLarge(
			divideDecimal(max, tradeParams.price),
			oldPos.size,
			newPos.size
		);
		if (tooLarge) {
			return {
				newPos: oldPos,
				fee: ZERO_BIG_NUM,
				status: PotentialTradeStatus.MAX_MARKET_SIZE_EXCEEDED,
			};
		}

		return { newPos, fee: fee, status: PotentialTradeStatus.OK };
	};

	_orderFee = async (tradeParams: TradeParams, dynamicFeeRate: BigNumber) => {
		const notionalDiff = multiplyDecimal(tradeParams.sizeDelta, tradeParams.price);
		const marketSkew = await this._onChainData.marketSkew;
		const sameSide = notionalDiff.gte(0) === marketSkew.gte(0);
		const staticRate = sameSide ? tradeParams.takerFee : tradeParams.makerFee;
		const feeRate = staticRate.add(dynamicFeeRate);
		return multiplyDecimal(notionalDiff, feeRate).abs();
	};

	_recomputeMarginWithDelta = async (
		position: Position,
		price: BigNumber,
		marginDelta: BigNumber
	) => {
		const marginPlusProfitFunding = await this._marginPlusProfitFunding(position, price);
		const newMargin = marginPlusProfitFunding.add(marginDelta);

		if (newMargin.lt(zeroBN.toBN())) {
			return { margin: zeroBN.toBN(), status: PotentialTradeStatus.INSUFFICIENT_MARGIN };
		}

		const lMargin = await this._liquidationMargin(position.size, price);

		if (!position.size.isZero() && newMargin.lt(lMargin)) {
			return { margin: newMargin, status: PotentialTradeStatus.CAN_LIQUIDATE };
		}
		return { margin: newMargin, status: PotentialTradeStatus.OK };
	};

	_marginPlusProfitFunding = async (position: Position, price: BigNumber) => {
		const funding = this._onChainData.accruedFunding;
		return position.margin.add(this._profitLoss(position, price)).add(funding);
	};

	_profitLoss = (position: Position, price: BigNumber) => {
		const priceShift = price.sub(position.lastPrice);
		return multiplyDecimal(position.size, priceShift);
	};

	_nextFundingEntry = async (price: BigNumber) => {
		const latestFundingIndex = await this._latestFundingIndex();
		const fundingSequenceVal = await this._futuresMarketContract.fundingSequence(
			latestFundingIndex
		);
		const unrecordedFunding = await this._unrecordedFunding(price);
		return fundingSequenceVal.add(unrecordedFunding);
	};

	_latestFundingIndex = async () => {
		const fundingSequenceLength = this._onChainData.fundingSequenceLength;
		return fundingSequenceLength.sub(1); // at least one element is pushed in constructor
	};

	_netFundingPerUnit = async (startIndex: BigNumber, price: BigNumber) => {
		const fundingSequenceVal = await this._futuresMarketContract.fundingSequence(
			startIndex.toNumber()
		);
		const nextFunding = await this._nextFundingEntry(price);
		return nextFunding.sub(fundingSequenceVal);
	};

	_currentFundingRate = async (price: BigNumber) => {
		const maxFundingRate = await this._getSetting('maxFundingRate', [this._marketKeyBytes]);
		const skew = await this._proportionalSkew(price);

		const max = BN.max(UNIT_BN.neg(), new BN(skew.toString()).neg());
		const min = BigNumber.from(BN.min(max, UNIT_BN).toString());

		return multiplyDecimal(min, maxFundingRate);
	};

	_unrecordedFunding = async (price: BigNumber) => {
		const blockNum = await this._provider?.getBlockNumber();
		const block = await this._provider?.getBlock(blockNum);
		const fundingLastRecomputed = this._onChainData.fundingLastRecomputed;
		const elapsed = BigNumber.from(block.timestamp).sub(fundingLastRecomputed);
		const currentFundingRatePerSecond = (await this._currentFundingRate(price)).div(
			BigNumber.from(86400)
		);
		return multiplyDecimal(currentFundingRatePerSecond, price).mul(elapsed);
	};

	_proportionalSkew = async (price: BigNumber) => {
		if (price.lte(0)) throw new Error("price can't be zero");
		const skewScaleUSD = await this._getSetting('skewScaleUSD', [this._marketKeyBytes]);
		const skewScaleBaseAsset = divideDecimal(skewScaleUSD, price);
		if (skewScaleBaseAsset.isZero()) throw new Error('skewScale is zero');
		const marketSkew = this._onChainData.marketSkew;
		return divideDecimal(marketSkew, skewScaleBaseAsset);
	};

	_approxLiquidationPrice = async (position: Position, currentPrice: BigNumber) => {
		if (position.size.isZero()) {
			return BigNumber.from('0');
		}

		const fundingPerUnit = await this._netFundingPerUnit(position.lastFundingIndex, currentPrice);
		const liqMargin = await this._liquidationMargin(position.size, currentPrice);

		const result = position.lastPrice
			.add(divideDecimal(liqMargin.sub(position.margin), position.size))
			.sub(fundingPerUnit);

		return result.lt(0) ? BigNumber.from(0) : result;
	};

	_liquidationMargin = async (positionSize: BigNumber, price: BigNumber) => {
		const liquidationBufferRatio = await this._getSetting('liquidationBufferRatio');
		const liquidationBuffer = multiplyDecimal(
			multiplyDecimal(positionSize.abs(), price),
			liquidationBufferRatio
		);
		const fee = await this._liquidationFee(positionSize, price);
		return liquidationBuffer.add(fee);
	};

	_liquidationFee = async (positionSize: BigNumber, price: BigNumber) => {
		const liquidationFeeRatio = await this._getSetting('liquidationFeeRatio');
		const proportionalFee = multiplyDecimal(
			multiplyDecimal(positionSize.abs(), price),
			liquidationFeeRatio
		);
		const minFee = await this._getSetting('minKeeperFee');
		return proportionalFee.gt(minFee) ? proportionalFee : minFee;
	};

	_orderSizeTooLarge = async (maxSize: BigNumber, oldSize: BigNumber, newSize: BigNumber) => {
		if (this._sameSide(oldSize, newSize) && newSize.abs().lte(oldSize.abs())) {
			return false;
		}

		const marketSkew = this._onChainData.marketSkew;
		const marketSize = this._onChainData.marketSize;

		const newSkew = marketSkew.sub(oldSize).add(newSize);
		const newMarketSize = marketSize.sub(oldSize.abs()).add(newSize);

		let newSideSize;
		if (newSize.gt(ZERO_BIG_NUM)) {
			newSideSize = newMarketSize.add(newSkew);
		} else {
			newSideSize = newMarketSize.sub(newSkew);
		}

		if (maxSize.lt(newSideSize.div(2).abs())) {
			return true;
		}

		return false;
	};

	_sameSide(a: BigNumber, b: BigNumber) {
		return a.gte(ZERO_BIG_NUM) === b.gte(ZERO_BIG_NUM);
	}

	_getSetting = async (settingGetter: string, params: any[] = []) => {
		const cached = this._cache[settingGetter];
		if (!this._futuresSettingsContract) throw new Error('Unsupported network');
		if (cached) return cached;
		const res = await this._futuresSettingsContract[settingGetter](...params);
		this._cache[settingGetter] = res;
		return res;
	};
}

export default FuturesMarketInternal;
