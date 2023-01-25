import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DEFAULT_LANGUAGE } from 'constants/defaults';
import { ThemeName } from 'styles/theme';
import { Language } from 'translations/constants';

import { PreferncesState } from './types';

const initialState: PreferncesState = {
	currentTheme: 'dark',
	language: DEFAULT_LANGUAGE,
	currency: {
		asset: 'USD',
		sign: '$',
		description: 'US Dollars',
		name: 'sUSD',
	},
};

const preferencesSlice = createSlice({
	name: 'preferences',
	initialState,
	reducers: {
		setTheme: (state, action: PayloadAction<ThemeName>) => {
			state.currentTheme = action.payload;
		},
		setLanguage: (state, action: PayloadAction<Language>) => {
			state.language = action.payload;
		},
	},
});

export const { setTheme, setLanguage } = preferencesSlice.actions;

export default preferencesSlice.reducer;
