import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';
import { selectExchangeRatesWei } from 'state/exchange/selectors';
import { hydrateWeiObject } from 'state/helpers';
import { RootState } from 'state/store';

import { FuturesMarket } from 'queries/futures/types';
import { PositionSide } from 'sections/futures/types';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN } from 'utils/formatters/number';
import { MarketKeyByAsset } from 'utils/futures';

export const selectMarketKey = createSelector(
	(state: RootState) => state.futures.marketAsset,
	(marketAsset) => MarketKeyByAsset[marketAsset]
);

export const selectMarketAssetRate = createSelector(
	(state: RootState) => state.futures.marketAsset,
	selectExchangeRatesWei,
	(marketAsset, exchangeRates) => {
		return newGetExchangeRatesForCurrencies(exchangeRates, marketAsset, 'sUSD');
	}
);

const marketInfoKeys = new Set([
	'currentFundingRate',
	'currentRoundId',
	'feeRates.makerFee',
	'feeRates.takerFee',
	'feeRates.makerFeeNextPrice',
	'feeRates.takerFeeNextPrice',
	'openInterest.shortUSD',
	'openInterest.longUSD',
	'marketDebt',
	'marketSkew',
	'marketSize',
	'maxLeverage',
	'price',
	'minInitialMargin',
	'keeperDeposit',
	'marketLimit',
]);

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

export const selectMarketInfo = createSelector(
	(state: RootState) => state.futures.marketAsset,
	(state: RootState) => state.futures.futuresMarkets,
	(marketAsset, futuresMarkets) => {
		const marketInfo = futuresMarkets.find(
			(market: FuturesMarket<string>) => market.asset === marketAsset
		);

		return marketInfo ? hydrateWeiObject(marketInfo, marketInfoKeys) : undefined;
	}
);

export const selectIsMarketCapReached = createSelector(
	(state: RootState) => state.futures.leverageSide,
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

export const selectPositionWei = createSelector(
	(state: RootState) => state.futures.position,
	(position) => {
		return position ? hydrateWeiObject(position, positionKeys) : undefined;
	}
);

export const selectPlaceOrderTranslationKey = createSelector(
	selectPositionWei,
	(state: RootState) => state.futures.orderType,
	(state: RootState) => state.futures.futuresAccountType,
	(state: RootState) => state.futures.crossMarginAccountOverview,
	selectIsMarketCapReached,
	(position, orderType, futuresAccountType, { freeMargin }, isMarketCapReached) => {
		let remainingMargin;
		if (futuresAccountType === 'isolated_margin') {
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
