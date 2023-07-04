import { CRYPTO_CURRENCY_MAP, ZERO_WEI } from '@kwenta/sdk/constants'
import { toWei } from '@kwenta/sdk/utils'
import { createSelector } from '@reduxjs/toolkit'
import { wei } from '@synthetixio/wei'

import { selectTotalUSDBalanceWei } from 'state/balances/selectors'
import { selectPrices } from 'state/prices/selectors'
import sdk from 'state/sdk'
import type { RootState } from 'state/store'
import { FetchStatus } from 'state/types'
import { selectIsWalletConnected } from 'state/wallet/selectors'

export const selectTokenList = (state: RootState) => state.exchange.tokenList

export const selectQuoteAmountWei = createSelector(
	(state: RootState) => state.exchange.quoteAmount,
	(quoteAmount) => toWei(quoteAmount)
)

export const selectBaseAmountWei = createSelector(
	(state: RootState) => state.exchange.baseAmount,
	(baseAmount) => toWei(baseAmount)
)

export const selectBothSidesSelected = createSelector(
	(state: RootState) => ({
		baseCurrencyKey: state.exchange.baseCurrencyKey,
		quoteCurrencyKey: state.exchange.quoteCurrencyKey,
	}),
	({ baseCurrencyKey, quoteCurrencyKey }) => !!baseCurrencyKey && !!quoteCurrencyKey
)

export const selectQuoteCurrencyName = createSelector(
	(state: RootState) => state.exchange.quoteCurrencyKey,
	(quoteCurrencyKey) =>
		quoteCurrencyKey ? sdk.exchange.getCurrencyName(quoteCurrencyKey) : undefined
)

export const selectBaseCurrencyName = createSelector(
	(state: RootState) => state.exchange.baseCurrencyKey,
	(baseCurrencyKey) => (baseCurrencyKey ? sdk.exchange.getCurrencyName(baseCurrencyKey) : undefined)
)

export const selectNoSynths = createSelector(selectTotalUSDBalanceWei, (totalUSDBalance) =>
	totalUSDBalance.lte(ZERO_WEI)
)

export const selectShowFee = createSelector(
	(state: RootState) => state.exchange.txProvider,
	(txProvider) => txProvider === 'synthetix'
)

export const selectRateWei = createSelector(
	(state: RootState) => state.exchange.rate,
	(rate) => (!!rate ? wei(rate) : ZERO_WEI)
)

export const selectInverseRate = createSelector(selectRateWei, (rate) =>
	rate.gt(0) ? wei(1).div(rate) : wei(0)
)

export const selectQuoteBalanceWei = createSelector(
	(state: RootState) => state.balances.synthBalancesMap,
	(state: RootState) => state.balances.tokenBalances,
	(state: RootState) => state.exchange.quoteCurrencyKey,
	(balancesMap, tokenBalances, quoteCurrencyKey) => {
		return quoteCurrencyKey
			? toWei(balancesMap[quoteCurrencyKey]?.balance ?? tokenBalances?.[quoteCurrencyKey]?.balance)
			: ZERO_WEI
	}
)

export const selectInsufficientBalance = createSelector(
	selectQuoteAmountWei,
	selectQuoteBalanceWei,
	(quoteAmountWei, quoteBalance) => quoteAmountWei.gt(quoteBalance)
)

export const selectBaseBalanceWei = createSelector(
	(state: RootState) => state.balances.synthBalancesMap,
	(state: RootState) => state.balances.tokenBalances,
	(state: RootState) => state.exchange.baseCurrencyKey,
	(balancesMap, tokenBalances, baseCurrencyKey) => {
		return baseCurrencyKey
			? toWei(balancesMap[baseCurrencyKey]?.balance ?? tokenBalances?.[baseCurrencyKey]?.balance)
			: ZERO_WEI
	}
)

// TODO: Should probably resolve these from state of prices
// and asset rather than storing the price on state directly
export const selectQuotePriceRateWei = createSelector(
	(state: RootState) => state.exchange.quotePriceRate,
	(quotePriceRate) => toWei(quotePriceRate)
)

export const selectBasePriceRateWei = createSelector(
	(state: RootState) => state.exchange.basePriceRate,
	(basePriceRate) => toWei(basePriceRate)
)

export const selectExchangeFeeRateWei = createSelector(
	(state: RootState) => state.exchange.exchangeFeeRate,
	(exchangeFeeRate) => toWei(exchangeFeeRate)
)

export const selectSlippagePercentWei = createSelector(
	(state: RootState) => state.exchange.slippagePercent,
	(slippagePercent) => toWei(slippagePercent)
)

export const selectTransactionFeeWei = createSelector(
	(state: RootState) => state.exchange.transactionFee,
	(transactionFee) => (transactionFee ? toWei(transactionFee) : undefined)
)

export const selectFeeCostWei = createSelector(
	(state: RootState) => state.exchange.feeCost,
	(feeCost) => toWei(feeCost)
)

export const selectBaseFeeRateWei = createSelector(
	(state: RootState) => state.exchange.baseFeeRate,
	(baseFeeRate) => toWei(baseFeeRate)
)

export const selectNeedsApproval = createSelector(
	(state: RootState) => state.exchange.txProvider,
	(state: RootState) => state.exchange.quoteCurrencyKey,
	(txProvider, quoteCurrencyKey) => {
		const isQuoteCurrencyETH = quoteCurrencyKey === CRYPTO_CURRENCY_MAP.ETH
		return (txProvider === '1inch' || txProvider === 'synthswap') && !isQuoteCurrencyETH
	}
)

export const selectIsApproved = createSelector(
	selectNeedsApproval,
	(state: RootState) => state.exchange.allowance,
	selectQuoteAmountWei,
	(needsApproval, allowance, quoteAmount) => {
		return needsApproval ? toWei(allowance).gte(quoteAmount) : true
	}
)

export const selectIsApproving = createSelector(
	(state: RootState) => state.exchange.approvalStatus,
	(approvalStatus) => approvalStatus === FetchStatus.Loading
)

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
			return 'exchange.summary-info.button.fee-reclaim-period'
		}
		if (!bothSidesSelected) {
			return txProvider === '1inch'
				? 'exchange.summary-info.button.select-token'
				: 'exchange.summary-info.button.select-synth'
		}
		if (insufficientBalance) {
			return 'exchange.summary-info.button.insufficient-balance'
		}
		if (isSubmitting) {
			return 'exchange.summary-info.button.submitting-order'
		}
		if (isApproving) {
			return 'exchange.summary-info.button.approving'
		}
		if (oneInchQuoteError) {
			return 'exchange.summary-info.button.insufficient-liquidity'
		}
		if (!isWalletConnected || baseAmountWei.lte(0) || quoteAmountWei.lte(0)) {
			return 'exchange.summary-info.button.enter-amount'
		}
		return null
	}
)

export const selectIsSubmissionDisabled = createSelector(
	selectSubmissionDisabledReason,
	(submissionDisabledReason) => !!submissionDisabledReason
)

export const selectUsdRateWei = createSelector(selectPrices, (prices) => prices['sUSD'].onChain)

export const selectTotalTradePrice = createSelector(
	selectQuoteAmountWei,
	selectQuotePriceRateWei,
	selectUsdRateWei,
	(quoteAmount, quotePriceRate, sUSDRate) => {
		let tradePrice = quoteAmount.mul(quotePriceRate || 0)
		if (sUSDRate) {
			tradePrice = tradePrice.div(sUSDRate)
		}
		return tradePrice
	}
)

export const selectEstimatedBaseTradePrice = createSelector(
	selectBaseAmountWei,
	selectBasePriceRateWei,
	selectUsdRateWei,
	(baseAmount, basePriceRate, sUSDRate) => {
		let tradePrice = baseAmount.mul(basePriceRate || 0)
		if (sUSDRate) {
			tradePrice = tradePrice.div(sUSDRate)
		}
		return tradePrice
	}
)

export const selectWalletTrades = (state: RootState) => state.exchange.walletTrades

export const selectWalletTradesLoading = (state: RootState) =>
	state.exchange.walletTradesStatus === FetchStatus.Loading
