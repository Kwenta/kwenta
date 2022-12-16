import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { DEFAULT_LEVERAGE, DEFAULT_NP_LEVERAGE_ADJUSTMENT } from 'constants/defaults';
import { DEFAULT_MAX_LEVERAGE } from 'constants/futures';
import { TransactionStatus } from 'sdk/types/common';
import { FuturesPosition } from 'sdk/types/futures';
import { unserializePotentialTrade } from 'sdk/utils/futures';
import { PositionSide } from 'sections/futures/types';
import { selectExchangeRates } from 'state/exchange/selectors';
import { accountType, deserializeWeiObject } from 'state/helpers';
import { RootState } from 'state/store';
import { selectWallet } from 'state/wallet/selectors';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN } from 'utils/formatters/number';
import {
	MarketKeyByAsset,
	unserializeCmBalanceInfo,
	unserializeCrossMarginSettings,
	unserializeCrossMarginTradeInputs,
	unserializeFundingRates,
	unserializeFuturesOrders,
	unserializeFuturesVolumes,
	unserializeGasEstimate,
	unserializeIsolatedMarginTradeInputs,
	unserializeMarkets,
} from 'utils/futures';

import { FundingRate, futuresPositionKeys } from './types';

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

export const selectMarketRate = createSelector(
	selectMarketKey,
	selectExchangeRates,
	(marketKey, exchangeRates) => newGetExchangeRatesForCurrencies(exchangeRates, marketKey, 'sUSD')
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

export const selectAverageFundingRates = createSelector(
	(state: RootState) => state.futures.fundingRates,
	(fundingRates) => unserializeFundingRates(fundingRates)
);

export const selectFundingRate = createSelector(
	selectMarketKey,
	selectAverageFundingRates,
	(marketKey, fundingRates) => {
		return fundingRates.find((fundingRate: FundingRate) => fundingRate.asset === marketKey);
	}
);

export const selectMarketInfo = createSelector(
	selectMarkets,
	selectMarketKey,
	(markets, selectedMarket) => {
		return markets.find((market) => market.marketKey === selectedMarket);
	}
);
export const selectMarketAssetRate = createSelector(
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].selectedMarketAsset,
	selectExchangeRates,
	(marketAsset, exchangeRates) => {
		return newGetExchangeRatesForCurrencies(exchangeRates, marketAsset, 'sUSD');
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
	selectMarketAssetRate,
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

export const selectOrderType = createSelector(
	(state: RootState) => state.futures,
	(futures) => futures[accountType(futures.selectedType)].orderType
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
			orderType === 'next price'
				? marketMaxLeverage.mul(DEFAULT_NP_LEVERAGE_ADJUSTMENT)
				: marketMaxLeverage;

		if (!positionLeverage || positionLeverage.eq(wei(0))) return adjustedMaxLeverage;
		if (futuresType === 'cross_margin') return adjustedMaxLeverage;
		if (positionSide === leverageSide) {
			return adjustedMaxLeverage?.sub(positionLeverage);
		} else {
			return positionLeverage.add(adjustedMaxLeverage);
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

		if (orderType === 'next price') return 'futures.market.trade.button.place-next-price-order';
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
	selectMarketAsset,
	(state: RootState) => state.futures,
	(asset, futures) => {
		const orders =
			futures.crossMargin.account && futures.crossMargin.openOrders[futures.crossMargin.account]
				? unserializeFuturesOrders(futures.crossMargin.openOrders[futures.crossMargin.account])
				: [];
		return orders.filter((o) => o.asset === asset);
	}
);

export const selectIsolatedMarginOpenOrders = createSelector(
	selectMarketAsset,
	selectWallet,
	(state: RootState) => state.futures,
	(asset, wallet, futures) => {
		const orders =
			wallet && futures.isolatedMargin.openOrders[wallet]
				? unserializeFuturesOrders(futures.isolatedMargin.openOrders[wallet])
				: [];
		return orders.filter((o) => o.asset === asset);
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
