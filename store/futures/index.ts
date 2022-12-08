import { atom, selector } from 'recoil';

import { DEFAULT_FUTURES_MARGIN_TYPE } from 'constants/defaults';
import {
	FuturesAccountState,
	FuturesAccountType,
	TradeFees,
	FuturesOrderType,
	CrossMarginAccounts,
	PositionHistoryState,
	FuturesAccountTypes,
} from 'queries/futures/types';
import { Price } from 'queries/rates/types';
import { PositionSide } from 'sections/futures/types';
import { CrossMarginTradeInputs } from 'state/futures/types';
import { getFuturesKey } from 'store/utils';
import { zeroBN } from 'utils/formatters/number';

export const activeTabState = atom<number>({
	key: getFuturesKey('activeTab'),
	default: 0,
});

export const positionHistoryState = atom<PositionHistoryState>({
	key: getFuturesKey('positionHistory'),
	default: {
		[FuturesAccountTypes.CROSS_MARGIN]: [],
		[FuturesAccountTypes.ISOLATED_MARGIN]: [],
	},
});

// We use this object to store raw user inputs to feedback to the UI
// before all params have been calculated
export const simulatedTradeState = atom<CrossMarginTradeInputs<string> | null>({
	key: getFuturesKey('simulatedTrade'),
	default: {
		nativeSize: '',
		susdSize: '',
		leverage: '',
	},
});

export const preferredLeverageState = atom<Record<string, string>>({
	key: getFuturesKey('preferredLeverage'),
	default: {},
});

export const crossMarginMarginDeltaState = atom({
	key: getFuturesKey('crossMarginMarginDelta'),
	default: zeroBN,
});

export const leverageSideState = atom<PositionSide>({
	key: getFuturesKey('leverageSide'),
	default: PositionSide.LONG,
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
		return orderType === 'limit' || orderType === 'stop market';
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
	default: zeroBN,
});

export const leverageValueCommittedState = atom({
	key: getFuturesKey('leverageValueCommitted'),
	default: true,
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
