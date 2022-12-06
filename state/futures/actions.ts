import { createAsyncThunk } from '@reduxjs/toolkit';
import Wei, { wei } from '@synthetixio/wei';
import { BigNumber } from 'ethers';
import KwentaSDK from 'sdk';

import { monitorTransaction } from 'contexts/RelayerContext';
import { FuturesAccountType } from 'queries/futures/types';
import { Period } from 'sdk/constants/period';
import { TransactionStatus } from 'sdk/types/common';
import { FuturesMarket, FuturesOrder, FuturesPosition, FuturesVolumes } from 'sdk/types/futures';
import { unserializeGasPrice } from 'state/app/helpers';
import { setOpenModal } from 'state/app/reducer';
import { fetchBalances } from 'state/balances/actions';
import { selectEthRate } from 'state/exchange/selectors';
import { serializeWeiObject } from 'state/helpers';
import { AppDispatch, AppThunk, RootState } from 'state/store';
import { ThunkConfig } from 'state/types';
import {
	serializeCmBalanceInfo,
	serializeCrossMarginSettings,
	serializeFuturesOrders,
	serializeFuturesVolumes,
	serializeMarkets,
	unserializeMarkets,
} from 'utils/futures';
import logError from 'utils/logError';
import { getTransactionPrice } from 'utils/network';
import { refetchWithComparator } from 'utils/queries';

import {
	handleTransactionError,
	setTransaction,
	setTransactionEstimate,
	updateTransactionHash,
	updateTransactionStatus,
} from './reducer';
import { selectMarketInfo, selectPosition } from './selectors';
import {
	CrossMarginBalanceInfo,
	CrossMarginSettings,
	FundingRateSerialized,
	FuturesTransactionType,
	ModifyIsolatedPositionInputs,
} from './types';

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

export const fetchCrossMarginSettings = createAsyncThunk<
	CrossMarginSettings<string>,
	void,
	ThunkConfig
>('futures/fetchCrossMarginSettings', async (_, { extra: { sdk } }) => {
	const settings = await sdk.futures.getCrossMarginSettings();
	return serializeCrossMarginSettings(settings);
});

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
		futures.markets.map((m) => ({ asset: m.asset, marketKey: m.marketKey, address: m.market }))
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
		futures.markets.map((m) => ({ asset: m.asset, marketKey: m.marketKey, address: m.market }))
	);
	return {
		positions: positions.map((p) => serializeWeiObject(p) as FuturesPosition<string>),
		wallet: wallet.walletAddress,
	};
});

export const refetchPosition = createAsyncThunk<
	{ position: FuturesPosition<string>; wallet: string; futuresType: FuturesAccountType } | null,
	FuturesAccountType,
	ThunkConfig
>('futures/refetchPosition', async (type, { getState, extra: { sdk } }) => {
	const { wallet, futures } = getState();
	const account = type === 'cross_margin' ? futures.crossMargin.account : wallet.walletAddress;
	if (!account) throw new Error('No wallet connected');
	const marketInfo = selectMarketInfo(getState());
	const position = selectPosition(getState());
	if (!marketInfo || !position) throw new Error('Market or position not found');

	const result = await refetchWithComparator(
		() =>
			sdk.futures.getFuturesPositions(account!, [
				{ asset: marketInfo.asset, marketKey: marketInfo.marketKey, address: marketInfo.market },
			]),
		position.remainingMargin,
		(existing, next) => {
			return existing === next[0]?.remainingMargin.toString();
		}
	);

	if (result.data[0]) {
		const serialized = serializeWeiObject(result.data[0] as FuturesPosition) as FuturesPosition<
			string
		>;
		return { position: serialized, wallet: account, futuresType: type };
	}
	return null;
});

export const fetchDailyVolumes = createAsyncThunk<FuturesVolumes<string>, void, ThunkConfig>(
	'futures/fetchDailyVolumes',
	async (_, { extra: { sdk } }) => {
		const volumes = await sdk.futures.getDailyVolumes();
		return serializeFuturesVolumes(volumes);
	}
);

export const fetchDashboardFuturesData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchDashboardFuturesData',
	async (_, { dispatch }) => {
		await dispatch(fetchMarkets());
		dispatch(fetchCrossMarginBalanceInfo());
		dispatch(fetchOpenOrders());
	}
);

export const fetchCrossMarginAccountData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchCrossMarginAccountData',
	async (_, { dispatch }) => {
		dispatch(fetchCrossMarginPositions());
		dispatch(fetchCrossMarginBalanceInfo());
	}
);

export const fetchIsolatedMarginAccountData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchIsolatedMarginAccountData',
	async (_, { dispatch }) => {
		dispatch(fetchIsolatedMarginPositions());
	}
);

export const fetchSharedFuturesData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchSharedFuturesData',
	async (_, { dispatch }) => {
		dispatch(fetchMarkets());
		dispatch(fetchDailyVolumes());
	}
);

export const fetchOpenOrders = createAsyncThunk<
	{ orders: FuturesOrder<string>[]; account: string; accountType: FuturesAccountType },
	void,
	ThunkConfig
>('futures/fetchOpenOrders', async (_, { getState, extra: { sdk } }) => {
	const { wallet, futures } = getState();
	const account =
		futures.selectedType === 'cross_margin' ? futures.crossMargin.account : wallet.walletAddress;
	if (!account) {
		throw new Error('No account to fetch orders');
	}
	const orders = await sdk.futures.getOpenOrders(account, unserializeMarkets(futures.markets));
	return {
		orders: serializeFuturesOrders(orders),
		account: account,
		accountType: futures.selectedType,
	};
});

// Contract Mutations

export const depositCrossMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/depositCrossMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const { futures } = getState();
		const account = futures.crossMargin.account;
		if (!account) throw new Error('No cross margin account');
		await submitCMTransferTransaction(dispatch, sdk, 'deposit_cross_margin', account, amount);
	}
);

export const withdrawCrossMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/withdrawCrossMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const { futures } = getState();
		const account = futures.crossMargin.account;
		if (!account) throw new Error('No cross margin account');
		await submitCMTransferTransaction(dispatch, sdk, 'withdraw_cross_margin', account, amount);
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
					type: 'approve_cross_margin',
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

export const depositIsolatedMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/depositIsolatedMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		if (!marketInfo) throw new Error('Market info not found');
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'deposit_isolated',
					hash: null,
				})
			);
			const tx = await sdk.futures.depositIsolatedMargin(marketInfo.market, amount);
			dispatch(updateTransactionHash(tx.hash));
			await tx.wait();
			dispatch(refetchPosition('isolated_margin'));
			dispatch(setOpenModal(null));
			// TODO: More reliable balance updates
			setTimeout(() => dispatch(fetchBalances()), 1000);
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const withdrawIsolatedMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/withdrawIsolatedMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		if (!marketInfo) throw new Error('Market info not found');
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'withdraw_isolated',
					hash: null,
				})
			);
			const tx = await sdk.futures.withdrawIsolatedMargin(marketInfo.market, amount);
			dispatch(updateTransactionHash(tx.hash));
			await tx.wait();
			dispatch(refetchPosition('isolated_margin'));
			dispatch(setOpenModal(null));
			// TODO: More reliable balance updates
			setTimeout(() => dispatch(fetchBalances()), 1000);
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const modifyIsolatedPosition = createAsyncThunk<
	void,
	ModifyIsolatedPositionInputs,
	ThunkConfig
>(
	'futures/modifyIsolatedPosition',
	async ({ sizeDelta, useNextPrice }, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		if (!marketInfo) throw new Error('Market info not found');
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'modify_isolated',
					hash: null,
				})
			);
			const tx = await sdk.futures.modifyIsolatedMarginPosition(
				marketInfo.market,
				sizeDelta,
				useNextPrice,
				false
			);
			dispatch(updateTransactionHash(tx.hash));
			await tx.wait();
			dispatch(refetchPosition('isolated_margin'));
			dispatch(setOpenModal(null));
			// TODO: More reliable balance updates
			setTimeout(() => dispatch(fetchBalances()), 1000);
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const modifyIsolatedPositionEstimateGas = createAsyncThunk<
	void,
	ModifyIsolatedPositionInputs,
	ThunkConfig
>(
	'futures/modifyIsolatedPositionEstimateGas',
	async ({ sizeDelta, useNextPrice }, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		if (!marketInfo) throw new Error('Market info not found');
		estimateGasInteralAction(
			() =>
				sdk.futures.modifyIsolatedMarginPosition(marketInfo.market, sizeDelta, useNextPrice, true),
			'modify_isolated',
			{ getState, dispatch }
		);
	}
);

export const closeIsolatedMarginPosition = createAsyncThunk<void, void, ThunkConfig>(
	'futures/closeIsolatedMarginPosition',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		if (!marketInfo) throw new Error('Market info not found');
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'close_isolated',
					hash: null,
				})
			);
			const tx = await sdk.futures.closeIsolatedPosition(marketInfo.market);
			dispatch(updateTransactionHash(tx.hash));
			await tx.wait();
			dispatch(refetchPosition('isolated_margin'));
			dispatch(setOpenModal(null));
			// TODO: More reliable balance updates
			setTimeout(() => dispatch(fetchBalances()), 1000);
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

const estimateGasInteralAction = async (
	gasLimitEstimate: () => Promise<BigNumber>,
	type: FuturesTransactionType,
	config: {
		getState: () => RootState;
		dispatch: AppDispatch;
	}
) => {
	const { app } = config.getState();
	const ethPrice = selectEthRate(config.getState());

	try {
		const limit = await gasLimitEstimate();
		const estimate = getTransactionPrice(
			unserializeGasPrice(app.gasPrice),
			limit,
			ethPrice,
			wei(0)
		);

		config.dispatch(
			setTransactionEstimate({
				type: type,
				limit: limit.toString(),
				cost: estimate?.toString() ?? '0',
			})
		);
	} catch (err) {
		config.dispatch(
			setTransactionEstimate({
				type: type,
				limit: '0',
				cost: '0',
				error: err.message,
			})
		);
		throw err;
	}
};

// TODO: Finish
export const resetFuturesState = (): AppThunk => (dispatch) => {
	dispatch({
		type: 'futures/resetFuturesState',
	});
};

const submitCMTransferTransaction = async (
	dispatch: AppDispatch,
	sdk: KwentaSDK,
	type: 'withdraw_cross_margin' | 'deposit_cross_margin',
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
			type === 'deposit_cross_margin'
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
					dispatch(refetchPosition('cross_margin'));
					dispatch(setOpenModal(null));
					// TODO: More reliable balance fetching
					setTimeout(() => dispatch(fetchBalances()), 1000);
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
