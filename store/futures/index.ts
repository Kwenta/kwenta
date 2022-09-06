import Wei, { wei } from '@synthetixio/wei';
import { atom, selector } from 'recoil';

import { DEFAULT_FUTURES_MARGIN_TYPE, DEFAULT_NP_LEVERAGE_ADJUSTMENT } from 'constants/defaults';
import {
	FuturesAccountState,
	FuturesAccountType,
	FuturesMarket,
	FuturesPosition,
	FuturesPotentialTradeDetailsQuery,
	SynthBalances,
	TradeFees,
	TradeSize,
} from 'queries/futures/types';
import { FundingRateResponse } from 'queries/futures/useGetAverageFundingRateForMarkets';
import { Price, Rates } from 'queries/rates/types';
import { PositionSide } from 'sections/futures/types';
import { localStorageEffect } from 'store/effects';
import { getFuturesKey, getSynthsKey } from 'store/utils';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN } from 'utils/formatters/number';
import { FuturesMarketAsset, MarketAssetByKey, MarketKeyByAsset } from 'utils/futures';

const DEFAULT_MAX_LEVERAGE = wei(10);

export const currentMarketState = atom({
	key: getFuturesKey('currentMarket'),
	default: FuturesMarketAsset.sETH,
	effects: [localStorageEffect('currentMarketAsset')],
});

export const marketKeyState = selector({
	key: getFuturesKey('marketKey'),
	get: ({ get }) => MarketKeyByAsset[get(currentMarketState)],
});

export const marketKeysState = selector({
	key: getFuturesKey('marketKeys'),
	get: ({ get }) => {
		const futuresMarkets = get(futuresMarketsState);
		return futuresMarkets.map(({ asset }) => {
			return MarketKeyByAsset[asset];
		});
	},
});

export const marketAssetsState = selector({
	key: getFuturesKey('marketAssets'),
	get: ({ get }) => {
		const marketKeys = get(marketKeysState);
		return marketKeys.map(
			(key): FuturesMarketAsset => {
				return MarketAssetByKey[key];
			}
		);
	},
});

export const balancesState = atom<SynthBalances | null>({
	key: getSynthsKey('balances'),
	default: null,
});

export const activeTabState = atom<number>({
	key: getFuturesKey('activeTab'),
	default: 0,
});

export const positionState = atom<FuturesPosition | null>({
	key: getFuturesKey('position'),
	default: null,
});

export const positionsState = atom<FuturesPosition[] | null>({
	key: getFuturesKey('positions'),
	default: null,
});

export const futuresMarketsState = atom<FuturesMarket[]>({
	key: getFuturesKey('markets'),
	default: [],
});

export const tradeSizeState = atom({
	key: getFuturesKey('tradeSize'),
	default: {
		nativeSize: '',
		susdSize: '',
		leverage: '',
		nativeSizeDelta: zeroBN,
		susdSizeDelta: zeroBN,
	},
});

export const pendingTradeSizeState = atom<TradeSize | null>({
	key: getFuturesKey('pendingTradeSize'),
	default: {
		nativeSize: '',
		susdSize: '',
		leverage: '',
		nativeSizeDelta: zeroBN,
		susdSizeDelta: zeroBN,
	},
});

export const crossMarginLeverageInputState = atom({
	key: getFuturesKey('crossMarginLeverageInput'),
	default: '',
});

export const preferredLeverageState = atom<Record<string, string>>({
	key: getFuturesKey('preferredLeverage'),
	default: {},
});

export const crossMarginMarginDeltaState = atom({
	key: getFuturesKey('crossMarginMarginDelta'),
	default: zeroBN,
});

export const crossMarginSettingsState = atom({
	key: getFuturesKey('crossMarginSettings'),
	default: {
		tradeFee: zeroBN,
		limitOrderFee: zeroBN,
		stopLossFee: zeroBN,
	},
});

export const leverageSideState = atom<PositionSide>({
	key: getFuturesKey('leverageSide'),
	default: PositionSide.LONG,
});

export const ratesState = atom<Rates>({
	key: getFuturesKey('rates'),
	default: {},
});

export const fundingRateState = selector({
	key: getFuturesKey('fundingRate'),
	get: ({ get }) => {
		const currentMarket = get(currentMarketState);
		const fundingRates = get(fundingRatesState);

		return fundingRates.find(
			(fundingRate: FundingRateResponse) => fundingRate.asset === MarketKeyByAsset[currentMarket]
		);
	},
});

export const fundingRatesState = atom<FundingRateResponse[]>({
	key: getFuturesKey('fundingRates'),
	default: [],
});

export const pastRatesState = atom<Price[] | []>({
	key: getFuturesKey('pastRates'),
	default: [],
});

export const orderTypeState = atom({
	key: getFuturesKey('orderType'),
	default: 0,
});

export const tradeFeesState = atom<TradeFees>({
	key: getFuturesKey('tradeFees'),
	default: {
		staticFee: zeroBN,
		dynamicFeeRate: zeroBN,
		crossMarginFee: zeroBN,
		total: zeroBN,
	},
});

export const dynamicFeeRateState = atom({
	key: getFuturesKey('dynamicFeeRate'),
	default: null,
});

export const leverageValueCommittedState = atom({
	key: getFuturesKey('leverageValueCommitted'),
	default: true,
});

export const openOrdersState = atom<any[]>({
	key: getFuturesKey('openOrders'),
	default: [],
});

export const sizeDeltaState = selector({
	key: getFuturesKey('sizeDelta'),
	get: ({ get }) => {
		const { nativeSize } = get(tradeSizeState);
		const leverageSide = get(leverageSideState);

		return nativeSize ? wei(leverageSide === PositionSide.LONG ? nativeSize : -nativeSize) : zeroBN;
	},
});

export const marketInfoState = selector({
	key: getFuturesKey('marketInfo'),
	get: ({ get }) => {
		const markets = get(futuresMarketsState);
		const currentMarket = get(currentMarketState);

		return markets.find((market: FuturesMarket) => market.asset === currentMarket);
	},
});

export const maxLeverageState = selector({
	key: getFuturesKey('maxLeverage'),
	get: ({ get }) => {
		const position = get(positionState);
		const orderType = get(orderTypeState);
		const market = get(marketInfoState);
		const leverageSide = get(leverageSideState);

		const positionLeverage = position?.position?.leverage ?? wei(0);
		const positionSide = position?.position?.side;
		const marketMaxLeverage = market?.maxLeverage ?? DEFAULT_MAX_LEVERAGE;
		const adjustedMaxLeverage =
			orderType === 1 ? marketMaxLeverage.mul(DEFAULT_NP_LEVERAGE_ADJUSTMENT) : marketMaxLeverage;

		if (!positionLeverage || positionLeverage.eq(wei(0))) return adjustedMaxLeverage;
		if (positionSide === leverageSide) {
			return adjustedMaxLeverage?.sub(positionLeverage);
		} else {
			return positionLeverage.add(adjustedMaxLeverage);
		}
	},
});

export const nextPriceDisclaimerState = selector({
	key: getFuturesKey('nextPriceDisclaimer'),
	get: ({ get }) => {
		const { leverage } = get(tradeSizeState);
		const maxLeverage = get(maxLeverageState);

		return wei(leverage || 0).gte(maxLeverage.sub(wei(1))) && wei(leverage || 0).lte(maxLeverage);
	},
});

export const potentialTradeDetailsState = atom<FuturesPotentialTradeDetailsQuery>({
	key: getFuturesKey('potentialTradeDetails'),
	default: {
		data: null,
		status: 'idle',
		error: null,
	},
});

export const futuresAccountState = atom<FuturesAccountState>({
	key: getFuturesKey('futuresAccountState'),
	default: {
		crossMarginAddress: null,
		walletAddress: null,
		selectedFuturesAddress: null,
		crossMarginAvailable: false,
		ready: false,
	},
});

export const futuresAccountTypeState = atom<FuturesAccountType>({
	key: getFuturesKey('futuresAccountType'),
	default: DEFAULT_FUTURES_MARGIN_TYPE,
});

export const crossMarginAvailableMarginState = atom<Wei>({
	key: getFuturesKey('crossMarginAvailableMargin'),
	default: zeroBN,
});

export const crossMarginTotalMarginState = selector({
	key: getFuturesKey('crossMarginTotalMargin'),
	get: ({ get }) => {
		const position = get(positionState);
		const freeMargin = get(crossMarginAvailableMarginState);
		return position?.remainingMargin.add(freeMargin) ?? zeroBN;
	},
});

export const confirmationModalOpenState = atom({
	key: getFuturesKey('confirmationModalOpen'),
	default: false,
});

export const marketAssetRateState = selector({
	key: getFuturesKey('marketAssetRate'),
	get: ({ get }) => {
		const exchangeRates = get(ratesState);
		const marketAsset = get(currentMarketState);

		return newGetExchangeRatesForCurrencies(exchangeRates, marketAsset, 'sUSD');
	},
});

export const isMarketCapReachedState = selector({
	key: getFuturesKey('isMarketCapReached'),
	get: ({ get }) => {
		const leverageSide = get(leverageSideState);
		const market = get(marketInfoState);
		const marketAssetRate = get(marketAssetRateState);

		const maxMarketValueUSD = market?.marketLimit ?? wei(0);
		const marketSize = market?.marketSize ?? wei(0);
		const marketSkew = market?.marketSkew ?? wei(0);

		return leverageSide === PositionSide.LONG
			? marketSize.add(marketSkew).div('2').abs().mul(marketAssetRate).gte(maxMarketValueUSD)
			: marketSize.sub(marketSkew).div('2').abs().mul(marketAssetRate).gte(maxMarketValueUSD);
	},
});

export const placeOrderTranslationKeyState = selector({
	key: getFuturesKey('placeOrderTranslationKey'),
	get: ({ get }) => {
		const position = get(positionState);
		const isMarketCapReached = get(isMarketCapReachedState);
		const orderType = get(orderTypeState);
		const selectedAccountType = get(futuresAccountTypeState);
		const freeMargin = get(crossMarginAvailableMarginState);

		let remainingMargin;
		if (selectedAccountType === 'isolated_margin') {
			remainingMargin = position?.remainingMargin || zeroBN;
		} else {
			const positionMargin = position?.remainingMargin || zeroBN;
			remainingMargin = positionMargin.add(freeMargin);
		}

		if (orderType === 1) return 'futures.market.trade.button.place-next-price-order';
		if (!!position?.position) return 'futures.market.trade.button.modify-position';
		return remainingMargin.lt('50')
			? 'futures.market.trade.button.deposit-margin-minimum'
			: isMarketCapReached
			? 'futures.market.trade.button.oi-caps-reached'
			: 'futures.market.trade.button.open-position';
	},
});
