import { createSlice } from '@reduxjs/toolkit';

import { SwapRatio } from 'hooks/useExchange';

type ExchangeState = {
	baseCurrencyKey?: string;
	quoteCurrencyKey?: string;
	baseAmount: string;
	quoteAmount: string;
	ratio?: SwapRatio;
};

const initialState: ExchangeState = {
	baseCurrencyKey: undefined,
	quoteCurrencyKey: undefined,
	baseAmount: '',
	quoteAmount: '',
	ratio: undefined,
};

const exchangeSlice = createSlice({
	name: 'exchange',
	initialState,
	reducers: {},
});

export default exchangeSlice.reducer;
