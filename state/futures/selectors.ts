import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { DEFAULT_LEVERAGE, DEFAULT_NP_LEVERAGE_ADJUSTMENT } from 'constants/defaults';
import { DEFAULT_MAX_LEVERAGE } from 'constants/futures';
import { TransactionStatus } from 'sdk/types/common';
import { FuturesPosition } from 'sdk/types/futures';
import { unserializePotentialTrade } from 'sdk/utils/futures';
import { PositionSide } from 'sections/futures/types';
import { accountType, deserializeWeiObject } from 'state/helpers';
import { selectPrices } from 'state/prices/selectors';
import { RootState } from 'state/store';
import { selectWallet } from 'state/wallet/selectors';
import { sameSide } from 'utils/costCalculations';
import { getKnownError } from 'utils/formatters/error';
import { zeroBN } from 'utils/formatters/number';
import {
	MarketKeyByAsset,
	unserializeCmBalanceInfo,
	unserializeCrossMarginSettings,
	unserializeFuturesVolumes,
	unserializeGasEstimate,
	unserializeIsolatedMarginTradeInputs,
	unserializeMarkets,
	unserializeDelayedOrders,
	unserializeCrossMarginTradeInputs,
} from 'utils/futures';

import { futuresPositionKeys } from './types';

export const selectFuturesType = (state: RootState) => state.futures.selectedType;

export const selectFuturesTransaction = (state: RootState) => state.futures.transaction;

export const selectCrossMarginAccount = (state: RootState) => state.futures.crossMargin.account;

export const selectMarketsQueryStatus = (state: RootState) => state.futures.queryStatuses.markets;

export const selectIsolatedLeverageInput = (state: RootState) =>
	state.futures.isolatedMargin.leverageInput;

export const selectCrossMarginMarginDelta = (state: RootState) =>
	wei(state.futures.crossMargin.marginDelta || 0);

export const selectCrossMarginTransferOpen = (state: RootState) =>
	state.app.openModal === 'futures_cross_deposit' ||
	state.app.openModal === 'futures_cross_withdraw';

export const selectMarketKey = createSelector(
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].selectedMarketAsset,
	(marketAsset) => MarketKeyByAsset[marketAsset]
);

export const selectMarketAsset = createSelector(
	(state: RootState) => state.futures,
	selectFuturesType,
	(futures, marginType) => futures[accountType(marginType)].selectedMarketAsset
);

export const selectMarkets = createSelector(
	(state: RootState) => state.futures.markets,
	(markets) => unserializeMarkets(markets)
);

export const selectMarketVolumes = createSelector(
	(state: RootState) => state.futures.dailyMarketVolumes,
	(dailyMarketVolumes) => unserializeFuturesVolumes(dailyMarketVolumes)
);

export const selectMarketKeys = createSelector(
	(state: RootState) => state.futures.markets,
	(markets) => markets.map(({ asset }) => MarketKeyByAsset[asset])
);

export const selectMarketAssets = createSelector(
	(state: RootState) => state.futures.markets,
	(markets) => markets.map(({ asset }) => asset)
);

export const selectMarketInfo = createSelector(
	selectMarkets,
	selectMarketKey,
	(markets, selectedMarket) => {
		return markets.find((market) => market.marketKey === selectedMarket);
	}
);

export const selectFundingRate = createSelector(selectMarketInfo, (marketInfo) => {
	return marketInfo?.currentFundingRate;
});

export const selectIsolatedPriceImpact = createSelector(
	(state: RootState) => state.futures.isolatedMargin.priceImpact,
	(priceImpact) => wei(priceImpact, 0)
);

export const selectOrderType = createSelector(
	(state: RootState) => state.futures,
	(futures) => futures[accountType(futures.selectedType)].orderType
);

export const selectMarketPrice = createSelector(
	selectMarketAsset,
	selectPrices,
	(marketAsset, prices) => {
		const price = prices[marketAsset];
		// Note this assumes the order type is always delayed off chain
		return price?.offChain ?? price?.onChain ?? wei(0);
	}
);

export const selectSkewAdjustedPrice = createSelector(
	selectMarketPrice,
	selectMarketInfo,
	(price, marketInfo) => {
		if (!marketInfo?.marketSkew || !marketInfo?.settings.skewScale) return price;
		return wei(price).mul(wei(marketInfo.marketSkew).div(marketInfo.settings.skewScale).add(1));
	}
);

export const selectMarketPrices = createSelector(
	selectMarketAsset,
	selectPrices,
	(marketAsset, prices) => {
		return prices[marketAsset] ?? {};
	}
);

export const selectFuturesAccount = createSelector(
	selectFuturesType,
	selectWallet,
	selectCrossMarginAccount,
	(selectedType, wallet, crossMarginAccount) => {
		return selectedType === 'cross_margin' ? crossMarginAccount : wallet;
	}
);

export const selectCrossMarginPositions = createSelector(
	(state: RootState) => state.futures,
	(futures) => {
		return futures.crossMargin.account && futures.crossMargin.positions[futures.crossMargin.account]
			? futures.crossMargin.positions[futures.crossMargin.account].map(
					// TODO: Maybe change to explicit serializing functions to avoid casting
					(p) => deserializeWeiObject(p, futuresPositionKeys) as FuturesPosition
			  )
			: [];
	}
);

export const selectIsolatedMarginPositions = createSelector(
	selectWallet,
	(state: RootState) => state.futures,
	(wallet, futures) => {
		if (!wallet) return [];
		return futures.isolatedMargin.positions[wallet]
			? futures.isolatedMargin.positions[wallet].map(
					// TODO: Maybe change to explicit serializing functions to avoid casting
					(p) => deserializeWeiObject(p, futuresPositionKeys) as FuturesPosition
			  )
			: [];
	}
);

export const selectFuturesPositions = createSelector(
	selectCrossMarginPositions,
	selectIsolatedMarginPositions,
	(state: RootState) => state.futures.selectedType,
	(crossMarginPositions, isolatedMarginPositions, selectedType) => {
		return selectedType === 'cross_margin' ? crossMarginPositions : isolatedMarginPositions;
	}
);

export const selectActiveIsolatedPositionsCount = createSelector(
	selectIsolatedMarginPositions,
	(positions) => {
		return positions.filter((p) => !!p.position).length;
	}
);

export const selectActiveCrossPositionsCount = createSelector(
	selectCrossMarginPositions,
	(positions) => {
		return positions.filter((p) => !!p.position).length;
	}
);

export const selectSubmittingFuturesTx = createSelector(
	(state: RootState) => state.futures,
	(futures) => {
		return (
			futures.transaction?.status === TransactionStatus.AwaitingExecution ||
			futures.transaction?.status === TransactionStatus.Executed
		);
	}
);

export const selectIsClosingPosition = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.futures,
	(submitting, futures) => {
		return (
			(futures.transaction?.type === 'close_isolated' ||
				futures.transaction?.type === 'close_cross_margin') &&
			submitting
		);
	}
);

export const selectIsSubmittingCrossTransfer = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.futures,
	(submitting, futures) => {
		return (
			(futures.transaction?.type === 'deposit_cross_margin' ||
				futures.transaction?.type === 'withdraw_cross_margin') &&
			submitting
		);
	}
);

export const selectIsApprovingCrossDeposit = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.futures,
	(submitting, futures) => {
		return futures.transaction?.type === 'approve_cross_margin' && submitting;
	}
);

export const selectIsSubmittingIsolatedTransfer = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.futures,
	(submitting, futures) => {
		return (
			(futures.transaction?.type === 'deposit_isolated' ||
				futures.transaction?.type === 'withdraw_isolated') &&
			submitting
		);
	}
);

export const selectIsolatedTransferError = createSelector(
	(state: RootState) => state.futures,
	(futures) => {
		return (futures.transaction?.type === 'deposit_isolated' ||
			futures.transaction?.type === 'withdraw_isolated') &&
			futures.transaction?.status === TransactionStatus.Failed
			? futures.transaction?.error ?? 'Transaction failed'
			: null;
	}
);

export const selectIsModifyingIsolatedPosition = createSelector(
	selectSubmittingFuturesTx,
	(state: RootState) => state.futures,
	(submitting, futures) => {
		return futures.transaction?.type === 'modify_isolated' && submitting;
	}
);

export const selectIsMarketCapReached = createSelector(
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].leverageSide,
	selectMarketInfo,
	selectMarketPrice,
	(leverageSide, marketInfo, marketAssetRate) => {
		const maxMarketValueUSD = marketInfo?.marketLimit ?? wei(0);
		const marketSize = marketInfo?.marketSize ?? wei(0);
		const marketSkew = marketInfo?.marketSkew ?? wei(0);

		return leverageSide === PositionSide.LONG
			? marketSize.add(marketSkew).div('2').abs().mul(marketAssetRate).gte(maxMarketValueUSD)
			: marketSize.sub(marketSkew).div('2').abs().mul(marketAssetRate).gte(maxMarketValueUSD);
	}
);

export const selectPosition = createSelector(
	selectFuturesPositions,
	selectMarketInfo,
	(positions, market) => {
		const position = positions.find((p) => p.marketKey === market?.marketKey);
		return position
			? (deserializeWeiObject(position, futuresPositionKeys) as FuturesPosition)
			: undefined;
	}
);

export const selectLeverageSide = createSelector(
	(state: RootState) => state.futures,
	(futures) => futures[accountType(futures.selectedType)].leverageSide
);

export const selectMaxLeverage = createSelector(
	selectPosition,
	selectOrderType,
	selectMarketInfo,
	selectLeverageSide,
	selectFuturesType,
	(position, orderType, market, leverageSide, futuresType) => {
		const positionLeverage = position?.position?.leverage ?? wei(0);
		const positionSide = position?.position?.side;
		const marketMaxLeverage = market?.maxLeverage ?? DEFAULT_MAX_LEVERAGE;
		const adjustedMaxLeverage =
			orderType === 'delayed' || orderType === 'delayed offchain'
				? marketMaxLeverage.mul(DEFAULT_NP_LEVERAGE_ADJUSTMENT)
				: marketMaxLeverage;

		if (!positionLeverage || positionLeverage.eq(wei(0))) return adjustedMaxLeverage;
		if (futuresType === 'cross_margin') return adjustedMaxLeverage;
		if (positionSide === leverageSide) {
			return adjustedMaxLeverage?.sub(positionLeverage).gte(0)
				? adjustedMaxLeverage.sub(positionLeverage)
				: wei(0);
		} else {
			return positionLeverage.add(adjustedMaxLeverage).gte(0)
				? positionLeverage.add(adjustedMaxLeverage)
				: wei(0);
		}
	}
);

export const selectAboveMaxLeverage = createSelector(
	selectMaxLeverage,
	selectPosition,
	(maxLeverage, position) => {
		return position?.position?.leverage && maxLeverage.lt(position.position.leverage);
	}
);

export const selectCrossMarginTradeInputs = createSelector(
	selectLeverageSide,
	(state: RootState) => state.futures.crossMargin.tradeInputs,
	(side, tradeInputs) => {
		const inputs = unserializeCrossMarginTradeInputs(tradeInputs);
		const deltas = {
			susdSizeDelta: side === PositionSide.LONG ? inputs.susdSize : inputs.susdSize.neg(),
			nativeSizeDelta: side === PositionSide.LONG ? inputs.nativeSize : inputs.nativeSize.neg(),
		};
		return {
			...inputs,
			...deltas,
			susdSizeString: tradeInputs.susdSize,
			nativeSizeString: tradeInputs.nativeSize,
		};
	}
);

export const selectIsolatedMarginTradeInputs = createSelector(
	selectLeverageSide,
	(state: RootState) => state.futures.isolatedMargin.tradeInputs,
	(side, tradeInputs) => {
		const inputs = unserializeIsolatedMarginTradeInputs(tradeInputs);
		const deltas = {
			susdSizeDelta:
				side === PositionSide.LONG ? inputs.susdSize.abs() : inputs.susdSize.abs().neg(),
			nativeSizeDelta:
				side === PositionSide.LONG ? inputs.nativeSize.abs() : inputs.nativeSize.abs().neg(),
		};
		return {
			...inputs,
			...deltas,
			susdSizeString: tradeInputs.susdSize,
			nativeSizeString: tradeInputs.nativeSize,
		};
	}
);

export const selectCrossMarginSelectedLeverage = createSelector(
	selectMarketKey,
	(state: RootState) => state.futures.crossMargin.selectedLeverageByAsset,
	(key, selectedLeverageByAsset) => wei(selectedLeverageByAsset[key] || DEFAULT_LEVERAGE)
);

export const selectDynamicFeeRate = (state: RootState) => wei(state.futures.dynamicFeeRate);

export const selectIsolatedMarginFee = (state: RootState) =>
	wei(state.futures.isolatedMargin.tradeFee);

export const selectKeeperEthBalance = (state: RootState) =>
	wei(state.futures.crossMargin.keeperEthBalance);

export const selectCrossMarginTradeFees = createSelector(
	(state: RootState) => state.futures.crossMargin.fees,
	(fees) => {
		return {
			staticFee: wei(fees.staticFee),
			crossMarginFee: wei(fees.crossMarginFee),
			keeperEthDeposit: wei(fees.keeperEthDeposit),
			limitStopOrderFee: wei(fees.limitStopOrderFee),
			total: wei(fees.total),
		};
	}
);

export const selectTradeSizeInputs = createSelector(
	selectFuturesType,
	selectCrossMarginTradeInputs,
	selectIsolatedMarginTradeInputs,
	(type, crossMarginInputs, isolatedInputs) => {
		return type === 'cross_margin' ? crossMarginInputs : isolatedInputs;
	}
);

export const selectCrossMarginOrderPrice = (state: RootState) =>
	state.futures.crossMargin.orderPrice.price ?? '';

export const selectIsolatedMarginLeverage = createSelector(
	selectPosition,
	selectIsolatedMarginTradeInputs,
	(position, { susdSize }) => {
		const remainingMargin = position?.remainingMargin;
		if (!remainingMargin || remainingMargin.eq(0) || !susdSize) return wei(0);
		return susdSize.div(remainingMargin);
	}
);

export const selectNextPriceDisclaimer = createSelector(
	selectMaxLeverage,
	selectCrossMarginTradeInputs,
	(maxLeverage, { leverage }) => {
		return wei(leverage || 0).gte(maxLeverage.sub(wei(1))) && wei(leverage || 0).lte(maxLeverage);
	}
);

export const selectPlaceOrderTranslationKey = createSelector(
	selectPosition,
	selectFuturesType,
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].orderType,
	(state: RootState) => state.futures.crossMargin.balanceInfo,
	selectIsMarketCapReached,
	(position, selectedType, orderType, { freeMargin }, isMarketCapReached) => {
		let remainingMargin;
		if (selectedType === 'isolated_margin') {
			remainingMargin = position?.remainingMargin || zeroBN;
		} else {
			const positionMargin = position?.remainingMargin || zeroBN;
			remainingMargin = positionMargin.add(freeMargin);
		}

		if (orderType === 'delayed' || orderType === 'delayed offchain')
			return 'futures.market.trade.button.place-delayed-order';
		if (orderType === 'limit') return 'futures.market.trade.button.place-limit-order';
		if (orderType === 'stop market') return 'futures.market.trade.button.place-stop-order';
		if (!!position?.position) return 'futures.market.trade.button.modify-position';
		return remainingMargin.lt('50')
			? 'futures.market.trade.button.deposit-margin-minimum'
			: isMarketCapReached
			? 'futures.market.trade.button.oi-caps-reached'
			: 'futures.market.trade.button.open-position';
	}
);

export const selectCrossMarginBalanceInfo = (state: RootState) =>
	unserializeCmBalanceInfo(state.futures.crossMargin.balanceInfo);

export const selectFuturesPortfolio = createSelector(
	selectCrossMarginPositions,
	selectIsolatedMarginPositions,
	selectCrossMarginBalanceInfo,
	(crossPositions, isolatedPositions, { freeMargin }) => {
		const isolatedValue =
			isolatedPositions.reduce((sum, { remainingMargin }) => sum.add(remainingMargin), wei(0)) ??
			wei(0);
		const crossValue =
			crossPositions.reduce((sum, { remainingMargin }) => sum.add(remainingMargin), wei(0)) ??
			wei(0);
		const totalValue = isolatedValue.add(crossValue).add(freeMargin);

		return {
			total: totalValue,
			crossMarginFutures: crossValue.add(freeMargin),
			isolatedMarginFutures: isolatedValue,
		};
	}
);

export const selectCrossMarginOpenOrders = createSelector(
	(state: RootState) => state.futures,
	(futures) => {
		return futures.crossMargin.account &&
			futures.crossMargin.openOrders[futures.crossMargin.account]
			? unserializeDelayedOrders(futures.crossMargin.openOrders[futures.crossMargin.account])
			: [];
	}
);

export const selectIsolatedMarginOpenOrders = createSelector(
	selectWallet,
	(state: RootState) => state.futures,
	(wallet, futures) => {
		return wallet && futures.isolatedMargin.openOrders[wallet]
			? unserializeDelayedOrders(futures.isolatedMargin.openOrders[wallet])
			: [];
	}
);

export const selectTradePreview = createSelector(
	selectFuturesType,
	(state: RootState) => state.futures,
	(type, futures) => {
		const preview = futures[accountType(type)].tradePreview;
		return preview ? unserializePotentialTrade(preview) : null;
	}
);

export const selectTradePreviewError = createSelector(
	selectFuturesType,
	(state: RootState) => state.futures,
	(type, futures) => {
		return type === 'cross_margin'
			? futures.queryStatuses.crossMarginTradePreview.error
			: futures.queryStatuses.isolatedTradePreview.error;
	}
);

export const selectModifyPositionError = createSelector(
	(state: RootState) => state.futures,
	(futures) => {
		return futures.transaction?.type === 'modify_isolated' && futures.transaction?.error
			? getKnownError(futures.transaction.error)
			: null;
	}
);

export const selectTradePreviewStatus = createSelector(
	selectFuturesType,
	(state: RootState) => state.futures,
	(type, futures) => {
		return type === 'cross_margin'
			? futures.queryStatuses.crossMarginTradePreview
			: futures.queryStatuses.isolatedTradePreview;
	}
);

export const selectOpenOrders = createSelector(
	selectCrossMarginOpenOrders,
	selectIsolatedMarginOpenOrders,
	selectFuturesType,
	(crossOrders, isolatedOrder, futuresType) => {
		return futuresType === 'cross_margin' ? crossOrders : isolatedOrder;
	}
);

export const selectOpenOrder = createSelector(
	selectCrossMarginOpenOrders,
	selectIsolatedMarginOpenOrders,
	selectFuturesType,
	selectMarketKey,
	(crossOrders, isolatedOrder, futuresType, marketKey) => {
		const orders = futuresType === 'cross_margin' ? crossOrders : isolatedOrder;
		return orders.find((o) => o.marketKey === marketKey);
	}
);

export const selectCrossMarginSettings = createSelector(
	(state: RootState) => state.futures.crossMargin.settings,
	(settings) => unserializeCrossMarginSettings(settings)
);

export const selectIsAdvancedOrder = createSelector(
	(state: RootState) => state.futures.crossMargin.orderType,
	(type) => type === 'limit' || type === 'stop market'
);

export const selectModifyIsolatedGasEstimate = createSelector(
	(state: RootState) => state.futures.transactionEstimations,
	(transactionEstimations) => {
		const estimate = transactionEstimations['modify_isolated'];
		if (estimate) return unserializeGasEstimate(estimate);
		return null;
	}
);

export const selectDelayedOrderFee = createSelector(
	selectMarketInfo,
	selectTradeSizeInputs,
	selectSkewAdjustedPrice,
	selectOrderType,
	(market, { nativeSizeDelta }, price, orderType) => {
		if (
			!market?.marketSkew ||
			!market?.feeRates.takerFeeDelayedOrder ||
			!market?.feeRates.makerFeeDelayedOrder ||
			!market?.feeRates.takerFeeOffchainDelayedOrder ||
			!market?.feeRates.makerFeeOffchainDelayedOrder ||
			!nativeSizeDelta
		) {
			return { commitDeposit: undefined, delayedOrderFee: undefined };
		}

		const notionalDiff = nativeSizeDelta.mul(price);

		const makerFee =
			orderType === 'delayed offchain'
				? market.feeRates.makerFeeOffchainDelayedOrder
				: market.feeRates.makerFeeDelayedOrder;
		const takerFee =
			orderType === 'delayed offchain'
				? market.feeRates.takerFeeOffchainDelayedOrder
				: market.feeRates.takerFeeDelayedOrder;

		const staticRate = sameSide(notionalDiff, market.marketSkew) ? takerFee : makerFee;

		return {
			commitDeposit: notionalDiff.mul(staticRate).abs(),
			delayedOrderFee: notionalDiff.mul(staticRate).abs(),
		};
	}
);
