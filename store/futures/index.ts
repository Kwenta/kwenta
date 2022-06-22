import { atom, selector } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import { getFuturesKey } from 'store/utils';
import {
	FuturesMarket,
	FuturesPosition,
	FuturesPotentialTradeDetails,
} from 'queries/futures/types';
import { PositionSide } from 'sections/futures/types';
import { Rates } from 'queries/rates/types';
import { zeroBN } from 'utils/formatters/number';
import { Synths, CurrencyKey } from 'constants/currency';

const DEFAULT_MAX_LEVERAGE = wei(10);

export const currentMarketState = atom<CurrencyKey>({
	key: getFuturesKey('currentMarket'),
	default: Synths.sETH,
});

export const positionState = atom<FuturesPosition | null>({
	key: getFuturesKey('position'),
	default: null,
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

export const ratesState = atom<Rates | null>({
	key: getFuturesKey('rates'),
	default: null,
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

export const marketInfoState = atom<FuturesMarket | undefined>({
	key: getFuturesKey('marketInfo'),
	default: undefined,
});

export const maxLeverageState = selector({
	key: getFuturesKey('maxLeverage'),
	get: ({ get }) => {
		const position = get(positionState);
		const market = get(marketInfoState);
		const leverageSide = get(leverageSideState);

		const positionLeverage = position?.position?.leverage ?? wei(0);
		const positionSide = position?.position?.side;
		const marketMaxLeverage = market?.maxLeverage ?? DEFAULT_MAX_LEVERAGE;

		if (!positionLeverage || positionLeverage.eq(wei(0))) return marketMaxLeverage;
		if (positionSide === leverageSide) {
			return marketMaxLeverage?.sub(positionLeverage);
		} else {
			return positionLeverage.add(marketMaxLeverage);
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
