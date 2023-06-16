"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wei_1 = require("@synthetixio/wei");
const bn_js_1 = __importDefault(require("bn.js"));
const ethcall_1 = require("ethcall");
const bignumber_1 = require("@ethersproject/bignumber");
const strings_1 = require("@ethersproject/strings");
const futures_1 = require("../constants/futures");
const number_1 = require("../constants/number");
const PerpsV2Market_json_1 = __importDefault(require("./abis/PerpsV2Market.json"));
const types_1 = require("./types");
const futures_2 = require("../types/futures");
const number_2 = require("../utils/number");
class FuturesMarketInternal {
    constructor(sdk, provider, marketKey, marketAddress) {
        this.getTradePreview = (account, sizeDelta, marginDelta, tradePrice) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const multiCallContract = new ethcall_1.Contract(this._perpsV2MarketContract.address, PerpsV2Market_json_1.default);
            const preFetchedData = yield this._sdk.context.multicallProvider.all([
                multiCallContract.assetPrice(),
                multiCallContract.marketSkew(),
                multiCallContract.marketSize(),
                multiCallContract.accruedFunding(account),
                multiCallContract.fundingSequenceLength(),
                multiCallContract.fundingLastRecomputed(),
                multiCallContract.fundingRateLastRecomputed(),
                multiCallContract.positions(account),
            ]);
            const blockNum = yield ((_a = this._provider) === null || _a === void 0 ? void 0 : _a.getBlockNumber());
            this._block = yield fetchBlockWithRetry(blockNum, this._provider);
            this._onChainData = {
                //@ts-ignore
                assetPrice: preFetchedData[0].price,
                marketSkew: preFetchedData[1],
                marketSize: preFetchedData[2],
                //@ts-ignore
                accruedFunding: preFetchedData[3].funding,
                fundingSequenceLength: preFetchedData[4],
                fundingLastRecomputed: preFetchedData[5],
                fundingRateLastRecomputed: preFetchedData[6],
            };
            const position = preFetchedData[7];
            const takerFee = yield this._getSetting('takerFeeOffchainDelayedOrder');
            const makerFee = yield this._getSetting('makerFeeOffchainDelayedOrder');
            const fillPrice = yield this._fillPrice(sizeDelta, tradePrice);
            const tradeParams = {
                sizeDelta: sizeDelta,
                fillPrice: fillPrice,
                desiredFillPrice: tradePrice,
                makerFee: makerFee,
                takerFee: takerFee,
                trackingCode: futures_1.KWENTA_TRACKING_CODE,
            };
            const { newPos, fee, status } = yield this._postTradeDetails(position, tradeParams, marginDelta);
            const liqPrice = yield this._approxLiquidationPrice(newPos, newPos.lastPrice);
            return Object.assign(Object.assign({}, newPos), { liqPrice: liqPrice, fee, price: newPos.lastPrice, status: status });
        });
        this._postTradeDetails = (oldPos, tradeParams, marginDelta) => __awaiter(this, void 0, void 0, function* () {
            if (!this._sdk.context.contracts.Exchanger)
                throw new Error('Unsupported network');
            // Reverts if the user is trying to submit a size-zero order.
            if (tradeParams.sizeDelta.eq(0) && marginDelta.eq(0)) {
                return { newPos: oldPos, fee: number_1.ZERO_BIG_NUM, status: futures_2.PotentialTradeStatus.NIL_ORDER };
            }
            // The order is not submitted if the user's existing position needs to be liquidated.
            if (yield this._canLiquidate(oldPos, this._onChainData.assetPrice)) {
                return { newPos: oldPos, fee: number_1.ZERO_BIG_NUM, status: futures_2.PotentialTradeStatus.CAN_LIQUIDATE };
            }
            const fee = yield this._orderFee(tradeParams);
            const { margin, status } = yield this._recomputeMarginWithDelta(oldPos, tradeParams.fillPrice, marginDelta.sub(fee));
            if (status !== futures_2.PotentialTradeStatus.OK) {
                return { newPos: oldPos, fee: number_1.ZERO_BIG_NUM, status };
            }
            const lastFundingIndex = yield this._latestFundingIndex();
            const newPos = {
                id: oldPos.id,
                lastFundingIndex: lastFundingIndex,
                margin: margin,
                lastPrice: tradeParams.fillPrice,
                size: oldPos.size.add(tradeParams.sizeDelta),
            };
            const minInitialMargin = yield this._getSetting('minInitialMargin');
            const positionDecreasing = oldPos.size.gte(number_1.ZERO_BIG_NUM) === newPos.size.gte(number_1.ZERO_BIG_NUM) &&
                newPos.size.abs().lt(oldPos.size.abs());
            if (!positionDecreasing) {
                if (newPos.margin.add(fee).lt(minInitialMargin)) {
                    return {
                        newPos: oldPos,
                        fee: number_1.ZERO_BIG_NUM,
                        status: futures_2.PotentialTradeStatus.INSUFFICIENT_MARGIN,
                    };
                }
            }
            const liqPremium = yield this._liquidationPremium(newPos.size, this._onChainData.assetPrice);
            let liqMargin = yield this._liquidationMargin(newPos.size, this._onChainData.assetPrice);
            liqMargin = liqMargin.add(liqPremium);
            if (margin.lte(liqMargin)) {
                return { newPos, fee: number_1.ZERO_BIG_NUM, status: futures_2.PotentialTradeStatus.CAN_LIQUIDATE };
            }
            const maxLeverage = yield this._getSetting('maxLeverage');
            const maxLeverageForSize = yield this._maxLeverageForSize(newPos.size);
            const leverage = (0, number_2.divideDecimal)((0, number_2.multiplyDecimal)(newPos.size, tradeParams.fillPrice), margin.add(fee));
            if (maxLeverage.add(number_1.UNIT_BIG_NUM.div(100)).lt(leverage.abs()) ||
                leverage.abs().gt(maxLeverageForSize)) {
                return {
                    newPos: oldPos,
                    fee: number_1.ZERO_BIG_NUM,
                    status: futures_2.PotentialTradeStatus.MAX_LEVERAGE_EXCEEDED,
                };
            }
            const maxMarketValue = yield this._getSetting('maxMarketValue');
            const tooLarge = yield this._orderSizeTooLarge(maxMarketValue, oldPos.size, newPos.size);
            if (tooLarge) {
                return {
                    newPos: oldPos,
                    fee: number_1.ZERO_BIG_NUM,
                    status: futures_2.PotentialTradeStatus.MAX_MARKET_SIZE_EXCEEDED,
                };
            }
            return { newPos, fee: fee, status: futures_2.PotentialTradeStatus.OK };
        });
        this._liquidationPremium = (positionSize, currentPrice) => __awaiter(this, void 0, void 0, function* () {
            if (positionSize.eq(0)) {
                return 0;
            }
            // note: this is the same as fillPrice() where the skew is 0.
            const notional = (0, number_2.multiplyDecimal)(positionSize, currentPrice).abs();
            const skewScale = yield this._getSetting('skewScale');
            const liqPremiumMultiplier = yield this._getSetting('liquidationPremiumMultiplier');
            const skewedSize = (0, number_2.divideDecimal)(positionSize.abs(), skewScale);
            const value = (0, number_2.multiplyDecimal)(skewedSize, notional);
            return (0, number_2.multiplyDecimal)(value, liqPremiumMultiplier);
        });
        this._orderFee = (tradeParams) => __awaiter(this, void 0, void 0, function* () {
            const notionalDiff = (0, number_2.multiplyDecimal)(tradeParams.sizeDelta, tradeParams.fillPrice);
            const marketSkew = yield this._onChainData.marketSkew;
            if (this._sameSide(marketSkew.add(tradeParams.sizeDelta), marketSkew)) {
                const staticRate = this._sameSide(notionalDiff, marketSkew)
                    ? tradeParams.takerFee
                    : tradeParams.makerFee;
                return (0, number_2.multiplyDecimal)(notionalDiff, staticRate).abs();
            }
            // IGNORED DYNAMIC FEE //
            const takerSize = (0, number_2.divideDecimal)(marketSkew.add(tradeParams.sizeDelta), tradeParams.sizeDelta).abs();
            const makerSize = number_1.UNIT_BIG_NUM.sub(takerSize);
            const takerFee = (0, number_2.multiplyDecimal)((0, number_2.multiplyDecimal)(notionalDiff, takerSize), tradeParams.takerFee).abs();
            const makerFee = (0, number_2.multiplyDecimal)((0, number_2.multiplyDecimal)(notionalDiff, makerSize), tradeParams.makerFee).abs();
            return takerFee.add(makerFee);
        });
        this._recomputeMarginWithDelta = (position, price, marginDelta) => __awaiter(this, void 0, void 0, function* () {
            const marginPlusProfitFunding = yield this._marginPlusProfitFunding(position, price);
            const newMargin = marginPlusProfitFunding.add(marginDelta);
            if (newMargin.lt(number_1.ZERO_WEI.toBN())) {
                return { margin: number_1.ZERO_WEI.toBN(), status: futures_2.PotentialTradeStatus.INSUFFICIENT_MARGIN };
            }
            const lMargin = yield this._liquidationMargin(position.size, price);
            if (!position.size.isZero() && newMargin.lt(lMargin)) {
                return { margin: newMargin, status: futures_2.PotentialTradeStatus.CAN_LIQUIDATE };
            }
            return { margin: newMargin, status: futures_2.PotentialTradeStatus.OK };
        });
        this._marginPlusProfitFunding = (position, price) => __awaiter(this, void 0, void 0, function* () {
            const funding = this._onChainData.accruedFunding;
            return position.margin.add(this._profitLoss(position, price)).add(funding);
        });
        this._profitLoss = (position, price) => {
            const priceShift = price.sub(position.lastPrice);
            return (0, number_2.multiplyDecimal)(position.size, priceShift);
        };
        this._nextFundingEntry = (price) => __awaiter(this, void 0, void 0, function* () {
            const latestFundingIndex = yield this._latestFundingIndex();
            const fundingSequenceVal = yield this._perpsV2MarketContract.fundingSequence(latestFundingIndex);
            const unrecordedFunding = yield this._unrecordedFunding(price);
            return fundingSequenceVal.add(unrecordedFunding);
        });
        this._latestFundingIndex = () => __awaiter(this, void 0, void 0, function* () {
            const fundingSequenceLength = this._onChainData.fundingSequenceLength;
            return fundingSequenceLength.sub(1); // at least one element is pushed in constructor
        });
        this._netFundingPerUnit = (startIndex, price) => __awaiter(this, void 0, void 0, function* () {
            const fundingSequenceVal = yield this._perpsV2MarketContract.fundingSequence(startIndex.toNumber());
            const nextFunding = yield this._nextFundingEntry(price);
            return nextFunding.sub(fundingSequenceVal);
        });
        this._proportionalElapsed = () => __awaiter(this, void 0, void 0, function* () {
            // TODO: get block at the start
            if (!this._block)
                throw new Error('Missing block data');
            const fundingLastRecomputed = this._onChainData.fundingLastRecomputed;
            const rate = bignumber_1.BigNumber.from(this._block.timestamp).sub(fundingLastRecomputed);
            return (0, number_2.divideDecimal)(rate, bignumber_1.BigNumber.from(86400));
        });
        this._currentFundingVelocity = () => __awaiter(this, void 0, void 0, function* () {
            const maxFundingVelocity = yield this._getSetting('maxFundingVelocity');
            const skew = yield this._proportionalSkew();
            return (0, number_2.multiplyDecimal)(skew, maxFundingVelocity);
        });
        this._currentFundingRate = () => __awaiter(this, void 0, void 0, function* () {
            const fundingRateLastRecomputed = this._onChainData.fundingRateLastRecomputed;
            const elapsed = yield this._proportionalElapsed();
            const velocity = yield this._currentFundingVelocity();
            return bignumber_1.BigNumber.from(fundingRateLastRecomputed).add((0, number_2.multiplyDecimal)(velocity, elapsed));
        });
        this._unrecordedFunding = (price) => __awaiter(this, void 0, void 0, function* () {
            const fundingRateLastRecomputed = bignumber_1.BigNumber.from(this._onChainData.fundingRateLastRecomputed);
            const nextFundingRate = yield this._currentFundingRate();
            const elapsed = yield this._proportionalElapsed();
            const avgFundingRate = (0, number_2.divideDecimal)(fundingRateLastRecomputed.add(nextFundingRate).mul(-1), number_1.UNIT_BIG_NUM.mul(2));
            return (0, number_2.multiplyDecimal)((0, number_2.multiplyDecimal)(avgFundingRate, elapsed), price);
        });
        this._proportionalSkew = () => __awaiter(this, void 0, void 0, function* () {
            const marketSkew = yield this._onChainData.marketSkew;
            const skewScale = yield this._getSetting('skewScale');
            const pSkew = (0, number_2.divideDecimal)(marketSkew, skewScale);
            // Ensures the proportionalSkew is between -1 and 1.
            const proportionalSkew = bn_js_1.default.min(bn_js_1.default.max(number_1.UNIT_BN.neg(), new bn_js_1.default(pSkew.toString())), number_1.UNIT_BN);
            return bignumber_1.BigNumber.from(proportionalSkew.toString());
        });
        this._approxLiquidationPrice = (position, currentPrice) => __awaiter(this, void 0, void 0, function* () {
            if (position.size.isZero()) {
                return bignumber_1.BigNumber.from('0');
            }
            const fundingPerUnit = yield this._netFundingPerUnit(position.lastFundingIndex, currentPrice);
            const liqMargin = yield this._liquidationMargin(position.size, currentPrice);
            const liqPremium = yield this._liquidationPremium(position.size, currentPrice);
            const result = position.lastPrice
                .add((0, number_2.divideDecimal)(liqMargin.sub(position.margin.sub(liqPremium)), position.size))
                .sub(fundingPerUnit);
            return result.lt(0) ? bignumber_1.BigNumber.from(0) : result;
        });
        this._exactLiquidationMargin = (positionSize, price) => __awaiter(this, void 0, void 0, function* () {
            const keeperFee = yield this._liquidationFee(positionSize, price);
            const stakerFee = yield this._stakerFee(positionSize, price);
            return keeperFee.add(stakerFee);
        });
        this._liquidationMargin = (positionSize, price) => __awaiter(this, void 0, void 0, function* () {
            const liquidationBufferRatio = yield this._getSetting('liquidationBufferRatio');
            const liqKeeperFee = yield this._getSetting('keeperLiquidationFee');
            const liquidationBuffer = (0, number_2.multiplyDecimal)((0, number_2.multiplyDecimal)(positionSize.abs(), price), liquidationBufferRatio);
            const fee = yield this._liquidationFee(positionSize, price);
            return liquidationBuffer.add(fee).add(liqKeeperFee);
        });
        this._liquidationFee = (positionSize, price) => __awaiter(this, void 0, void 0, function* () {
            const liquidationFeeRatio = yield this._getSetting('liquidationFeeRatio');
            const minFee = yield this._getSetting('minKeeperFee');
            const maxFee = yield this._getSetting('maxKeeperFee');
            const proportionalFee = (0, number_2.multiplyDecimal)((0, number_2.multiplyDecimal)(positionSize.abs(), price), liquidationFeeRatio);
            const cappedProportionalFee = proportionalFee.gt(maxFee) ? maxFee : proportionalFee;
            return cappedProportionalFee.gt(minFee) ? proportionalFee : minFee;
        });
        this._stakerFee = (positionSize, price) => __awaiter(this, void 0, void 0, function* () {
            const liquidationBufferRatio = yield this._getSetting('liquidationBufferRatio');
            const stakerFee = (0, number_2.multiplyDecimal)((0, number_2.multiplyDecimal)(positionSize.abs(), price), liquidationBufferRatio);
            return stakerFee;
        });
        this._fillPrice = (size, price) => __awaiter(this, void 0, void 0, function* () {
            const marketSkew = yield this._onChainData.marketSkew;
            const skewScale = yield this._getSetting('skewScale');
            const pdBefore = (0, number_2.divideDecimal)(marketSkew, skewScale);
            const pdAfter = (0, number_2.divideDecimal)(marketSkew.add(size), skewScale);
            const priceBefore = price.add((0, number_2.multiplyDecimal)(price, pdBefore));
            const priceAfter = price.add((0, number_2.multiplyDecimal)(price, pdAfter));
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
            return (0, number_2.divideDecimal)(priceBefore.add(priceAfter), number_1.UNIT_BIG_NUM.mul(2));
        });
        this._canLiquidate = (position, price) => __awaiter(this, void 0, void 0, function* () {
            // No liquidating empty positions.
            if (position.size.eq(0)) {
                return false;
            }
            const remainingLiquidatableMargin = yield this._remainingLiquidatableMargin(position, price);
            const liqMargin = yield this._liquidationMargin(position.size, price);
            return remainingLiquidatableMargin.lt(liqMargin);
        });
        this._remainingLiquidatableMargin = (position, price) => __awaiter(this, void 0, void 0, function* () {
            const liqPremium = yield this._liquidationPremium(position.size, price);
            const marginPlusProfitFunding = yield this._marginPlusProfitFunding(position, price);
            const remaining = marginPlusProfitFunding.sub(liqPremium);
            return remaining.gt(0) ? remaining : number_1.ZERO_BIG_NUM;
        });
        this._orderSizeTooLarge = (maxSize, oldSize, newSize) => __awaiter(this, void 0, void 0, function* () {
            if ((this._sameSide(oldSize, newSize) && newSize.abs().lte(oldSize.abs())) || newSize.eq(0)) {
                return false;
            }
            const marketSkew = this._onChainData.marketSkew;
            const marketSize = this._onChainData.marketSize;
            const newSkew = marketSkew.sub(oldSize).add(newSize);
            const newMarketSize = marketSize.sub(oldSize.abs()).add(newSize.abs());
            let newSideSize;
            if (newSize.gt(number_1.ZERO_BIG_NUM)) {
                newSideSize = newMarketSize.add(newSkew);
            }
            else {
                newSideSize = newMarketSize.sub(newSkew);
            }
            if (maxSize.lt(newSideSize.div(2).abs())) {
                return true;
            }
            return false;
        });
        this._maxLeverageForSize = (size) => __awaiter(this, void 0, void 0, function* () {
            const skewScale = yield this._getSetting('skewScale');
            const liqPremMultiplier = yield this._getSetting('liquidationPremiumMultiplier');
            const liqBufferRatio = yield this._getSetting('liquidationBufferRatio');
            const liqBuffer = (0, wei_1.wei)(0.5);
            const liqBufferRatioWei = (0, wei_1.wei)(liqBufferRatio);
            const liqPremMultiplierWei = (0, wei_1.wei)(liqPremMultiplier);
            const skewScaleWei = (0, wei_1.wei)(skewScale);
            return liqBuffer
                .div((0, wei_1.wei)(size).abs().div(skewScaleWei).mul(liqPremMultiplierWei).add(liqBufferRatioWei))
                .toBN();
        });
        this._batchGetSettings = () => __awaiter(this, void 0, void 0, function* () {
            if (!this._perpsV2MarketSettings)
                throw new Error('Market settings not initialized');
            const settings = (yield this._sdk.context.multicallProvider.all([
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
            ]));
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
            };
            return this._marketSettings;
        });
        this._getSetting = (settingType) => __awaiter(this, void 0, void 0, function* () {
            if (this._marketSettings)
                return this._marketSettings[settingType];
            const settings = yield this._batchGetSettings();
            return settings[settingType];
        });
        this._sdk = sdk;
        this._provider = provider;
        this._perpsV2MarketContract = types_1.PerpsV2Market__factory.connect(marketAddress, provider);
        this._perpsV2MarketSettings = sdk.context.multicallContracts.PerpsV2MarketSettings;
        this._marketKeyBytes = (0, strings_1.formatBytes32String)(marketKey);
        this._cache = {};
        this._block = null;
        this._onChainData = {
            assetPrice: bignumber_1.BigNumber.from(0),
            marketSkew: bignumber_1.BigNumber.from(0),
            marketSize: bignumber_1.BigNumber.from(0),
            fundingSequenceLength: bignumber_1.BigNumber.from(0),
            fundingLastRecomputed: 0,
            fundingRateLastRecomputed: 0,
            accruedFunding: bignumber_1.BigNumber.from(0),
        };
    }
    _sameSide(a, b) {
        return a.gte(number_1.ZERO_BIG_NUM) === b.gte(number_1.ZERO_BIG_NUM);
    }
}
const fetchBlockWithRetry = (blockNum, provider, count = 0) => __awaiter(void 0, void 0, void 0, function* () {
    // Sometimes the block number is returned before the block
    // is ready to fetch and so getBlock returns null
    const block = yield (provider === null || provider === void 0 ? void 0 : provider.getBlock(blockNum));
    if (block)
        return block;
    if (count > 5)
        return null;
    yield new Promise((resolve) => setTimeout(resolve, 200));
    return fetchBlockWithRetry(blockNum, provider, count + 1);
});
exports.default = FuturesMarketInternal;
