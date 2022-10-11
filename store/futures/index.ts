import { wei } from '@synthetixio/wei';
import { atom, selector } from 'recoil';

import { DEFAULT_FUTURES_MARGIN_TYPE, DEFAULT_NP_LEVERAGE_ADJUSTMENT } from 'constants/defaults';
import { DEFAULT_MAX_LEVERAGE } from 'constants/futures';
import {
	FuturesAccountState,
	FuturesAccountType,
	FuturesMarket,
	FuturesPosition,
	FuturesPotentialTradeDetailsQuery,
	SynthBalances,
	TradeFees,
	FuturesTradeInputs,
	FuturesOrderType,
	FuturesVolumes,
	CrossMarginAccounts,
	FuturesPositionsState,
	PositionHistoryState,
	FuturesAccountTypes,
	FuturesOrder,
} from 'queries/futures/types';
import { FundingRateResponse } from 'queries/futures/useGetAverageFundingRateForMarkets';
import { Price, Rates } from 'queries/rates/types';
import { PositionSide } from 'sections/futures/types';
import { localStorageEffect } from 'store/effects';
import { getFuturesKey, getSynthsKey } from 'store/utils';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN } from 'utils/formatters/number';
import { FuturesMarketAsset, MarketAssetByKey, MarketKeyByAsset } from 'utils/futures';

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

export const balancesState = atom<SynthBalances>({
	key: getSynthsKey('balances'),
	default: {
		balancesMap: {},
		balances: [],
		totalUSDBalance: zeroBN,
		susdWalletBalance: zeroBN,
	},
});

export const portfolioState = selector({
	key: getFuturesKey('portfolio'),
	get: ({ get }) => {
		const positions = get(positionsState);
		const { freeMargin } = get(crossMarginAccountOverviewState);

		const isolatedValue =
			positions.isolated_margin.reduce(
				(sum, { remainingMargin }) => sum.add(remainingMargin),
				wei(0)
			) ?? wei(0);
		const crossValue =
			positions.cross_margin.reduce(
				(sum, { remainingMargin }) => sum.add(remainingMargin),
				wei(0)
			) ?? wei(0);
		const totalValue = isolatedValue.add(crossValue).add(freeMargin);

		return {
			total: totalValue,
			crossMarginFutures: crossValue.add(freeMargin),
			isolatedMarginFutures: isolatedValue,
		};
	},
});

export const activeTabState = atom<number>({
	key: getFuturesKey('activeTab'),
	default: 0,
});

export const positionState = atom<FuturesPosition | null>({
	key: getFuturesKey('position'),
	default: null,
});

export const positionHistoryState = atom<PositionHistoryState>({
	key: getFuturesKey('positionHistory'),
	default: {
		[FuturesAccountTypes.CROSS_MARGIN]: [],
		[FuturesAccountTypes.ISOLATED_MARGIN]: [],
	},
});

export const positionsState = atom<FuturesPositionsState>({
	key: getFuturesKey('positions'),
	default: {
		cross_margin: [],
		isolated_margin: [],
	},
});

export const futuresMarketsState = atom<FuturesMarket[]>({
	key: getFuturesKey('markets'),
	default: [],
});

export const futuresVolumesState = atom<FuturesVolumes>({
	key: getFuturesKey('volumes'),
	default: {},
});

export const futuresTradeInputsState = atom<FuturesTradeInputs>({
	key: getFuturesKey('pendingTrade'),
	default: {
		nativeSize: '',
		susdSize: '',
		leverage: '',
		nativeSizeDelta: zeroBN,
		susdSizeDelta: zeroBN,
	},
});

// We use this object to store raw user inputs to feedback to the UI
// before all params have been calculated
export const simulatedTradeState = atom<FuturesTradeInputs | null>({
	key: getFuturesKey('simulatedTrade'),
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
		stopOrderFee: zeroBN,
	},
});

export const crossMarginAccountOverviewState = atom({
	key: getFuturesKey('crossMarginAccountOverview'),
	default: {
		freeMargin: zeroBN,
		keeperEthBal: zeroBN,
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

export const orderTypeState = atom<FuturesOrderType>({
	key: getFuturesKey('orderType'),
	default: 'market',
});

export const isAdvancedOrderState = selector({
	key: getFuturesKey('isAdvancedOrder'),
	get: ({ get }) => {
		const orderType = get(orderTypeState);
		return orderType === 'limit' || orderType === 'stop';
	},
});

export const orderFeeCapState = atom({
	key: getFuturesKey('orderFeeCapState'),
	default: zeroBN,
});

export const futuresOrderPriceState = atom({
	key: getFuturesKey('futuresOrderPrice'),
	default: '',
});

export const tradeFeesState = atom<TradeFees>({
	key: getFuturesKey('tradeFees'),
	default: {
		staticFee: zeroBN,
		dynamicFeeRate: zeroBN,
		crossMarginFee: zeroBN,
		keeperEthDeposit: zeroBN,
		limitStopOrderFee: zeroBN,
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

export const openOrdersState = atom<FuturesOrder[]>({
	key: getFuturesKey('openOrders'),
	default: [],
});

export const sizeDeltaState = selector({
	key: getFuturesKey('sizeDelta'),
	get: ({ get }) => {
		const { nativeSize } = get(futuresTradeInputsState);
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
			orderType === 'next-price'
				? marketMaxLeverage.mul(DEFAULT_NP_LEVERAGE_ADJUSTMENT)
				: marketMaxLeverage;

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
		const { leverage } = get(futuresTradeInputsState);
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
		crossMarginAvailable: false,
		status: 'initial-fetch',
	},
});

export const selectedFuturesAddressState = selector<string | null>({
	key: getFuturesKey('selectedFuturesAddress'),
	get: ({ get }) => {
		const futuresType = get(futuresAccountTypeState);
		const account = get(futuresAccountState);
		return futuresType === 'cross_margin' ? account.crossMarginAddress : account.walletAddress;
	},
});

export const crossMarginAccountsState = atom<CrossMarginAccounts>({
	key: getFuturesKey('crossMarginAccounts'),
	default: {},
});

export const futuresAccountTypeState = atom<FuturesAccountType>({
	key: getFuturesKey('futuresAccountType'),
	default: DEFAULT_FUTURES_MARGIN_TYPE,
});

export const showCrossMarginOnboardState = atom({
	key: getFuturesKey('showCrossMarginOnboard'),
	default: false,
});

export const crossMarginTotalMarginState = selector({
	key: getFuturesKey('crossMarginTotalMargin'),
	get: ({ get }) => {
		const position = get(positionState);
		const { freeMargin } = get(crossMarginAccountOverviewState);
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
		const { freeMargin } = get(crossMarginAccountOverviewState);

		let remainingMargin;
		if (selectedAccountType === 'isolated_margin') {
			remainingMargin = position?.remainingMargin || zeroBN;
		} else {
			const positionMargin = position?.remainingMargin || zeroBN;
			remainingMargin = positionMargin.add(freeMargin);
		}

		if (orderType === 'next-price') return 'futures.market.trade.button.place-next-price-order';
		if (orderType === 'limit') return 'futures.market.trade.button.place-limit-order';
		if (orderType === 'stop') return 'futures.market.trade.button.place-stop-order';
		if (!!position?.position) return 'futures.market.trade.button.modify-position';
		return remainingMargin.lt('50')
			? 'futures.market.trade.button.deposit-margin-minimum'
			: isMarketCapReached
			? 'futures.market.trade.button.oi-caps-reached'
			: 'futures.market.trade.button.open-position';
	},
});
