"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketOverrides = exports.AssetDisplayByAsset = exports.MarketKeyByAsset = exports.MarketAssetByKey = exports.appAdjustedLeverage = exports.getDefaultPriceImpact = exports.calculateDesiredFillPrice = exports.formatOrderDisplayType = exports.encodeModidyMarketMarginParams = exports.encodeCloseOffchainOrderParams = exports.encodeSubmitOffchainOrderParams = exports.encodeConditionalOrderParams = exports.mapSmartMarginTransfers = exports.mapMarginTransfers = exports.mapTrades = exports.OrderNameByType = exports.mapConditionalOrderFromContract = exports.normalizePythId = exports.getPythNetworkUrl = exports.POTENTIAL_TRADE_STATUS_TO_MESSAGE = exports.getTradeStatusMessage = exports.formatPotentialTrade = exports.formatDelayedOrder = exports.unserializePotentialTrade = exports.serializePotentialTrade = exports.mapFuturesPositions = exports.mapFuturesPosition = exports.calculateVolumes = exports.getDisplayAsset = exports.getMarketName = exports.marketsForNetwork = exports.calculateFundingRate = exports.getMainEndpoint = exports.getFuturesEndpoint = void 0;
const strings_1 = require("@ethersproject/strings");
const wei_1 = __importStar(require("@synthetixio/wei"));
const utils_js_1 = require("ethers/lib/utils.js");
const futures_1 = require("../constants/futures");
const number_1 = require("../constants/number");
const period_1 = require("../constants/period");
const transactions_1 = require("../constants/transactions");
const futures_2 = require("../types/futures");
const number_2 = require("../utils/number");
const getFuturesEndpoint = (networkId) => {
    return futures_1.FUTURES_ENDPOINTS[networkId] || futures_1.FUTURES_ENDPOINTS[10];
};
exports.getFuturesEndpoint = getFuturesEndpoint;
const getMainEndpoint = (networkId) => {
    return futures_1.MAIN_ENDPOINTS[networkId] || futures_1.MAIN_ENDPOINTS[10];
};
exports.getMainEndpoint = getMainEndpoint;
const calculateFundingRate = (minTimestamp, periodLength, fundingRates, assetPrice, currentFundingRate) => {
    const numUpdates = fundingRates.length;
    if (numUpdates < 2)
        return null;
    // variables to keep track
    let fundingPaid = (0, wei_1.wei)(0);
    let timeTotal = 0;
    let lastTimestamp = minTimestamp;
    // iterate through funding updates
    for (let ind = 0; ind < numUpdates - 1; ind++) {
        const minFunding = fundingRates[ind];
        const maxFunding = fundingRates[ind + 1];
        const fundingStart = new wei_1.default(minFunding.funding, 18, true);
        const fundingEnd = new wei_1.default(maxFunding.funding, 18, true);
        const fundingDiff = fundingStart.sub(fundingEnd);
        const timeDiff = maxFunding.timestamp - Math.max(minFunding.timestamp, lastTimestamp);
        const timeMax = maxFunding.timestamp - minFunding.timestamp;
        if (timeMax > 0) {
            fundingPaid = fundingPaid.add(fundingDiff.mul(timeDiff).div(timeMax));
            timeTotal += timeDiff;
        }
        lastTimestamp = maxFunding.timestamp;
    }
    // add funding from current rate
    const timeLeft = Math.max(periodLength - timeTotal, 0);
    if (timeLeft > 0) {
        fundingPaid = fundingPaid.add((0, wei_1.wei)(currentFundingRate).mul(timeLeft).div(period_1.SECONDS_PER_DAY).mul(assetPrice));
    }
    const fundingRate = fundingPaid.div(assetPrice);
    return fundingRate;
};
exports.calculateFundingRate = calculateFundingRate;
const marketsForNetwork = (networkId, logError) => {
    switch (networkId) {
        case 10:
            return futures_1.MAINNET_MARKETS;
        case 420:
            return futures_1.TESTNET_MARKETS;
        default:
            logError === null || logError === void 0 ? void 0 : logError(new Error('Futures is not supported on this network.'));
            return [];
    }
};
exports.marketsForNetwork = marketsForNetwork;
const getMarketName = (asset) => {
    return `${(0, exports.getDisplayAsset)(asset)}/sUSD`;
};
exports.getMarketName = getMarketName;
const getDisplayAsset = (asset) => {
    if (!asset)
        return null;
    if (asset === 'STETH')
        return 'stETH';
    return asset[0] === 's' ? asset.slice(1) : asset;
};
exports.getDisplayAsset = getDisplayAsset;
const calculateVolumes = (futuresHourlyStats) => {
    const volumes = futuresHourlyStats.reduce((acc, { marketKey, volume, trades }) => {
        var _a, _b, _c, _d;
        const cleanMarketKey = marketKey !== futures_1.AGGREGATE_ASSET_KEY ? (0, strings_1.parseBytes32String)(marketKey) : marketKey;
        return Object.assign(Object.assign({}, acc), { [cleanMarketKey]: {
                volume: volume.div(transactions_1.ETH_UNIT).add((_b = (_a = acc[cleanMarketKey]) === null || _a === void 0 ? void 0 : _a.volume) !== null && _b !== void 0 ? _b : 0),
                trades: trades.add((_d = (_c = acc[cleanMarketKey]) === null || _c === void 0 ? void 0 : _c.trades) !== null && _d !== void 0 ? _d : 0),
            } });
    }, {});
    return volumes;
};
exports.calculateVolumes = calculateVolumes;
const mapFuturesPosition = (positionDetail, canLiquidatePosition, asset, marketKey) => {
    const { remainingMargin, accessibleMargin, position: { fundingIndex, lastPrice, size, margin }, accruedFunding, notionalValue, liquidationPrice, profitLoss, } = positionDetail;
    const initialMargin = (0, wei_1.wei)(margin);
    const pnl = (0, wei_1.wei)(profitLoss).add((0, wei_1.wei)(accruedFunding));
    const pnlPct = initialMargin.gt(0) ? pnl.div((0, wei_1.wei)(initialMargin)) : (0, wei_1.wei)(0);
    return {
        asset,
        marketKey,
        remainingMargin: (0, wei_1.wei)(remainingMargin),
        accessibleMargin: (0, wei_1.wei)(accessibleMargin),
        position: (0, wei_1.wei)(size).eq(number_1.ZERO_WEI)
            ? null
            : {
                canLiquidatePosition: !!canLiquidatePosition,
                side: (0, wei_1.wei)(size).gt(number_1.ZERO_WEI) ? futures_2.PositionSide.LONG : futures_2.PositionSide.SHORT,
                notionalValue: (0, wei_1.wei)(notionalValue).abs(),
                accruedFunding: (0, wei_1.wei)(accruedFunding),
                initialMargin,
                profitLoss: (0, wei_1.wei)(profitLoss),
                fundingIndex: Number(fundingIndex),
                lastPrice: (0, wei_1.wei)(lastPrice),
                size: (0, wei_1.wei)(size).abs(),
                liquidationPrice: (0, wei_1.wei)(liquidationPrice),
                initialLeverage: initialMargin.gt(0)
                    ? (0, wei_1.wei)(size).mul((0, wei_1.wei)(lastPrice)).div(initialMargin).abs()
                    : (0, wei_1.wei)(0),
                pnl,
                pnlPct,
                marginRatio: (0, wei_1.wei)(notionalValue).eq(number_1.ZERO_WEI)
                    ? number_1.ZERO_WEI
                    : (0, wei_1.wei)(remainingMargin).div((0, wei_1.wei)(notionalValue).abs()),
                leverage: (0, wei_1.wei)(remainingMargin).eq(number_1.ZERO_WEI)
                    ? number_1.ZERO_WEI
                    : (0, wei_1.wei)(notionalValue).div((0, wei_1.wei)(remainingMargin)).abs(),
            },
    };
};
exports.mapFuturesPosition = mapFuturesPosition;
const mapFuturesPositions = (futuresPositions) => {
    return futuresPositions.map(({ id, lastTxHash, openTimestamp, closeTimestamp, timestamp, market, asset, marketKey, account, abstractAccount, accountType, isOpen, isLiquidated, trades, totalVolume, size, initialMargin, margin, pnl, feesPaid, netFunding, pnlWithFeesPaid, netTransfers, totalDeposits, entryPrice, avgEntryPrice, exitPrice, }) => {
        const entryPriceWei = (0, wei_1.wei)(entryPrice).div(transactions_1.ETH_UNIT);
        const feesWei = (0, wei_1.wei)(feesPaid || 0).div(transactions_1.ETH_UNIT);
        const sizeWei = (0, wei_1.wei)(size).div(transactions_1.ETH_UNIT);
        const marginWei = (0, wei_1.wei)(margin).div(transactions_1.ETH_UNIT);
        return {
            id: Number(id.split('-')[1].toString()),
            transactionHash: lastTxHash,
            timestamp: timestamp.mul(1000).toNumber(),
            openTimestamp: openTimestamp.mul(1000).toNumber(),
            closeTimestamp: closeTimestamp === null || closeTimestamp === void 0 ? void 0 : closeTimestamp.mul(1000).toNumber(),
            market,
            asset: (0, strings_1.parseBytes32String)(asset),
            marketKey: (0, strings_1.parseBytes32String)(marketKey),
            account,
            abstractAccount,
            accountType,
            isOpen,
            isLiquidated,
            size: sizeWei.abs(),
            feesPaid: feesWei,
            netFunding: (0, wei_1.wei)(netFunding || 0).div(transactions_1.ETH_UNIT),
            netTransfers: (0, wei_1.wei)(netTransfers || 0).div(transactions_1.ETH_UNIT),
            totalDeposits: (0, wei_1.wei)(totalDeposits || 0).div(transactions_1.ETH_UNIT),
            initialMargin: (0, wei_1.wei)(initialMargin).div(transactions_1.ETH_UNIT),
            margin: marginWei,
            entryPrice: entryPriceWei,
            exitPrice: (0, wei_1.wei)(exitPrice || 0).div(transactions_1.ETH_UNIT),
            pnl: (0, wei_1.wei)(pnl).div(transactions_1.ETH_UNIT),
            pnlWithFeesPaid: (0, wei_1.wei)(pnlWithFeesPaid).div(transactions_1.ETH_UNIT),
            totalVolume: (0, wei_1.wei)(totalVolume).div(transactions_1.ETH_UNIT),
            trades: trades.toNumber(),
            avgEntryPrice: (0, wei_1.wei)(avgEntryPrice).div(transactions_1.ETH_UNIT),
            leverage: marginWei.eq((0, wei_1.wei)(0)) ? (0, wei_1.wei)(0) : sizeWei.mul(entryPriceWei).div(marginWei).abs(),
            side: sizeWei.gte((0, wei_1.wei)(0)) ? futures_2.PositionSide.LONG : futures_2.PositionSide.SHORT,
        };
    });
};
exports.mapFuturesPositions = mapFuturesPositions;
// TODO: Move to app
const serializePotentialTrade = (preview) => (Object.assign(Object.assign({}, preview), { size: preview.size.toString(), sizeDelta: preview.sizeDelta.toString(), liqPrice: preview.liqPrice.toString(), margin: preview.margin.toString(), price: preview.price.toString(), fee: preview.fee.toString(), leverage: preview.leverage.toString(), notionalValue: preview.notionalValue.toString(), priceImpact: preview.priceImpact.toString() }));
exports.serializePotentialTrade = serializePotentialTrade;
// TODO: Move to app
const unserializePotentialTrade = (preview) => (Object.assign(Object.assign({}, preview), { size: (0, wei_1.wei)(preview.size), sizeDelta: (0, wei_1.wei)(preview.sizeDelta), liqPrice: (0, wei_1.wei)(preview.liqPrice), margin: (0, wei_1.wei)(preview.margin), price: (0, wei_1.wei)(preview.price), fee: (0, wei_1.wei)(preview.fee), leverage: (0, wei_1.wei)(preview.leverage), notionalValue: (0, wei_1.wei)(preview.notionalValue), priceImpact: (0, wei_1.wei)(preview.priceImpact) }));
exports.unserializePotentialTrade = unserializePotentialTrade;
const formatDelayedOrder = (account, marketAddress, order) => {
    const { isOffchain, sizeDelta, desiredFillPrice, targetRoundId, commitDeposit, keeperDeposit, executableAtTime, intentionTime, } = order;
    return {
        account: account,
        marketAddress: marketAddress,
        size: (0, wei_1.wei)(sizeDelta),
        commitDeposit: (0, wei_1.wei)(commitDeposit),
        keeperDeposit: (0, wei_1.wei)(keeperDeposit),
        submittedAtTimestamp: intentionTime.toNumber() * 1000,
        executableAtTimestamp: executableAtTime.toNumber() * 1000,
        isOffchain: isOffchain,
        desiredFillPrice: (0, wei_1.wei)(desiredFillPrice),
        targetRoundId: (0, wei_1.wei)(targetRoundId),
        orderType: isOffchain ? 'Delayed Market' : 'Delayed',
        side: (0, wei_1.wei)(sizeDelta).gt(0) ? futures_2.PositionSide.LONG : futures_2.PositionSide.SHORT,
    };
};
exports.formatDelayedOrder = formatDelayedOrder;
const formatPotentialTrade = (preview, skewAdjustedPrice, nativeSizeDelta, leverageSide) => {
    const { fee, liqPrice, margin, price, size, status } = preview;
    const notionalValue = (0, wei_1.wei)(size).mul((0, wei_1.wei)(price));
    const leverage = margin.gt(0) ? notionalValue.div((0, wei_1.wei)(margin)) : number_1.ZERO_WEI;
    const priceImpact = (0, wei_1.wei)(price).sub(skewAdjustedPrice).div(skewAdjustedPrice).abs();
    return {
        fee: (0, wei_1.wei)(fee),
        liqPrice: (0, wei_1.wei)(liqPrice),
        margin: (0, wei_1.wei)(margin),
        price: (0, wei_1.wei)(price),
        size: (0, wei_1.wei)(size),
        sizeDelta: nativeSizeDelta,
        side: leverageSide,
        leverage: leverage,
        notionalValue: notionalValue,
        status,
        showStatus: status > 0,
        statusMessage: (0, exports.getTradeStatusMessage)(status),
        priceImpact: priceImpact,
        exceedsPriceProtection: priceImpact.mul(100).gt((0, exports.getDefaultPriceImpact)('market')),
    };
};
exports.formatPotentialTrade = formatPotentialTrade;
const SUCCESS = 'Success';
const UNKNOWN = 'Unknown';
const getTradeStatusMessage = (status) => {
    if (typeof status !== 'number') {
        return UNKNOWN;
    }
    if (status === 0) {
        return SUCCESS;
    }
    else if (futures_2.PotentialTradeStatus[status]) {
        return exports.POTENTIAL_TRADE_STATUS_TO_MESSAGE[futures_2.PotentialTradeStatus[status]];
    }
    else {
        return UNKNOWN;
    }
};
exports.getTradeStatusMessage = getTradeStatusMessage;
// https://github.com/Synthetixio/synthetix/blob/4d2add4f74c68ac4f1106f6e7be4c31d4f1ccc76/contracts/PerpsV2MarketBase.sol#L130-L141
exports.POTENTIAL_TRADE_STATUS_TO_MESSAGE = {
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
};
const getPythNetworkUrl = (networkId, server = 'KWENTA') => {
    const defaultPythServer = server === 'KWENTA' ? futures_1.KWENTA_PYTH_SERVER : futures_1.PUBLIC_PYTH_SERVER;
    return networkId === 420 ? 'https://xc-testnet.pyth.network' : defaultPythServer;
};
exports.getPythNetworkUrl = getPythNetworkUrl;
const normalizePythId = (id) => (id.startsWith('0x') ? id : '0x' + id);
exports.normalizePythId = normalizePythId;
const mapConditionalOrderFromContract = (orderDetails, account) => {
    var _a;
    const marketKey = (0, strings_1.parseBytes32String)(orderDetails.marketKey);
    const asset = exports.MarketAssetByKey[marketKey];
    const sizeDelta = (0, wei_1.wei)(orderDetails.sizeDelta);
    const size = sizeDelta.abs();
    return {
        id: orderDetails.id,
        subgraphId: `CM-${account}-${orderDetails.id}`,
        account: account,
        size: sizeDelta,
        marginDelta: (0, wei_1.wei)(orderDetails.marginDelta),
        orderType: orderDetails.conditionalOrderType,
        orderTypeDisplay: (0, exports.formatOrderDisplayType)(orderDetails.conditionalOrderType, orderDetails.reduceOnly),
        // TODO: Rename when ABI is updated
        desiredFillPrice: (0, wei_1.wei)(orderDetails.desiredFillPrice),
        targetPrice: (0, wei_1.wei)(orderDetails.targetPrice),
        reduceOnly: orderDetails.reduceOnly,
        sizeTxt: size.abs().eq(futures_1.SL_TP_MAX_SIZE)
            ? 'Close'
            : (0, number_2.formatCurrency)(asset, size, {
                currencyKey: (_a = (0, exports.getDisplayAsset)(asset)) !== null && _a !== void 0 ? _a : '',
                minDecimals: size.lt(0.01) ? 4 : 2,
            }),
        targetPriceTxt: (0, number_2.formatDollars)((0, wei_1.wei)(orderDetails.targetPrice)),
        marketKey: marketKey,
        market: (0, exports.getMarketName)(asset),
        asset: asset,
        side: sizeDelta.gt(0) ? futures_2.PositionSide.LONG : futures_2.PositionSide.SHORT,
        isStale: false,
        isExecutable: false,
        isSlTp: size.eq(futures_1.SL_TP_MAX_SIZE),
    };
};
exports.mapConditionalOrderFromContract = mapConditionalOrderFromContract;
exports.OrderNameByType = {
    market: 'Market',
    stop_market: 'Stop',
    limit: 'Limit',
};
const mapOrderType = (orderType) => {
    return orderType === 'NextPrice'
        ? 'Next Price'
        : orderType === 'StopMarket'
            ? 'Stop'
            : orderType === 'DelayedOffchain'
                ? 'Delayed Market'
                : orderType;
};
const mapTrades = (futuresTrades) => {
    return futuresTrades.map(({ id, timestamp, account, margin, size, price, asset, positionId, positionSize, positionClosed, pnl, feesPaid, keeperFeesPaid, orderType, accountType, }) => {
        return {
            asset: (0, strings_1.parseBytes32String)(asset),
            account,
            accountType,
            margin: new wei_1.default(margin, 18, true),
            size: new wei_1.default(size, 18, true),
            price: new wei_1.default(price, 18, true),
            txnHash: id.split('-')[0].toString(),
            timestamp: timestamp.toNumber(),
            positionId,
            positionSize: new wei_1.default(positionSize, 18, true),
            positionClosed,
            side: size.gt(0) ? futures_2.PositionSide.LONG : futures_2.PositionSide.SHORT,
            pnl: new wei_1.default(pnl, 18, true),
            feesPaid: new wei_1.default(feesPaid, 18, true),
            keeperFeesPaid: new wei_1.default(keeperFeesPaid, 18, true),
            orderType: mapOrderType(orderType),
        };
    });
};
exports.mapTrades = mapTrades;
const mapMarginTransfers = (marginTransfers) => {
    return marginTransfers.map(({ timestamp, account, market, size, asset, txHash }) => {
        const sizeWei = new wei_1.default(size);
        const numTimestamp = (0, wei_1.wei)(timestamp).toNumber();
        return {
            timestamp: numTimestamp,
            account,
            market,
            size: sizeWei.div(transactions_1.ETH_UNIT).toNumber(),
            action: sizeWei.gt(0) ? 'deposit' : 'withdraw',
            asset: (0, strings_1.parseBytes32String)(asset),
            txHash,
        };
    });
};
exports.mapMarginTransfers = mapMarginTransfers;
const mapSmartMarginTransfers = (marginTransfers) => {
    return marginTransfers.map(({ timestamp, account, size, txHash }) => {
        const sizeWei = new wei_1.default(size);
        const numTimestamp = (0, wei_1.wei)(timestamp).toNumber();
        return {
            timestamp: numTimestamp,
            account,
            size: sizeWei.div(transactions_1.ETH_UNIT).toNumber(),
            action: sizeWei.gt(0) ? 'deposit' : 'withdraw',
            txHash,
        };
    });
};
exports.mapSmartMarginTransfers = mapSmartMarginTransfers;
const encodeConditionalOrderParams = (marketKey, tradeInputs, type, reduceOnly) => {
    return utils_js_1.defaultAbiCoder.encode(['bytes32', 'int256', 'int256', 'uint256', 'uint256', 'uint256', 'bool'], [
        (0, strings_1.formatBytes32String)(marketKey),
        tradeInputs.marginDelta.toBN(),
        tradeInputs.sizeDelta.toBN(),
        tradeInputs.price.toBN(),
        type,
        tradeInputs.desiredFillPrice.toBN(),
        reduceOnly,
    ]);
};
exports.encodeConditionalOrderParams = encodeConditionalOrderParams;
const encodeSubmitOffchainOrderParams = (marketAddress, sizeDelta, desiredFillPrice) => {
    return utils_js_1.defaultAbiCoder.encode(['address', 'int256', 'uint256'], [marketAddress, sizeDelta.toBN(), desiredFillPrice.toBN()]);
};
exports.encodeSubmitOffchainOrderParams = encodeSubmitOffchainOrderParams;
const encodeCloseOffchainOrderParams = (marketAddress, desiredFillPrice) => {
    return utils_js_1.defaultAbiCoder.encode(['address', 'uint256'], [marketAddress, desiredFillPrice.toBN()]);
};
exports.encodeCloseOffchainOrderParams = encodeCloseOffchainOrderParams;
const encodeModidyMarketMarginParams = (marketAddress, marginDelta) => {
    return utils_js_1.defaultAbiCoder.encode(['address', 'int256'], [marketAddress, marginDelta.toBN()]);
};
exports.encodeModidyMarketMarginParams = encodeModidyMarketMarginParams;
const formatOrderDisplayType = (orderType, reduceOnly) => {
    if (reduceOnly) {
        return orderType === futures_2.ConditionalOrderTypeEnum.LIMIT ? 'Take Profit' : 'Stop Loss';
    }
    return orderType === futures_2.ConditionalOrderTypeEnum.LIMIT ? 'Limit' : 'Stop';
};
exports.formatOrderDisplayType = formatOrderDisplayType;
const calculateDesiredFillPrice = (sizeDelta, marketPrice, priceImpactPercent) => {
    const priceImpactDecimalPct = priceImpactPercent.div(100);
    return sizeDelta.lt(0)
        ? marketPrice.mul((0, wei_1.wei)(1).sub(priceImpactDecimalPct))
        : marketPrice.mul(priceImpactDecimalPct.add(1));
};
exports.calculateDesiredFillPrice = calculateDesiredFillPrice;
const getDefaultPriceImpact = (orderType) => {
    switch (orderType) {
        case 'market':
            return (0, wei_1.wei)(futures_1.DEFAULT_PRICE_IMPACT_DELTA_PERCENT.MARKET);
        case 'limit':
            return (0, wei_1.wei)(futures_1.DEFAULT_PRICE_IMPACT_DELTA_PERCENT.LIMIT);
        case 'stop_market':
            return (0, wei_1.wei)(futures_1.DEFAULT_PRICE_IMPACT_DELTA_PERCENT.STOP);
    }
};
exports.getDefaultPriceImpact = getDefaultPriceImpact;
// Returns the max leverage without buffer
const appAdjustedLeverage = (marketLeverage) => {
    if (marketLeverage.gte(futures_1.APP_MAX_LEVERAGE))
        return futures_1.APP_MAX_LEVERAGE;
    return (0, wei_1.wei)(25);
};
exports.appAdjustedLeverage = appAdjustedLeverage;
exports.MarketAssetByKey = {
    [futures_2.FuturesMarketKey.sBTCPERP]: futures_2.FuturesMarketAsset.sBTC,
    [futures_2.FuturesMarketKey.sETHPERP]: futures_2.FuturesMarketAsset.sETH,
    [futures_2.FuturesMarketKey.sLINKPERP]: futures_2.FuturesMarketAsset.LINK,
    [futures_2.FuturesMarketKey.sSOLPERP]: futures_2.FuturesMarketAsset.SOL,
    [futures_2.FuturesMarketKey.sAVAXPERP]: futures_2.FuturesMarketAsset.AVAX,
    [futures_2.FuturesMarketKey.sAAVEPERP]: futures_2.FuturesMarketAsset.AAVE,
    [futures_2.FuturesMarketKey.sUNIPERP]: futures_2.FuturesMarketAsset.UNI,
    [futures_2.FuturesMarketKey.sMATICPERP]: futures_2.FuturesMarketAsset.MATIC,
    [futures_2.FuturesMarketKey.sXAUPERP]: futures_2.FuturesMarketAsset.XAU,
    [futures_2.FuturesMarketKey.sXAGPERP]: futures_2.FuturesMarketAsset.XAG,
    [futures_2.FuturesMarketKey.sEURPERP]: futures_2.FuturesMarketAsset.EUR,
    [futures_2.FuturesMarketKey.sAPEPERP]: futures_2.FuturesMarketAsset.APE,
    [futures_2.FuturesMarketKey.sDYDXPERP]: futures_2.FuturesMarketAsset.DYDX,
    [futures_2.FuturesMarketKey.sBNBPERP]: futures_2.FuturesMarketAsset.BNB,
    [futures_2.FuturesMarketKey.sDOGEPERP]: futures_2.FuturesMarketAsset.DOGE,
    [futures_2.FuturesMarketKey.sOPPERP]: futures_2.FuturesMarketAsset.OP,
    [futures_2.FuturesMarketKey.sARBPERP]: futures_2.FuturesMarketAsset.ARB,
    [futures_2.FuturesMarketKey.sATOMPERP]: futures_2.FuturesMarketAsset.ATOM,
    [futures_2.FuturesMarketKey.sFTMPERP]: futures_2.FuturesMarketAsset.FTM,
    [futures_2.FuturesMarketKey.sNEARPERP]: futures_2.FuturesMarketAsset.NEAR,
    [futures_2.FuturesMarketKey.sFLOWPERP]: futures_2.FuturesMarketAsset.FLOW,
    [futures_2.FuturesMarketKey.sAXSPERP]: futures_2.FuturesMarketAsset.AXS,
    [futures_2.FuturesMarketKey.sAUDPERP]: futures_2.FuturesMarketAsset.AUD,
    [futures_2.FuturesMarketKey.sGBPPERP]: futures_2.FuturesMarketAsset.GBP,
    [futures_2.FuturesMarketKey.sAPTPERP]: futures_2.FuturesMarketAsset.APT,
    [futures_2.FuturesMarketKey.sLDOPERP]: futures_2.FuturesMarketAsset.LDO,
    [futures_2.FuturesMarketKey.sADAPERP]: futures_2.FuturesMarketAsset.ADA,
    [futures_2.FuturesMarketKey.sGMXPERP]: futures_2.FuturesMarketAsset.GMX,
    [futures_2.FuturesMarketKey.sFILPERP]: futures_2.FuturesMarketAsset.FIL,
    [futures_2.FuturesMarketKey.sLTCPERP]: futures_2.FuturesMarketAsset.LTC,
    [futures_2.FuturesMarketKey.sBCHPERP]: futures_2.FuturesMarketAsset.BCH,
    [futures_2.FuturesMarketKey.sSHIBPERP]: futures_2.FuturesMarketAsset.SHIB,
    [futures_2.FuturesMarketKey.sCRVPERP]: futures_2.FuturesMarketAsset.CRV,
    [futures_2.FuturesMarketKey.sSUIPERP]: futures_2.FuturesMarketAsset.SUI,
    [futures_2.FuturesMarketKey.sPEPEPERP]: futures_2.FuturesMarketAsset.PEPE,
    [futures_2.FuturesMarketKey.sBLURPERP]: futures_2.FuturesMarketAsset.BLUR,
    [futures_2.FuturesMarketKey.sXRPPERP]: futures_2.FuturesMarketAsset.XRP,
    [futures_2.FuturesMarketKey.sDOTPERP]: futures_2.FuturesMarketAsset.DOT,
    [futures_2.FuturesMarketKey.sFLOKIPERP]: futures_2.FuturesMarketAsset.FLOKI,
    [futures_2.FuturesMarketKey.sINJPERP]: futures_2.FuturesMarketAsset.INJ,
    [futures_2.FuturesMarketKey.sTRXPERP]: futures_2.FuturesMarketAsset.TRX,
    [futures_2.FuturesMarketKey.sSTETHPERP]: futures_2.FuturesMarketAsset.STETH,
};
exports.MarketKeyByAsset = {
    [futures_2.FuturesMarketAsset.sBTC]: futures_2.FuturesMarketKey.sBTCPERP,
    [futures_2.FuturesMarketAsset.sETH]: futures_2.FuturesMarketKey.sETHPERP,
    [futures_2.FuturesMarketAsset.LINK]: futures_2.FuturesMarketKey.sLINKPERP,
    [futures_2.FuturesMarketAsset.SOL]: futures_2.FuturesMarketKey.sSOLPERP,
    [futures_2.FuturesMarketAsset.AVAX]: futures_2.FuturesMarketKey.sAVAXPERP,
    [futures_2.FuturesMarketAsset.AAVE]: futures_2.FuturesMarketKey.sAAVEPERP,
    [futures_2.FuturesMarketAsset.UNI]: futures_2.FuturesMarketKey.sUNIPERP,
    [futures_2.FuturesMarketAsset.MATIC]: futures_2.FuturesMarketKey.sMATICPERP,
    [futures_2.FuturesMarketAsset.XAU]: futures_2.FuturesMarketKey.sXAUPERP,
    [futures_2.FuturesMarketAsset.XAG]: futures_2.FuturesMarketKey.sXAGPERP,
    [futures_2.FuturesMarketAsset.EUR]: futures_2.FuturesMarketKey.sEURPERP,
    [futures_2.FuturesMarketAsset.APE]: futures_2.FuturesMarketKey.sAPEPERP,
    [futures_2.FuturesMarketAsset.DYDX]: futures_2.FuturesMarketKey.sDYDXPERP,
    [futures_2.FuturesMarketAsset.BNB]: futures_2.FuturesMarketKey.sBNBPERP,
    [futures_2.FuturesMarketAsset.DOGE]: futures_2.FuturesMarketKey.sDOGEPERP,
    [futures_2.FuturesMarketAsset.OP]: futures_2.FuturesMarketKey.sOPPERP,
    [futures_2.FuturesMarketAsset.ARB]: futures_2.FuturesMarketKey.sARBPERP,
    [futures_2.FuturesMarketAsset.ATOM]: futures_2.FuturesMarketKey.sATOMPERP,
    [futures_2.FuturesMarketAsset.FTM]: futures_2.FuturesMarketKey.sFTMPERP,
    [futures_2.FuturesMarketAsset.NEAR]: futures_2.FuturesMarketKey.sNEARPERP,
    [futures_2.FuturesMarketAsset.FLOW]: futures_2.FuturesMarketKey.sFLOWPERP,
    [futures_2.FuturesMarketAsset.AXS]: futures_2.FuturesMarketKey.sAXSPERP,
    [futures_2.FuturesMarketAsset.AUD]: futures_2.FuturesMarketKey.sAUDPERP,
    [futures_2.FuturesMarketAsset.GBP]: futures_2.FuturesMarketKey.sGBPPERP,
    [futures_2.FuturesMarketAsset.APT]: futures_2.FuturesMarketKey.sAPTPERP,
    [futures_2.FuturesMarketAsset.LDO]: futures_2.FuturesMarketKey.sLDOPERP,
    [futures_2.FuturesMarketAsset.ADA]: futures_2.FuturesMarketKey.sADAPERP,
    [futures_2.FuturesMarketAsset.GMX]: futures_2.FuturesMarketKey.sGMXPERP,
    [futures_2.FuturesMarketAsset.FIL]: futures_2.FuturesMarketKey.sFILPERP,
    [futures_2.FuturesMarketAsset.LTC]: futures_2.FuturesMarketKey.sLTCPERP,
    [futures_2.FuturesMarketAsset.BCH]: futures_2.FuturesMarketKey.sBCHPERP,
    [futures_2.FuturesMarketAsset.SHIB]: futures_2.FuturesMarketKey.sSHIBPERP,
    [futures_2.FuturesMarketAsset.CRV]: futures_2.FuturesMarketKey.sCRVPERP,
    [futures_2.FuturesMarketAsset.SUI]: futures_2.FuturesMarketKey.sSUIPERP,
    [futures_2.FuturesMarketAsset.PEPE]: futures_2.FuturesMarketKey.sPEPEPERP,
    [futures_2.FuturesMarketAsset.BLUR]: futures_2.FuturesMarketKey.sBLURPERP,
    [futures_2.FuturesMarketAsset.XRP]: futures_2.FuturesMarketKey.sXRPPERP,
    [futures_2.FuturesMarketAsset.DOT]: futures_2.FuturesMarketKey.sDOTPERP,
    [futures_2.FuturesMarketAsset.FLOKI]: futures_2.FuturesMarketKey.sFLOKIPERP,
    [futures_2.FuturesMarketAsset.INJ]: futures_2.FuturesMarketKey.sINJPERP,
    [futures_2.FuturesMarketAsset.TRX]: futures_2.FuturesMarketKey.sTRXPERP,
    [futures_2.FuturesMarketAsset.STETH]: futures_2.FuturesMarketKey.sSTETHPERP,
};
exports.AssetDisplayByAsset = {
    [futures_2.FuturesMarketAsset.sBTC]: 'Bitcoin',
    [futures_2.FuturesMarketAsset.sETH]: 'Ether',
    [futures_2.FuturesMarketAsset.LINK]: 'Chainlink',
    [futures_2.FuturesMarketAsset.SOL]: 'Solana',
    [futures_2.FuturesMarketAsset.AVAX]: 'Avalanche',
    [futures_2.FuturesMarketAsset.AAVE]: 'Aave',
    [futures_2.FuturesMarketAsset.UNI]: 'Uniswap',
    [futures_2.FuturesMarketAsset.MATIC]: 'Polygon',
    [futures_2.FuturesMarketAsset.XAU]: 'Gold',
    [futures_2.FuturesMarketAsset.XAG]: 'Silver',
    [futures_2.FuturesMarketAsset.EUR]: 'Euro',
    [futures_2.FuturesMarketAsset.APE]: 'ApeCoin',
    [futures_2.FuturesMarketAsset.DYDX]: 'DYDX',
    [futures_2.FuturesMarketAsset.BNB]: 'Binance Coin',
    [futures_2.FuturesMarketAsset.DOGE]: 'Dogecoin',
    [futures_2.FuturesMarketAsset.OP]: 'Optimism',
    [futures_2.FuturesMarketAsset.ARB]: 'Arbitrum',
    [futures_2.FuturesMarketAsset.ATOM]: 'Cosmos',
    [futures_2.FuturesMarketAsset.FTM]: 'Fantom',
    [futures_2.FuturesMarketAsset.NEAR]: 'Near',
    [futures_2.FuturesMarketAsset.FLOW]: 'Flow',
    [futures_2.FuturesMarketAsset.AXS]: 'Axie Infinity',
    [futures_2.FuturesMarketAsset.AUD]: 'Australian Dollar',
    [futures_2.FuturesMarketAsset.GBP]: 'Pound Sterling',
    [futures_2.FuturesMarketAsset.APT]: 'Aptos',
    [futures_2.FuturesMarketAsset.LDO]: 'Lido',
    [futures_2.FuturesMarketAsset.ADA]: 'Cardano',
    [futures_2.FuturesMarketAsset.GMX]: 'GMX',
    [futures_2.FuturesMarketAsset.FIL]: 'Filecoin',
    [futures_2.FuturesMarketAsset.LTC]: 'Litecoin',
    [futures_2.FuturesMarketAsset.BCH]: 'Bitcoin Cash',
    [futures_2.FuturesMarketAsset.SHIB]: 'Shiba Inu',
    [futures_2.FuturesMarketAsset.CRV]: 'Curve DAO',
    [futures_2.FuturesMarketAsset.SUI]: 'Sui',
    [futures_2.FuturesMarketAsset.PEPE]: 'Pepe',
    [futures_2.FuturesMarketAsset.BLUR]: 'Blur',
    [futures_2.FuturesMarketAsset.XRP]: 'XRP',
    [futures_2.FuturesMarketAsset.DOT]: 'Polkadot',
    [futures_2.FuturesMarketAsset.FLOKI]: 'Floki',
    [futures_2.FuturesMarketAsset.INJ]: 'Injective',
    [futures_2.FuturesMarketAsset.TRX]: 'Tron',
    [futures_2.FuturesMarketAsset.STETH]: 'Lido Staked ETH',
};
exports.marketOverrides = {};
