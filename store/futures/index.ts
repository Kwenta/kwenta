import { Balances } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { atom, selector } from 'recoil';

import { Synths } from 'constants/currency';
import { DEFAULT_NP_LEVERAGE_ADJUSTMENT } from 'constants/defaults';
import {
	FuturesAccountState,
	FuturesMarket,
	FuturesPosition,
	FuturesPotentialTradeDetails,
} from 'queries/futures/types';
import { Rates } from 'queries/rates/types';
import { PositionSide } from 'sections/futures/types';
import { getFuturesKey, getSynthsKey } from 'store/utils';
import { newGetExchangeRatesForCurrencies } from 'utils/currencies';
import { zeroBN } from 'utils/formatters/number';
import { FuturesMarketAsset, MarketKeyByAsset } from 'utils/futures';

const DEFAULT_MAX_LEVERAGE = wei(10);

export const currentMarketState = atom({
	key: getFuturesKey('currentMarket'),
	default: FuturesMarketAsset.sETH,
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

export const balancesState = atom<Balances | null>({
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
	default: '',
});

export const tradeSizeSUSDState = atom({
	key: getFuturesKey('tradeSizeSUSD'),
	default: '',
});

export const leverageState = atom({
	key: getFuturesKey('leverage'),
	default: '',
});

export const leverageSideState = atom<PositionSide>({
	key: getFuturesKey('leverageSide'),
	default: PositionSide.LONG,
});

export const ratesState = atom<Rates>({
	key: getFuturesKey('rates'),
	default: {},
});

export const orderTypeState = atom({
	key: getFuturesKey('orderType'),
	default: 0,
});

export const feeCostState = atom<Wei | null>({
	key: getFuturesKey('feeCost'),
	default: null,
});

export const dynamicFeeState = atom({
	key: getFuturesKey('dynamicFee'),
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
		const tradeSize = get(tradeSizeState);
		const leverageSide = get(leverageSideState);

		return tradeSize ? wei(leverageSide === PositionSide.LONG ? tradeSize : -tradeSize) : zeroBN;
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
		const leverage = get(leverageState);
		const maxLeverage = get(maxLeverageState);

		return wei(leverage || 0).gte(maxLeverage.sub(wei(1))) && wei(leverage || 0).lte(maxLeverage);
	},
});

export const potentialTradeDetailsState = atom<FuturesPotentialTradeDetails | null>({
	key: getFuturesKey('potentialTradeDetails'),
	default: null,
});

export const futuresAccountState = atom<FuturesAccountState>({
	key: getFuturesKey('futuresAccountState'),
	default: {
		selectedAccountType: 'pending',
		crossMarginAddress: null,
		walletAddress: null,
		selectedFuturesAddress: null,
		crossMarginAvailable: false,
	},
});

export const crossMarginAvailableMarginState = atom<Wei>({
	key: getFuturesKey('crossMarginAvailableMarginState'),
	default: zeroBN,
});

export const confirmationModalOpenState = atom({
	key: getFuturesKey('confirmationModalOpen'),
	default: false,
});

export const marketAssetRateState = selector({
	key: getFuturesKey('marketAssetRate'),
	get: ({ get }) => {
		const exchangeRates = get(ratesState);
		const marketKey = get(marketKeyState);

		return newGetExchangeRatesForCurrencies(exchangeRates, marketKey, Synths.sUSD);
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
		const { selectedAccountType } = get(futuresAccountState);
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
