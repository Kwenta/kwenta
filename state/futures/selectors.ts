import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { DEFAULT_NP_LEVERAGE_ADJUSTMENT } from 'constants/defaults';
import { DEFAULT_MAX_LEVERAGE } from 'constants/futures';
import { TransactionStatus } from 'sdk/types/common';
import { FuturesPosition } from 'sdk/types/futures';
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
	unserializeCrossMarginTradeInputs,
	unserializeFundingRates,
	unserializeFuturesVolumes,
	unserializeMarkets,
} from 'utils/futures';

import { FundingRate, futuresPositionKeys } from './types';

export const selectMarketKey = createSelector(
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].marketAsset,
	(marketAsset) => MarketKeyByAsset[marketAsset]
);

export const selectFuturesType = (state: RootState) => state.futures.selectedType;

export const selectFuturesTransaction = (state: RootState) => state.futures.transaction;

export const selectCrossMarginAccount = (state: RootState) => state.futures.crossMargin.account;

export const selectMarketsQueryStatus = (state: RootState) => state.futures.queryStatuses.markets;

export const selectMarketAsset = createSelector(
	(state: RootState) => state.futures,
	selectFuturesType,
	(futures, marginType) => futures[accountType(marginType)].marketAsset
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
	selectMarketAsset,
	(markets, selectedMarket) => {
		return markets.find((market) => market.asset === selectedMarket);
	}
);
export const selectMarketAssetRate = createSelector(
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].marketAsset,
	selectExchangeRates,
	(marketAsset, exchangeRates) => {
		return newGetExchangeRatesForCurrencies(exchangeRates, marketAsset, 'sUSD');
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

export const selectIsSubmittingTransfer = createSelector(
	(state: RootState) => state.futures,
	(futures) => {
		return (
			(futures.transaction?.type === 'deposit' || futures.transaction?.type === 'withdraw') &&
			(futures.transaction?.status === TransactionStatus.AwaitingExecution ||
				futures.transaction?.status === TransactionStatus.Executed)
		);
	}
);

export const selectIsApprovingDeposit = createSelector(
	(state: RootState) => state.futures,
	(futures) => {
		return (
			futures.transaction?.type === 'approve' &&
			(futures.transaction?.status === TransactionStatus.AwaitingExecution ||
				futures.transaction?.status === TransactionStatus.Executed)
		);
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
		const position = positions.find((p) => p.asset === market?.asset);
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
	(state: RootState) => state.futures.crossMargin.tradeInputs,
	(tradeInputs) => unserializeCrossMarginTradeInputs(tradeInputs)
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
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].orderType,
	(state: RootState) => state.futures.selectedType,
	(state: RootState) => state.futures.crossMargin.balanceInfo,
	selectIsMarketCapReached,
	(position, orderType, selectedType, { freeMargin }, isMarketCapReached) => {
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
