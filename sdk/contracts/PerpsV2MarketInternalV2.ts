import BN from 'bn.js';
import { Provider, Contract as MultiCallContract } from 'ethcall';
import { BigNumber, ethers, Contract } from 'ethers';
import { formatBytes32String } from 'ethers/lib/utils';

import { KWENTA_TRACKING_CODE } from 'sdk/constants/futures';
import PerpsV2Market from 'sdk/contracts/abis/PerpsV2Market.json';
import { PerpsV2Market__factory } from 'sdk/contracts/types';
import { FuturesMarketAsset, FuturesMarketKey, PotentialTradeStatus } from 'sdk/types/futures';
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

// TODO: Delete once fundingRateLastRecomputed is added to proxy
const MARKET_ADDRESSES = {
	AAVE: '0x794AFd9B432DE16450fF118f6402cf591E7226b6',
	APE: '0xabE0b70033Da709a1a2ECF78CcbB6649A997199b',
	ATOM: '0xbd352Bd6D6f81395EB94ba3778Aa3c7c523B1D97',
	AUD: '0xf84312375eb2BBBdE43D6069CAcc4a0a156d6d9b',
	AVAX: '0x7d470b2c680Df1299e181E6a2Ec00A97fA5b3a2c',
	AXS: '0xf1F58f5aAA20D1556e6C55C340Bc2fb6af9f1f91',
	BNB: '0xDb1bee7A74a3E9B4da83799F85Aa3A8f9A40786c',
	sBTC: '0xb82C1c9491A529F7AB9B4A6d42537eDDe28d83F3',
	DOGE: '0xD51d38F95d590E8aC327740439Cc914394076E70',
	DYDX: '0x55B85653DF3e5fba20c314d37ED2aA135E47A174',
	sETH: '0x3ad86e158377264F5d4C7625798496D279e7E33a',
	EUR: '0xEB6a3a7d38Cd37Cf8ef2158c247249e6809ede2c',
	FLOW: '0x1eD0E066cFB00FdfB62f98EBE1E450053f7D304c',
	FTM: '0x201fbc5DF6A12e7ED013cf2A4272643578e9B660',
	GBP: '0xD4B5e6fD9D5E2C192CF0DA5B56702A5F12459Bc8',
	LINK: '0xd079A9622ECFa67eAA4072b86DE84A9f0574dBbe',
	MATIC: '0xe184b90580D61c1D48d4eE7D4583e37871d4117c',
	NEAR: '0xEFEd528e5161fE26632fa1195A4a6d692cCb66D7',
	OP: '0x6bb821777814C5ac99A663B58e816479a4dca6e7',
	SOL: '0x2fe08C69D8ab826b4E08c47F0EEa9090255f2840',
	UNI: '0x9dD3D55Be18D138E304A6191D78baf62ec12044e',
	XAG: '0xa394e42D93a8B9EB4F758566b79dA150CA5B7Fa0',
	XAU: '0xc9951483d3f8370BCb9617805Ce3B7873B5aDA08',
};

class FuturesMarketInternal {
	_provider: ethers.providers.Provider;
	_perpsV2MarketContract: Contract;
	_perpsV2MarketSettings: Contract | undefined;
	_marketKeyBytes: string;

	_onChainData: {
		assetPrice: BigNumber;
		marketSkew: BigNumber;
		marketSize: BigNumber;
		fundingSequenceLength: BigNumber;
		fundingLastRecomputed: number;
		fundingRateLastRecomputed: number;
		accruedFunding: BigNumber;
	};

	_cache: Record<string, BigNumber>;

	constructor(
		provider: ethers.providers.Provider,
		marketKey: FuturesMarketKey,
		marketAddress: string
	) {
		this._provider = provider;

		this._perpsV2MarketContract = PerpsV2Market__factory.connect(marketAddress, provider);
		this._perpsV2MarketSettings = sdk.context.contracts.PerpsV2MarketSettingsUpgraded;
		this._marketKeyBytes = formatBytes32String(marketKey);
		this._cache = {};
		this._onChainData = {
			assetPrice: BigNumber.from(0),
			marketSkew: BigNumber.from(0),
			marketSize: BigNumber.from(0),
			fundingSequenceLength: BigNumber.from(0),
			fundingLastRecomputed: 0,
			fundingRateLastRecomputed: 0,
			accruedFunding: BigNumber.from(0),
		};
	}

	getTradePreview = async (
		marketAsset: FuturesMarketAsset,
		account: string,
		sizeDelta: BigNumber,
		marginDelta: BigNumber,
		limitStopPrice?: BigNumber
	) => {
		const multiCallContract = new MultiCallContract(
			this._perpsV2MarketContract.address,
			PerpsV2Market
		);
		const stateMultiCallContract = new MultiCallContract(
			// TODO: Waiting for fundingRateLastRecomputed to be added to proxy
			// (ETH PERPS state address for now)
			MARKET_ADDRESSES[marketAsset],
			PerpsV2Market
		);
		await ethcallProvider.init(this._provider as any);
		const preFetchedData = await ethcallProvider.all([
			multiCallContract.assetPrice(),
			multiCallContract.marketSkew(),
			multiCallContract.marketSize(),
			multiCallContract.accruedFunding(account),
			multiCallContract.fundingSequenceLength(),
			multiCallContract.fundingLastRecomputed(),
			stateMultiCallContract.fundingRateLastRecomputed(),
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
			fundingRateLastRecomputed: preFetchedData[6] as number,
		};

		const position = preFetchedData[7] as Position;
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
	): Promise<{ newPos: Position; status: PotentialTradeStatus; fee: BigNumber }> => {
		if (!sdk.context.contracts.Exchanger) throw new Error('Unsupported network');
		// Reverts if the user is trying to submit a size-zero order.
		if (tradeParams.sizeDelta.eq(0) && marginDelta.eq(0)) {
			return { newPos: oldPos, fee: ZERO_BIG_NUM, status: PotentialTradeStatus.NIL_ORDER };
		}

		const fee = await this._orderFee(tradeParams);
		const { margin, status } = await this._recomputeMarginWithDelta(
			oldPos,
			tradeParams.price,
			marginDelta.sub(fee)
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

		const liqPremium = await this._liquidationPremium(newPos.size, tradeParams.price);
		let liqMargin = await this._liquidationMargin(newPos.size, tradeParams.price);
		liqMargin = liqMargin.add(liqPremium);
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

		const maxMarketValue = await this._getSetting('maxMarketValue', [this._marketKeyBytes]);
		const tooLarge = await this._orderSizeTooLarge(maxMarketValue, oldPos.size, newPos.size);
		if (tooLarge) {
			return {
				newPos: oldPos,
				fee: ZERO_BIG_NUM,
				status: PotentialTradeStatus.MAX_MARKET_SIZE_EXCEEDED,
			};
		}

		return { newPos, fee: fee, status: PotentialTradeStatus.OK };
	};

	_liquidationPremium = async (positionSize: BigNumber, currentPrice: BigNumber) => {
		if (positionSize.eq(0)) {
			return 0;
		}

		// note: this is the same as fillPrice() where the skew is 0.
		const notional = multiplyDecimal(positionSize, currentPrice).abs();
		const skewScale = await this._getSetting('skewScale', [this._marketKeyBytes]);
		const liqPremiumMultiplier = await this._getSetting('liquidationPremiumMultiplier', [
			this._marketKeyBytes,
		]);

		const skewedSize = positionSize.abs().div(skewScale);
		const value = multiplyDecimal(skewedSize, notional);
		return multiplyDecimal(value, liqPremiumMultiplier);
	};

	_orderFee = async (tradeParams: TradeParams) => {
		const notionalDiff = multiplyDecimal(tradeParams.sizeDelta, tradeParams.price);
		const marketSkew = await this._onChainData.marketSkew;
		const sameSide = notionalDiff.gte(0) === marketSkew.gte(0);
		const staticRate = sameSide ? tradeParams.takerFee : tradeParams.makerFee;
		// IGNORED DYNAMIC FEE //
		return multiplyDecimal(notionalDiff, staticRate).abs();
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
		const fundingSequenceVal = await this._perpsV2MarketContract.fundingSequence(
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
		const fundingSequenceVal = await this._perpsV2MarketContract.fundingSequence(
			startIndex.toNumber()
		);
		const nextFunding = await this._nextFundingEntry(price);
		return nextFunding.sub(fundingSequenceVal);
	};

	_proportionalElapsed = async () => {
		// TODO: get block at the start
		const blockNum = await this._provider?.getBlockNumber();
		const block = await this._provider?.getBlock(blockNum);
		const fundingLastRecomputed = this._onChainData.fundingLastRecomputed;
		const rate = BigNumber.from(block.timestamp).sub(fundingLastRecomputed);
		return divideDecimal(rate, BigNumber.from(86400));
	};

	_currentFundingVelocity = async () => {
		const maxFundingVelocity = await this._getSetting('maxFundingVelocity', [this._marketKeyBytes]);
		const skew = await this._proportionalSkew();
		return multiplyDecimal(skew, maxFundingVelocity);
	};

	_currentFundingRate = async () => {
		const fundingRateLastRecomputed = this._onChainData.fundingRateLastRecomputed;
		const elapsed = await this._proportionalElapsed();
		const velocity = await this._currentFundingVelocity();
		return BigNumber.from(fundingRateLastRecomputed).add(multiplyDecimal(velocity, elapsed));
	};

	_unrecordedFunding = async (price: BigNumber) => {
		const fundingRateLastRecomputed = BigNumber.from(this._onChainData.fundingRateLastRecomputed);
		const nextFundingRate = await this._currentFundingRate();
		const elapsed = await this._proportionalElapsed();
		const avgFundingRate = divideDecimal(
			fundingRateLastRecomputed.add(nextFundingRate).mul(-1),
			UNIT_BIG_NUM.mul(2)
		);
		return multiplyDecimal(multiplyDecimal(avgFundingRate, elapsed), price);
	};

	_proportionalSkew = async () => {
		const marketSkew = await this._onChainData.marketSkew;
		const skewScale = await this._getSetting('skewScale', [this._marketKeyBytes]);

		const pSkew = divideDecimal(marketSkew, skewScale);

		// Ensures the proportionalSkew is between -1 and 1.
		const proportionalSkew = BN.min(BN.max(UNIT_BN.neg(), new BN(pSkew.toString())), UNIT_BN);
		return BigNumber.from(proportionalSkew.toString());
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
		const liquidationBufferRatio = await this._getSetting('liquidationBufferRatio', [
			this._marketKeyBytes,
		]);
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
		const maxFee = await this._getSetting('maxKeeperFee');
		const cappedProportionalFee = proportionalFee.gt(maxFee) ? maxFee : proportionalFee;
		const minFee = await this._getSetting('minKeeperFee');
		return cappedProportionalFee.gt(minFee) ? proportionalFee : minFee;
	};

	_orderSizeTooLarge = async (maxSize: BigNumber, oldSize: BigNumber, newSize: BigNumber) => {
		if (this._sameSide(oldSize, newSize) && newSize.abs().lte(oldSize.abs())) {
			return false;
		}

		const marketSkew = this._onChainData.marketSkew;
		const marketSize = this._onChainData.marketSize;

		const newSkew = marketSkew.sub(oldSize).add(newSize);
		const newMarketSize = marketSize.sub(oldSize.abs()).add(newSize.abs());

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
		if (!this._perpsV2MarketSettings) throw new Error('Unsupported network');
		if (cached) return cached;
		const res = await this._perpsV2MarketSettings[settingGetter](...params);
		this._cache[settingGetter] = res;
		return res;
	};
}

export default FuturesMarketInternal;
