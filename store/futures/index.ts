import { atom, selector } from 'recoil';
import Wei, { wei } from '@synthetixio/wei';

import { getFuturesKey } from 'store/utils';
import { FuturesPosition } from 'queries/futures/types';
import { PositionSide } from 'sections/futures/types';
import { Rates } from 'queries/rates/types';
import { zeroBN } from 'utils/formatters/number';
import { Synths, CurrencyKey } from 'constants/currency';

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

export const leverageValueCommitedState = atom({
	key: getFuturesKey('leverageValueCommited'),
	default: true,
});

export const sizeDeltaState = selector({
	key: getFuturesKey('sizeDelta'),
	get: ({ get }) => {
		const tradeSize = get(tradeSizeState);
		const leverageSide = get(leverageSideState);

		return tradeSize ? wei(leverageSide === PositionSide.LONG ? tradeSize : -tradeSize) : zeroBN;
	},
});
