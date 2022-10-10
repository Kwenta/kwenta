import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';
import { selectTotalUSDBalanceWei } from 'state/balances/selectors';
import { RootState, sdk } from 'state/store';

import { zeroBN } from 'utils/formatters/number';

export const toWei = (value?: string | null, p?: number) => {
	return !!value ? wei(value, p) : zeroBN;
};

export const selectQuoteAmountWei = createSelector(
	(state: RootState) => state.exchange.quoteAmount,
	(quoteAmount) => toWei(quoteAmount)
);

export const selectBaseAmountWei = createSelector(
	(state: RootState) => state.exchange.baseAmount,
	(baseAmount) => toWei(baseAmount)
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

export const selectNoSynths = createSelector(selectTotalUSDBalanceWei, (totalUSDBalance) =>
	totalUSDBalance.lte(zeroBN)
);

export const selectShowFee = createSelector(
	(state: RootState) => state.exchange.txProvider,
	(txProvider) => txProvider === 'synthetix'
);

export const selectRateWei = createSelector(
	(state: RootState) => state.exchange.rate,
	(rate) => (!!rate ? wei(rate) : zeroBN)
);

export const selectInverseRate = createSelector(selectRateWei, (rate) =>
	rate.gt(0) ? wei(1).div(rate) : wei(0)
);

export const selectQuoteBalanceWei = createSelector(
	(state: RootState) => state.exchange.quoteBalance,
	(quoteBalance) => toWei(quoteBalance)
);

export const selectBaseBalanceWei = createSelector(
	(state: RootState) => state.exchange.baseBalance,
	(baseBalance) => toWei(baseBalance)
);

export const selectQuotePriceRateWei = createSelector(
	(state: RootState) => state.exchange.quotePriceRate,
	(quotePriceRate) => toWei(quotePriceRate)
);

export const selectBasePriceRateWei = createSelector(
	(state: RootState) => state.exchange.basePriceRate,
	(basePriceRate) => toWei(basePriceRate)
);

export const selectTotalRedeemableBalanceWei = createSelector(
	(state: RootState) => state.exchange.totalRedeemableBalance,
	(totalRedeemableBalance) => toWei(totalRedeemableBalance)
);

export const selectBaseTradePriceEstimateWei = createSelector(
	(state: RootState) => state.exchange.estimatedBaseTradePrice,
	(estimatedBaseTradePrice) => toWei(estimatedBaseTradePrice)
);

export const selectExchangeFeeRateWei = createSelector(
	(state: RootState) => state.exchange.exchangeFeeRate,
	(exchangeFeeRate) => toWei(exchangeFeeRate)
);

export const selectSlippagePercentWei = createSelector(
	(state: RootState) => state.exchange.slippagePercent,
	(slippagePercent) => toWei(slippagePercent)
);

export const selectTransactionFeeWei = createSelector(
	(state: RootState) => state.exchange.transactionFee,
	(transactionFee) => toWei(transactionFee)
);

export const selectFeeCostWei = createSelector(
	(state: RootState) => state.exchange.feeCost,
	(feeCost) => toWei(feeCost)
);

export const selectBaseFeeRateWei = createSelector(
	(state: RootState) => state.exchange.baseFeeRate,
	(baseFeeRate) => toWei(baseFeeRate)
);
