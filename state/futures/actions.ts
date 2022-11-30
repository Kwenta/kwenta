import { createAsyncThunk } from '@reduxjs/toolkit';
import Wei from '@synthetixio/wei';
import KwentaSDK from 'sdk';

import { monitorTransaction } from 'contexts/RelayerContext';
import { Period } from 'sdk/constants/period';
import { TransactionStatus } from 'sdk/types/common';
import { FuturesMarket, FuturesPosition, FuturesVolumes } from 'sdk/types/futures';
import { setOpenModal } from 'state/app/reducer';
import { serializeWeiObject } from 'state/helpers';
import { AppDispatch, AppThunk } from 'state/store';
import { ThunkConfig } from 'state/types';
import { serializeCmBalanceInfo, serializeFuturesVolumes, serializeMarkets } from 'utils/futures';
import logError from 'utils/logError';

import {
	handleTransactionError,
	setTransaction,
	updateTransactionHash,
	updateTransactionStatus,
} from './reducer';
import { CrossMarginBalanceInfo, FundingRateSerialized } from './types';

export const fetchMarkets = createAsyncThunk<
	{ markets: FuturesMarket<string>[]; fundingRates: FundingRateSerialized[] },
	void,
	ThunkConfig
>('futures/fetchMarkets', async (_, { extra: { sdk } }) => {
	const markets = await sdk.futures.getMarkets();
	const serializedMarkets = serializeMarkets(markets);
	const averageFundingRates = await sdk.futures.getAverageFundingRates(markets, Period.ONE_HOUR);
	const seriailizedRates = averageFundingRates.map((r) => ({
		...r,
		fundingRate: r.fundingRate ? r.fundingRate.toString() : null,
	}));
	return { markets: serializedMarkets, fundingRates: seriailizedRates };
});

export const fetchCrossMarginBalanceInfo = createAsyncThunk<
	CrossMarginBalanceInfo<string>,
	void,
	ThunkConfig
>('futures/fetchCrossMarginBalanceInfo', async (_, { getState, extra: { sdk } }) => {
	const { futures } = getState();
	const account = futures.crossMargin.account;
	if (!account) throw new Error('No cross margin account');
	const overview = await sdk.futures.getCrossMarginBalanceInfo(account);
	return serializeCmBalanceInfo(overview);
});

export const depositCrossMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/depositCrossMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const { futures } = getState();
		const account = futures.crossMargin.account;
		if (!account) throw new Error('No cross margin account');
		await submitCMTransferTransaction(dispatch, sdk, 'deposit', account, amount);
	}
);

export const withdrawCrossMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/withdrawCrossMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const { futures } = getState();
		const account = futures.crossMargin.account;
		if (!account) throw new Error('No cross margin account');
		await submitCMTransferTransaction(dispatch, sdk, 'withdraw', account, amount);
	}
);

export const approveCrossMargin = createAsyncThunk<void, void, ThunkConfig>(
	'futures/approveCrossMargin',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const { futures } = getState();
		const account = futures.crossMargin.account;
		if (!account) throw new Error('No cross margin account');
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'approve',
					hash: null,
				})
			);
			const tx = await sdk.futures.approveCrossMarginDeposit(account);
			dispatch(updateTransactionHash(tx.hash));
			await tx.wait();
			dispatch(fetchCrossMarginBalanceInfo());
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const fetchFuturesPositionsForType = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchFuturesPositionsForType',
	async (_, { dispatch, getState }) => {
		const { futures } = getState();
		if (futures.selectedType === 'cross_margin') {
			dispatch(fetchCrossMarginPositions());
		} else {
			dispatch(fetchIsolatedMarginPositions());
		}
	}
);

export const fetchAllFuturesPositions = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchAllFuturesPositions',
	async (_, { dispatch }) => {
		dispatch(fetchCrossMarginPositions());
		dispatch(fetchIsolatedMarginPositions());
	}
);

export const fetchCrossMarginPositions = createAsyncThunk<
	FuturesPosition<string>[],
	void,
	ThunkConfig
>('futures/fetchCrossMarginPositions', async (_, { getState, extra: { sdk } }) => {
	const { futures } = getState();
	if (!futures.crossMargin.account) return [];
	const positions = await sdk.futures.getFuturesPositions(
		futures.crossMargin.account,
		futures.markets.map((m) => ({ asset: m.asset, address: m.market }))
	);
	return positions.map((p) => serializeWeiObject(p) as FuturesPosition<string>);
});

export const fetchIsolatedMarginPositions = createAsyncThunk<
	{ positions: FuturesPosition<string>[]; wallet: string },
	void,
	ThunkConfig
>('futures/fetchIsolatedMarginPositions', async (_, { getState, extra: { sdk } }) => {
	const { wallet, futures } = getState();
	if (!wallet.walletAddress) throw new Error('No wallet connected');
	const positions = await sdk.futures.getFuturesPositions(
		wallet.walletAddress,
		futures.markets.map((m) => ({ asset: m.asset, address: m.market }))
	);
	return {
		positions: positions.map((p) => serializeWeiObject(p) as FuturesPosition<string>),
		wallet: wallet.walletAddress,
	};
});

export const fetchDailyVolumes = createAsyncThunk<FuturesVolumes<string>, void, ThunkConfig>(
	'futures/fetchDailyVolumes',
	async (_, { extra: { sdk } }) => {
		const volumes = await sdk.futures.getDailyVolumes();
		return serializeFuturesVolumes(volumes);
	}
);

export const fetchCrossMarginAccountData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchCrossMarginAccountData',
	async (_, { dispatch }) => {
		dispatch(fetchCrossMarginPositions());
		dispatch(fetchCrossMarginBalanceInfo());
	}
);

export const fetchSharedFuturesData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchAllFuturesPositions',
	async (_, { dispatch }) => {
		dispatch(fetchMarkets());
		dispatch(fetchDailyVolumes());
	}
);

// TODO: Finish
export const resetFuturesState = (): AppThunk => (dispatch) => {
	dispatch({
		type: 'futures/resetFuturesState',
	});
};

const submitCMTransferTransaction = async (
	dispatch: AppDispatch,
	sdk: KwentaSDK,
	type: 'deposit' | 'withdraw',
	account: string,
	amount: Wei
) => {
	dispatch(
		setTransaction({
			status: TransactionStatus.AwaitingExecution,
			type: type,
			hash: null,
		})
	);

	try {
		const tx =
			type === 'deposit'
				? await sdk.futures.depositCrossMargin(account, amount)
				: await sdk.futures.withdrawCrossMargin(account, amount);
		dispatch(updateTransactionHash(tx.hash));
		if (tx.hash) {
			monitorTransaction({
				txHash: tx.hash,
				onTxFailed: (err) => {
					dispatch(handleTransactionError(err.failureReason ?? 'transaction_failed'));
				},
				onTxConfirmed: () => {
					dispatch(updateTransactionStatus(TransactionStatus.Confirmed));
					dispatch(fetchCrossMarginBalanceInfo());
					dispatch(setOpenModal(null));
				},
			});
		}
		return tx;
	} catch (err) {
		logError(err);
		dispatch(handleTransactionError(err.message));
		throw err;
	}
};
