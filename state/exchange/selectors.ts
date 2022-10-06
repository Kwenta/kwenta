import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';

import { zeroBN } from 'utils/formatters/number';

import { ExchangeState } from './types';

export const quoteAmountWei = createSelector(
	(state: ExchangeState) => state.quoteAmount,
	(quoteAmount) => (quoteAmount === '' ? zeroBN : wei(quoteAmount))
);

export const baseAmountWei = createSelector(
	(state: ExchangeState) => state.baseAmount,
	(baseAmount) => (baseAmount === '' ? zeroBN : wei(baseAmount))
);

export const selectedBothSides = createSelector(
	(state: ExchangeState) => ({
		baseCurrencyKey: state.baseCurrencyKey,
		quoteCurrencyKey: state.quoteCurrencyKey,
	}),
	({ baseCurrencyKey, quoteCurrencyKey }) => !!baseCurrencyKey && !!quoteCurrencyKey
);
