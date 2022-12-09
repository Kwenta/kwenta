import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { DEFAULT_NP_LEVERAGE_ADJUSTMENT } from 'constants/defaults';
import { DEFAULT_MAX_LEVERAGE } from 'constants/futures';
import { FuturesPosition } from 'queries/futures/types';
import { PositionSide } from 'sections/futures/types';
import { selectExchangeRates } from 'state/exchange/selectors';
import { accountType, deserializeWeiObject } from 'state/helpers';
import { RootState } from 'state/store';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN } from 'utils/formatters/number';
import { MarketKeyByAsset, unserializeFundingRates, unserializeMarkets } from 'utils/futures';

import { FundingRate } from './types';

export const selectMarketKey = createSelector(
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].marketAsset,
	(marketAsset) => MarketKeyByAsset[marketAsset]
);

export const selectFuturesType = (state: RootState) => state.futures.selectedType;

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

export const selectMarketsQueryStatus = (state: RootState) => state.futures.marketsQueryStatus;

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

const positionKeys = new Set([
	'remainingMargin',
	'accessibleMargin',
	'order.fee',
	'order.leverage',
	'position.notionalValue',
	'position.accruedFunding',
	'position.initialMargin',
	'position.profitLoss',
	'position.lastPrice',
	'position.size',
	'position.liquidationPrice',
	'position.initialLeverage',
	'position.leverage',
	'position.pnl',
	'position.pnlPct',
	'position.marginRatio',
]);

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
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].position,
	(position) => {
		return position ? (deserializeWeiObject(position, positionKeys) as FuturesPosition) : undefined;
	}
);

export const selectMaxLeverage = createSelector(
	(state: RootState) => state.futures,
	selectPosition,
	selectMarketInfo,
	(futures, position, market) => {
		const selectedAccountType = accountType(futures.selectedType);
		const leverageSide = futures[selectedAccountType].leverageSide;
		const orderType = futures[selectedAccountType].orderType;

		const positionLeverage = position?.position?.leverage ?? wei(0);
		const positionSide = position?.position?.side;
		const marketMaxLeverage = market?.maxLeverage ?? DEFAULT_MAX_LEVERAGE;
		const adjustedMaxLeverage =
			orderType === 'next price'
				? marketMaxLeverage.mul(DEFAULT_NP_LEVERAGE_ADJUSTMENT)
				: marketMaxLeverage;

		if (!positionLeverage || positionLeverage.eq(wei(0))) return adjustedMaxLeverage;
		if (selectedAccountType === 'crossMargin') return adjustedMaxLeverage;
		if (positionSide === leverageSide) {
			return adjustedMaxLeverage?.sub(positionLeverage);
		} else {
			return positionLeverage.add(adjustedMaxLeverage);
		}
	}
);

export const selectPlaceOrderTranslationKey = createSelector(
	selectPosition,
	(state: RootState) => state.futures[accountType(state.futures.selectedType)].orderType,
	(state: RootState) => state.futures.selectedType,
	(state: RootState) => state.futures.crossMargin.accountOverview,
	selectIsMarketCapReached,
	(position, orderType, selectedType, { freeMargin }, isMarketCapReached) => {
		let remainingMargin;
		if (selectedType === 'isolated_margin') {
			remainingMargin = position?.remainingMargin || zeroBN;
		} else {
			const positionMargin = position?.remainingMargin || zeroBN;
			remainingMargin = positionMargin.add(freeMargin);
		}

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
