import { SynthetixJS } from '@synthetixio/contracts-interface';
import { wei, WeiSource } from '@synthetixio/wei';
import BN from 'bn.js';
import { BigNumber, Contract, ethers } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';
import { useMemo } from 'react';

import Connector from 'containers/Connector';
import { PotentialTradeStatus } from 'sections/futures/types';
import {
	zeroBN,
	ZERO_BIG_NUM,
	UNIT_BIG_NUM,
	UNIT_BN,
	multiplyDecimal,
	divideDecimal,
} from 'utils/formatters/number';
import { FuturesMarketAsset } from 'utils/futures';

import { getFuturesMarketContract } from './utils';

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

export default function useGetCrossMarginTradePreview(
	marketAsset: FuturesMarketAsset,
	address: string | null | undefined
) {
	const { synthetixjs, provider } = Connector.useContainer();

	const contractInstance = useMemo(() => {
		if (!synthetixjs || !provider || !address) return null;
		return new FuturesMarketInternal(synthetixjs, provider, marketAsset, address);
	}, [synthetixjs, provider, address, marketAsset]);

	const getPreview = async (
		sizeDelta: WeiSource | null | undefined,
		marginDelta: WeiSource | null | undefined
	) => {
		if (contractInstance) {
			const sizeBN = wei(sizeDelta || 0).toBN();
			const marginBN = wei(marginDelta || 0).toBN();
			const res = await contractInstance.getTradePreview(sizeBN, marginBN);
			return res;
		}
	};

	return getPreview;
}

class FuturesMarketInternal {
	_synthetixjs: SynthetixJS;
	_provider: ethers.providers.Provider;
	_futuresMarketContract: Contract;
	_futuresSettingsContract: Contract;
	_marketKeyBytes: string;
	_account: string;

	_cache: Record<string, BigNumber>;

	constructor(
		synthetixjs: SynthetixJS,
		provider: ethers.providers.Provider,
		marketAsset: FuturesMarketAsset,
		account: string
	) {
		this._synthetixjs = synthetixjs;
		this._provider = provider;

		this._futuresMarketContract = getFuturesMarketContract(marketAsset, synthetixjs.contracts);
		this._futuresSettingsContract = synthetixjs.contracts.FuturesMarketSettings;

		this._marketKeyBytes = formatBytes32String(marketAsset);
		this._account = account;
		this._cache = {};
	}

	getTradePreview = async (sizeDelta: BigNumber, marginDelta: BigNumber) => {
		const position = await this._futuresMarketContract.positions(this._account);
		const price = await this._futuresMarketContract.assetPrice();

		const takerFee = await this._getSetting('takerFee', [this._marketKeyBytes]);
		const makerFee = await this._getSetting('makerFee', [this._marketKeyBytes]);

		const tradeParams = {
			sizeDelta,
			price: price.price,
			takerFee,
			makerFee,
			trackingCode: formatBytes32String('0'),
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
		const dynamicFee = await this._synthetixjs.contracts.Exchanger.dynamicFeeRateForExchange(
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
			return { newPos: oldPos, fee: zeroBN, status: PotentialTradeStatus.MAX_LEVERAGE_EXCEEDED };
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
		const marketSkew = await this._futuresMarketContract.marketSkew();
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
		const { funding } = await this._futuresMarketContract.accruedFunding(this._account);
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
		const fundingSequenceLength = await this._futuresMarketContract.fundingSequenceLength();
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
		const max = BN.max(UNIT_BN.neg(), new BN('-' + skew.toString()));
		const min = BigNumber.from(BN.min(max, UNIT_BN).toString());

		return multiplyDecimal(min, maxFundingRate);
	};

	_unrecordedFunding = async (price: BigNumber) => {
		const blockNum = await this._provider?.getBlockNumber();
		const block = await this._provider?.getBlock(blockNum);
		const fundingLastRecomputed = await this._futuresMarketContract.fundingLastRecomputed();
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
		const marketSkew = await this._futuresMarketContract.marketSkew();
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

		const marketSkew = await this._futuresMarketContract.marketSkew();
		const marketSize = await this._futuresMarketContract.marketSize();

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
		if (cached) return cached;
		const res = await this._futuresSettingsContract[settingGetter](...params);
		this._cache[settingGetter] = res;
		return res;
	};
}
