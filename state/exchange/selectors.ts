import { createSelector } from '@reduxjs/toolkit';
import { wei } from '@synthetixio/wei';
import { selectTotalUSDBalanceWei } from 'state/balances/selectors';
import { sdk } from 'state/config';
import type { RootState } from 'state/store';
import { FetchStatus } from 'state/types';
import { selectIsWalletConnected } from 'state/wallet/selectors';

import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { toWei, zeroBN } from 'utils/formatters/number';

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
	(state: RootState) => state.balances.balancesMap,
	(state: RootState) => state.exchange.quoteCurrencyKey,
	(balancesMap, quoteCurrencyKey) => {
		return quoteCurrencyKey ? toWei(balancesMap[quoteCurrencyKey]?.balance) : zeroBN;
	}
);

export const selectBaseBalanceWei = createSelector(
	(state: RootState) => state.balances.balancesMap,
	(state: RootState) => state.exchange.baseCurrencyKey,
	(balancesMap, baseCurrencyKey) => {
		return baseCurrencyKey ? toWei(balancesMap[baseCurrencyKey]?.balance) : zeroBN;
	}
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
	(transactionFee) => (transactionFee ? toWei(transactionFee) : undefined)
);

export const selectFeeCostWei = createSelector(
	(state: RootState) => state.exchange.feeCost,
	(feeCost) => toWei(feeCost)
);

export const selectBaseFeeRateWei = createSelector(
	(state: RootState) => state.exchange.baseFeeRate,
	(baseFeeRate) => toWei(baseFeeRate)
);

export const selectCanRedeem = createSelector(
	selectTotalRedeemableBalanceWei,
	(state: RootState) => state.exchange.redeemableSynthBalances,
	(totalRedeemableBalance, redeemableSynthBalances) =>
		totalRedeemableBalance.gt(0) && redeemableSynthBalances.length > 0
);

export const selectNeedsApproval = createSelector(
	(state: RootState) => state.exchange.txProvider,
	(state: RootState) => state.exchange.quoteCurrencyKey,
	(txProvider, quoteCurrencyKey) => {
		const isQuoteCurrencyETH = quoteCurrencyKey === CRYPTO_CURRENCY_MAP.ETH;
		return (txProvider === '1inch' || txProvider === 'synthswap') && !isQuoteCurrencyETH;
	}
);

export const selectIsApproved = createSelector(
	selectNeedsApproval,
	(state: RootState) => state.exchange.allowance,
	selectQuoteAmountWei,
	(needsApproval, allowance, quoteAmount) => {
		return needsApproval ? toWei(allowance).gte(quoteAmount) : true;
	}
);

export const selectIsApproving = createSelector(
	(state: RootState) => state.exchange.approvalStatus,
	(approvalStatus) => approvalStatus === FetchStatus.Loading
);

export const selectSubmissionDisabledReason = createSelector(
	(state: RootState) => state.exchange.txProvider,
	(state: RootState) => state.exchange.feeReclaimPeriod,
	selectBothSidesSelected,
	selectInsufficientBalance,
	(state: RootState) => state.exchange.isSubmitting,
	selectIsApproving,
	(state: RootState) => state.exchange.oneInchQuoteError,
	selectIsWalletConnected,
	selectBaseAmountWei,
	selectQuoteAmountWei,
	(
		txProvider,
		feeReclaimPeriod,
		bothSidesSelected,
		insufficientBalance,
		isSubmitting,
		isApproving,
		oneInchQuoteError,
		isWalletConnected,
		baseAmountWei,
		quoteAmountWei
	) => {
		if (feeReclaimPeriod > 0) {
			return 'exchange.summary-info.button.fee-reclaim-period';
		}
		if (!bothSidesSelected) {
			return txProvider === '1inch'
				? 'exchange.summary-info.button.select-token'
				: 'exchange.summary-info.button.select-synth';
		}
		if (insufficientBalance) {
			return 'exchange.summary-info.button.insufficient-balance';
		}
		if (isSubmitting) {
			return 'exchange.summary-info.button.submitting-order';
		}
		if (isApproving) {
			return 'exchange.summary-info.button.approving';
		}
		if (oneInchQuoteError) {
			return 'exchange.summary-info.button.insufficient-liquidity';
		}
		if (!isWalletConnected || baseAmountWei.lte(0) || quoteAmountWei.lte(0)) {
			return 'exchange.summary-info.button.enter-amount';
		}
		return null;
	}
);

export const selectIsSubmissionDisabled = createSelector(
	selectSubmissionDisabledReason,
	(submissionDisabledReason) => !!submissionDisabledReason
);
