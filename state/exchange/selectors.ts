import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';
import { RootState, sdk } from 'state/store';

import { zeroBN } from 'utils/formatters/number';

export const selectQuoteAmountWei = createSelector(
	(state: RootState) => state.exchange.quoteAmount,
	(quoteAmount) => (quoteAmount === '' ? zeroBN : wei(quoteAmount))
);

export const selectBaseAmountWei = createSelector(
	(state: RootState) => state.exchange.baseAmount,
	(baseAmount) => (baseAmount === '' ? zeroBN : wei(baseAmount))
);

export const selectBothSidesSelected = createSelector(
	(state: RootState) => ({
		baseCurrencyKey: state.exchange.baseCurrencyKey,
		quoteCurrencyKey: state.exchange.quoteCurrencyKey,
	}),
	({ baseCurrencyKey, quoteCurrencyKey }) => !!baseCurrencyKey && !!quoteCurrencyKey
);

export const selectInsufficientBalance = createSelector(
	selectQuoteAmountWei,
	(state: RootState) => wei(state.exchange.quoteBalance ?? 0),
	(quoteAmountWei, quoteBalance) => quoteAmountWei.gt(quoteBalance)
);

export const selectQuoteCurrencyName = createSelector(
	(state: RootState) => state.exchange.quoteCurrencyKey,
	(quoteCurrencyKey) =>
		quoteCurrencyKey ? sdk.exchange.getCurrencyName(quoteCurrencyKey) : undefined
);

export const selectBaseCurrencyName = createSelector(
	(state: RootState) => state.exchange.baseCurrencyKey,
	(baseCurrencyKey) => (baseCurrencyKey ? sdk.exchange.getCurrencyName(baseCurrencyKey) : undefined)
);

export const selectNoSynths = createSelector(
	(state: RootState) => state.balances.totalUSDBalance,
	(totalUSDBalance) => totalUSDBalance.lte(zeroBN)
);

export const selectShowFee = createSelector(
	(state: RootState) => state.exchange.txProvider,
	(txProvider) => txProvider === 'synthetix'
);

export const selectInverseRate = createSelector(
	(state: RootState) => state.exchange.rate,
	(rate) => (rate?.gt(0) ? wei(1).div(rate) : wei(0))
);
