import { createAsyncThunk } from '@reduxjs/toolkit';
import KwentaSDK from 'sdk';
import { AppDispatch, RootState } from 'state/store';

type ThunkConfig = {
	dispatch: AppDispatch;
	state: RootState;
	extra: { sdk: KwentaSDK };
};

export const fetchBalances = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchBalances',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState();

		const quoteBalance = quoteCurrencyKey
			? await sdk.exchange.getBalance(quoteCurrencyKey)
			: undefined;

		const baseBalance = baseCurrencyKey
			? await sdk.exchange.getBalance(baseCurrencyKey)
			: undefined;

		const {
			balances: redeemableBalances,
			totalUSDBalance: totalRedeemableBalance,
		} = await sdk.exchange.getRedeemableDeprecatedSynths();

		return {
			quoteBalance: quoteBalance ? quoteBalance.toString() : undefined,
			baseBalance: baseBalance ? baseBalance.toString() : undefined,
			redeemableBalances,
			totalRedeemableBalance: totalRedeemableBalance.toString(),
		};
	}
);

export const fetchTxProvider = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchTxProvider',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState();

		if (baseCurrencyKey && quoteCurrencyKey) {
			const txProvider = sdk.exchange.getTxProvider(baseCurrencyKey, quoteCurrencyKey);

			return txProvider;
		}

		return undefined;
	}
);

export const fetchTransactionFee = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchTransactionFee',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount },
		} = getState();

		if (baseCurrencyKey && quoteCurrencyKey) {
			const transactionFee = await sdk.exchange.getTransactionFee(
				quoteCurrencyKey,
				baseCurrencyKey,
				quoteAmount,
				baseAmount
			);

			const feeCost = await sdk.exchange.getFeeCost(quoteCurrencyKey, baseCurrencyKey, quoteAmount);

			return {
				transactionFee: transactionFee ? transactionFee.toString() : undefined,
				feeCost: feeCost.toString(),
			};
		}

		return { transactionFee: undefined, feeCost: undefined };
	}
);

export const submitExchange = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/submitExchange',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey, quoteAmount, baseAmount },
		} = getState();

		if (quoteCurrencyKey && baseCurrencyKey) {
			await sdk.exchange.handleExchange(
				quoteCurrencyKey,
				baseCurrencyKey,
				quoteAmount,
				baseAmount,
				true
			);
		}
	}
);

export const submitRedeem = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/submitRedeem',
	async (_, { extra: { sdk } }) => {
		await sdk.exchange.handleRedeem();
	}
);

export const submitApprove = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/submitApprove',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState();

		if (quoteCurrencyKey && baseCurrencyKey) {
			await sdk.exchange.handleApprove(quoteCurrencyKey, baseCurrencyKey);
		}
	}
);

export const checkNeedsApproval = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/checkNeedsApproval',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState();

		if (quoteCurrencyKey && baseCurrencyKey) {
			return sdk.exchange.checkNeedsApproval(baseCurrencyKey, quoteCurrencyKey);
		}

		return false;
	}
);

export const fetchRates = createAsyncThunk<any, void, ThunkConfig>(
	'exchange/fetchRates',
	async (_, { getState, extra: { sdk } }) => {
		const {
			exchange: { quoteCurrencyKey, baseCurrencyKey },
		} = getState();

		if (baseCurrencyKey && quoteCurrencyKey) {
			const baseFeeRate = await sdk.exchange.getBaseFeeRate(baseCurrencyKey, quoteCurrencyKey);
			const rate = await sdk.exchange.getRate(baseCurrencyKey, quoteCurrencyKey);
			const exchangeFeeRate = await sdk.exchange.getExchangeFeeRate(
				quoteCurrencyKey,
				baseCurrencyKey
			);

			return {
				baseFeeRate: baseFeeRate.toString(),
				rate: rate.toString(),
				exchangeFeeRate: exchangeFeeRate.toString(),
			};
		}
	}
);
