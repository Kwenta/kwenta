import { RootState } from 'state/store';

export const selectCurrentTheme = (state: RootState) => state.preferenes.currentTheme;

export const selectPreferredCurrency = (state: RootState) => state.preferenes.currency;

export const selectLanguage = (state: RootState) => state.preferenes.language;
