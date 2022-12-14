import { createAsyncThunk } from '@reduxjs/toolkit';
import Wei, { wei } from '@synthetixio/wei';
import { BigNumber } from 'ethers';
import { debounce } from 'lodash';
import KwentaSDK from 'sdk';

import { ORDER_KEEPER_ETH_DEPOSIT } from 'constants/futures';
import { monitorTransaction } from 'contexts/RelayerContext';
import { FuturesAccountType } from 'queries/futures/types';
import { TransactionStatus } from 'sdk/types/common';
import {
	DelayedOrder,
	FuturesMarket,
	FuturesPosition,
	FuturesPotentialTradeDetails,
	FuturesVolumes,
	PositionSide,
} from 'sdk/types/futures';
import { calculateCrossMarginFee, getMarketName, serializePotentialTrade } from 'sdk/utils/futures';
import { unserializeGasPrice } from 'state/app/helpers';
import { setOpenModal } from 'state/app/reducer';
import { fetchBalances } from 'state/balances/actions';
import { selectEthRate } from 'state/exchange/selectors';
import { serializeWeiObject } from 'state/helpers';
import { AppDispatch, AppThunk, RootState } from 'state/store';
import { ThunkConfig } from 'state/types';
import { computeMarketFee } from 'utils/costCalculations';
import { stipZeros } from 'utils/formatters/number';
import {
	calculateMarginDelta,
	orderPriceInvalidLabel,
	serializeCmBalanceInfo,
	serializeCrossMarginSettings,
	serializeDelayedOrders,
	serializeFuturesVolumes,
	serializeMarkets,
} from 'utils/futures';
import logError from 'utils/logError';
import { getTransactionPrice } from 'utils/network';
import { refetchWithComparator } from 'utils/queries';

import {
	handleCrossMarginPreviewError,
	handleIsolatedMarginPreviewError,
	handleTransactionError,
	setCrossMarginFees,
	setCrossMarginLeverage,
	setCrossMarginMarginDelta,
	setCrossMarginOrderPrice,
	setCrossMarginOrderPriceInvalidLabel,
	setCrossMarginTradeInputs,
	setCrossMarginTradePreview,
	setIsolatedMarginFee,
	setIsolatedMarginLeverageInput,
	setIsolatedMarginTradeInputs,
	setIsolatedTradePreview,
	setLeverageSide,
	setTransaction,
	setTransactionEstimate,
	updateTransactionHash,
	updateTransactionStatus,
	ZERO_CM_FEES,
	ZERO_STATE_CM_TRADE_INPUTS,
} from './reducer';
import {
	selectCrossMarginAccount,
	selectCrossMarginMarginDelta,
	selectCrossMarginOrderPrice,
	selectCrossMarginSelectedLeverage,
	selectCrossMarginSettings,
	selectCrossMarginTradeFees,
	selectCrossMarginTradeInputs,
	selectDynamicFeeRate,
	selectFuturesAccount,
	selectFuturesType,
	selectIsAdvancedOrder,
	selectIsolatedMarginTradeInputs,
	selectIsolatedPriceImpact,
	selectKeeperEthBalance,
	selectLeverageSide,
	selectMarketAssetRate,
	selectMarketInfo,
	selectMarkets,
	selectOrderType,
	selectPosition,
	selectTradeSizeInputs,
} from './selectors';
import {
	CancelDelayedOrderInputs,
	CrossMarginBalanceInfo,
	CrossMarginSettings,
	FuturesTransactionType,
	ModifyIsolatedPositionInputs,
} from './types';

export const fetchMarkets = createAsyncThunk<
	{ markets: FuturesMarket<string>[] },
	void,
	ThunkConfig
>('futures/fetchMarkets', async (_, { extra: { sdk } }) => {
	const markets = await sdk.futures.getMarkets();
	const serializedMarkets = serializeMarkets(markets);
	return { markets: serializedMarkets };
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
	const account = selectFuturesAccount(getState());
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
	{ orders: DelayedOrder<string>[]; account: string; accountType: FuturesAccountType },
	void,
	ThunkConfig
>('futures/fetchOpenOrders', async (_, { getState, extra: { sdk } }) => {
	const { futures } = getState();
	const account = selectFuturesAccount(getState());
	const markets = selectMarkets(getState());
	if (!account) {
		throw new Error('No account to fetch orders');
	}
	if (markets.length === 0) {
		throw new Error('No markets available');
	}
	// TODO: Make this multicall
	const orders = await Promise.all(
		markets.map((market) => sdk.futures.getDelayedOrder(account, market.market))
	);
	const nonzeroOrders = orders
		.filter((o) => o.size.abs().gt(0))
		.map((o) => {
			const market = markets.find((m) => m.market === o.marketAddress);
			return {
				...o,
				marketKey: market?.marketKey,
				marketAsset: market?.asset,
				market: getMarketName(market?.asset ?? null),
			};
		});
	return {
		orders: serializeDelayedOrders(nonzeroOrders),
		account: account,
		accountType: futures.selectedType,
	};
});

export const fetchIsolatedMarginTradePreview = createAsyncThunk<
	FuturesPotentialTradeDetails<string> | null,
	Wei,
	ThunkConfig
>(
	'futures/fetchIsolatedMarginTradePreview',
	async (sizeDelta, { dispatch, getState, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		const account = selectFuturesAccount(getState());
		if (!account) throw new Error('No account to fetch orders');
		if (!marketInfo) throw new Error('No market info');
		const leverageSide = selectLeverageSide(getState());
		try {
			const preview = await sdk.futures.getIsolatedTradePreview(
				marketInfo?.market,
				sizeDelta,
				marketInfo?.priceOracle,
				marketInfo?.price,
				leverageSide
			);
			return serializePotentialTrade(preview);
		} catch (err) {
			dispatch(handleIsolatedMarginPreviewError(err.message));
			return null;
		}
	}
);

export const fetchCrossMarginTradePreview = createAsyncThunk<
	FuturesPotentialTradeDetails<string> | null,
	{ price?: Wei | undefined; sizeDelta: Wei; marginDelta: Wei },
	ThunkConfig
>(
	'futures/fetchCrossMarginTradePreview',
	async (inputs, { dispatch, getState, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		const account = selectFuturesAccount(getState());
		if (!account) throw new Error('No account to fetch orders');
		if (!marketInfo) throw new Error('No market info');
		const leverageSide = selectLeverageSide(getState());
		try {
			const preview = await sdk.futures.getCrossMarginTradePreview(
				account,
				marketInfo.marketKey,
				marketInfo.market,
				{ ...inputs, leverageSide }
			);
			return serializePotentialTrade(preview);
		} catch (err) {
			dispatch(handleCrossMarginPreviewError(err.message));
			return null;
		}
	}
);

export const clearTradeInputs = createAsyncThunk<void, void, ThunkConfig>(
	'futures/clearTradeInputs',
	async (_, { dispatch }) => {
		dispatch(editCrossMarginSize('0', 'usd'));
		dispatch(editIsolatedMarginSize('0', 'usd'));
		dispatch(setCrossMarginMarginDelta('0'));
		dispatch(setCrossMarginFees(ZERO_CM_FEES));
		dispatch(setIsolatedMarginFee('0'));
	}
);

export const editCrossMarginSize = (size: string, currencyType: 'usd' | 'native'): AppThunk => (
	dispatch,
	getState
) => {
	const leverage = selectCrossMarginSelectedLeverage(getState());
	const assetRate = selectMarketAssetRate(getState());
	const orderPrice = selectCrossMarginOrderPrice(getState());
	const isAdvancedOrder = selectIsAdvancedOrder(getState());
	const price = isAdvancedOrder && Number(orderPrice) > 0 ? wei(orderPrice) : assetRate;
	if (!size || Number(size) === 0 || assetRate.eq(0)) {
		dispatch(
			setCrossMarginTradeInputs({
				...ZERO_STATE_CM_TRADE_INPUTS,
				leverage: leverage.toString(),
			})
		);
		dispatch(setCrossMarginTradePreview(null));
		return;
	}
	const nativeSize = currencyType === 'native' ? size : wei(size).div(price).toString();
	const usdSize = currencyType === 'native' ? price.mul(size).toString() : size;

	dispatch(
		setCrossMarginTradeInputs({
			leverage: leverage.toString(),
			susdSize: usdSize,
			nativeSize: nativeSize,
		})
	);
	dispatch(stageCrossMarginSizeChange());
};

const stageCrossMarginSizeChange = createAsyncThunk<void, void, ThunkConfig>(
	'futures/stageCrossMarginSizeChange',
	async (_, { dispatch, getState }) => {
		const tradeInputs = selectCrossMarginTradeInputs(getState());
		const fees = selectCrossMarginTradeFees(getState());
		const rate = selectMarketAssetRate(getState());
		const price = selectCrossMarginOrderPrice(getState());
		const leverage = selectCrossMarginSelectedLeverage(getState());
		const position = selectPosition(getState());

		const marginDelta = tradeInputs.nativeSize.gt(0)
			? await calculateMarginDelta(
					{
						susdSizeDelta: tradeInputs.susdSizeDelta,
						nativeSizeDelta: tradeInputs.nativeSizeDelta,
						price: price ? wei(price) : rate,
						leverage: leverage,
					},
					fees,
					position
			  )
			: wei(0);
		dispatch(setCrossMarginMarginDelta(marginDelta.toString()));
		dispatch(calculateCrossMarginFees());
		debouncedPrepareCrossMarginTradePreview(dispatch);
	}
);

export const editExistingPositionLeverage = createAsyncThunk<void, string, ThunkConfig>(
	'futures/editExistingPositionLeverage',
	async (leverage, { dispatch, getState }) => {
		const tradeInputs = selectCrossMarginTradeInputs(getState());
		const fees = selectCrossMarginTradeFees(getState());
		const position = selectPosition(getState());
		const rate = selectMarketAssetRate(getState());
		const price = selectCrossMarginOrderPrice(getState());
		dispatch(setCrossMarginLeverage(leverage));
		const marginDelta = await calculateMarginDelta(
			{
				susdSizeDelta: tradeInputs.susdSizeDelta,
				nativeSizeDelta: tradeInputs.nativeSizeDelta,
				price: price ? wei(price) : rate,
				leverage: wei(leverage),
			},
			fees,
			position
		);
		dispatch(setCrossMarginMarginDelta(marginDelta.toString()));
		dispatch(calculateCrossMarginFees());
		debouncedPrepareCrossMarginTradePreview(dispatch);
	}
);

export const editIsolatedMarginSize = (size: string, currencyType: 'usd' | 'native'): AppThunk => (
	dispatch,
	getState
) => {
	const assetRate = selectMarketAssetRate(getState());
	const position = selectPosition(getState());
	if (
		!size ||
		Number(size) === 0 ||
		assetRate.eq(0) ||
		!position?.remainingMargin ||
		position?.remainingMargin.eq(0)
	) {
		dispatch(setIsolatedMarginTradeInputs(ZERO_STATE_CM_TRADE_INPUTS));
		dispatch(setIsolatedTradePreview(null));
		dispatch(setIsolatedMarginLeverageInput('0'));
		return;
	}

	const nativeSize = currencyType === 'native' ? size : wei(size).div(assetRate).toString();
	const usdSize = currencyType === 'native' ? stipZeros(assetRate.mul(size).toString()) : size;
	const leverage = wei(usdSize).div(position?.remainingMargin);

	dispatch(setIsolatedMarginLeverageInput(leverage.toNumber().toFixed(2)));

	dispatch(
		setIsolatedMarginTradeInputs({
			susdSize: usdSize,
			nativeSize: nativeSize,
		})
	);
	dispatch(calculateIsolatedMarginFees());
	debouncedPrepareIsolatedMarginTradePreview(dispatch);
};

export const editTradeSizeInput = (size: string, currencyType: 'usd' | 'native'): AppThunk => (
	dispatch,
	getState
) => {
	const type = selectFuturesType(getState());
	if (type === 'cross_margin') {
		dispatch(editCrossMarginSize(size, currencyType));
	} else {
		dispatch(editIsolatedMarginSize(size, currencyType));
	}
};

export const changeLeverageSide = (side: PositionSide): AppThunk => (dispatch, getState) => {
	const { nativeSizeString } = selectTradeSizeInputs(getState());
	dispatch(setLeverageSide(side));
	dispatch(editTradeSizeInput(nativeSizeString, 'native'));
};

export const debouncedPrepareCrossMarginTradePreview = debounce((dispatch) => {
	dispatch(prepareCrossMarginTradePreview());
}, 500);

export const debouncedPrepareIsolatedMarginTradePreview = debounce((dispatch) => {
	dispatch(prepareIsolatedMarginTradePreview());
}, 500);

export const editTradeOrderPrice = (price: string): AppThunk => (dispatch, getState) => {
	const rate = selectMarketAssetRate(getState());
	const orderType = selectOrderType(getState());
	const side = selectLeverageSide(getState());
	const inputs = selectCrossMarginTradeInputs(getState());
	dispatch(setCrossMarginOrderPrice(price));
	const invalidLabel = orderPriceInvalidLabel(price, side, rate, orderType);
	dispatch(setCrossMarginOrderPriceInvalidLabel(invalidLabel));
	if (!invalidLabel && price && inputs.susdSize) {
		// Recalc the trade
		dispatch(editCrossMarginSize(inputs.susdSizeString, 'usd'));
	}
};

export const fetchKeeperEthBalance = createAsyncThunk<string, void, ThunkConfig>(
	'futures/fetchKeeperEthBalance',
	async (_, { getState, extra: { sdk } }) => {
		const account = selectCrossMarginAccount(getState());
		if (!account) return '0';
		const bal = await sdk.futures.getCrossMarginKeeperBalance(account);
		return bal.toString();
	}
);

export const calculateCrossMarginFees = (): AppThunk => (dispatch, getState) => {
	const market = selectMarketInfo(getState());
	const orderType = selectOrderType(getState());
	const keeperBalance = selectKeeperEthBalance(getState());
	const settings = selectCrossMarginSettings(getState());
	const dynamicFeeRate = selectDynamicFeeRate(getState());
	const { susdSize, nativeSizeDelta } = selectCrossMarginTradeInputs(getState());

	const staticRate = computeMarketFee(market, nativeSizeDelta);
	const tradeFee = susdSize.mul(staticRate).add(susdSize.mul(dynamicFeeRate));

	const currentDeposit =
		orderType === 'limit' || orderType === 'stop market' ? keeperBalance : wei(0);
	const requiredDeposit = currentDeposit.lt(ORDER_KEEPER_ETH_DEPOSIT)
		? ORDER_KEEPER_ETH_DEPOSIT.sub(currentDeposit)
		: wei(0);

	const crossMarginFee = susdSize.mul(settings.tradeFee);
	const limitStopOrderFee = calculateCrossMarginFee(orderType, susdSize, settings);

	const fees = {
		staticFee: tradeFee.toString(),
		crossMarginFee: crossMarginFee.toString(),
		keeperEthDeposit: requiredDeposit.toString(),
		limitStopOrderFee: limitStopOrderFee.toString(),
		total: tradeFee.add(crossMarginFee).add(limitStopOrderFee).toString(),
	};
	dispatch(setCrossMarginFees(fees));
};

export const calculateIsolatedMarginFees = (): AppThunk => (dispatch, getState) => {
	const market = selectMarketInfo(getState());
	const dynamicFeeRate = selectDynamicFeeRate(getState());
	const { susdSize, nativeSizeDelta } = selectCrossMarginTradeInputs(getState());

	const staticRate = computeMarketFee(market, nativeSizeDelta);
	const tradeFee = susdSize.mul(staticRate).add(susdSize.mul(dynamicFeeRate));
	dispatch(setIsolatedMarginFee(tradeFee.toString()));
};

export const prepareCrossMarginTradePreview = createAsyncThunk<void, void, ThunkConfig>(
	'futures/prepareCrossMarginTradePreview',
	async (_, { getState, dispatch }) => {
		const tradeInputs = selectCrossMarginTradeInputs(getState());
		const assetPrice = selectMarketAssetRate(getState());
		const orderPrice = selectCrossMarginOrderPrice(getState());
		const marginDelta = selectCrossMarginMarginDelta(getState());

		try {
			dispatch(
				fetchCrossMarginTradePreview({
					price: orderPrice ? wei(orderPrice) : assetPrice,
					marginDelta: marginDelta,
					sizeDelta: tradeInputs.nativeSizeDelta,
				})
			);
		} catch (err) {
			dispatch(handleCrossMarginPreviewError(err.message));
		}
	}
);

export const prepareIsolatedMarginTradePreview = createAsyncThunk<void, void, ThunkConfig>(
	'futures/prepareIsolatedMarginTradePreview',
	async (_, { getState, dispatch }) => {
		const tradeInputs = selectIsolatedMarginTradeInputs(getState());
		dispatch(fetchIsolatedMarginTradePreview(tradeInputs.nativeSizeDelta));
	}
);

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
			dispatch(setOpenModal(null));
			dispatch(refetchPosition('isolated_margin'));
			dispatch(fetchBalances());
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
			dispatch(fetchBalances());
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
	async ({ sizeDelta, delayed, offchain }, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		const priceImpact = selectIsolatedPriceImpact(getState());
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
				wei(sizeDelta),
				priceImpact,
				{
					delayed,
					offchain,
					estimationOnly: false,
				}
			);
			dispatch(updateTransactionHash(tx.hash));
			await tx.wait();
			dispatch(refetchPosition('isolated_margin'));
			dispatch(setOpenModal(null));
			dispatch(clearTradeInputs());
			dispatch(fetchBalances());
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
	async ({ sizeDelta, delayed, offchain }, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		const priceImpact = selectIsolatedPriceImpact(getState());
		if (!marketInfo) throw new Error('Market info not found');
		estimateGasInteralAction(
			() =>
				sdk.futures.modifyIsolatedMarginPosition(marketInfo.market, wei(sizeDelta), priceImpact, {
					delayed,
					offchain,
					estimationOnly: true,
				}),
			'modify_isolated',
			{ getState, dispatch }
		);
	}
);

export const cancelDelayedOrder = createAsyncThunk<void, CancelDelayedOrderInputs, ThunkConfig>(
	'futures/cancelDelayedOrder',
	async ({ marketAddress, isOffchain }, { getState, dispatch, extra: { sdk } }) => {
		const account = selectFuturesAccount(getState());
		if (!account) throw new Error('No wallet connected');
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'cancelDelayed_isolated',
					hash: null,
				})
			);
			const tx = await sdk.futures.cancelDelayedOrder(marketAddress, account, isOffchain);
			dispatch(updateTransactionHash(tx.hash));
			await tx.wait();
			dispatch(fetchOpenOrders());
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const executeDelayedOrder = createAsyncThunk<void, string, ThunkConfig>(
	'futures/executeDelayedOrder',
	async (marketAddress, { getState, dispatch, extra: { sdk } }) => {
		const account = selectFuturesAccount(getState());
		if (!account) throw new Error('No wallet connected');
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'executeDelayed_isolated',
					hash: null,
				})
			);
			const tx = await sdk.futures.executeDelayedOrder(marketAddress, account);
			dispatch(updateTransactionHash(tx.hash));
			await tx.wait();
			dispatch(fetchOpenOrders());
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const closeIsolatedMarginPosition = createAsyncThunk<void, void, ThunkConfig>(
	'futures/closeIsolatedMarginPosition',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		const priceImpact = selectIsolatedPriceImpact(getState());
		if (!marketInfo) throw new Error('Market info not found');
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'close_isolated',
					hash: null,
				})
			);
			const tx = await sdk.futures.closeIsolatedPosition(marketInfo.market, priceImpact);
			dispatch(updateTransactionHash(tx.hash));
			await tx.wait();
			dispatch(refetchPosition('isolated_margin'));
			dispatch(setOpenModal(null));
			// TODO: More reliable balance updates
			setTimeout(() => dispatch(fetchBalances()), 1000);
			dispatch(fetchBalances());
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
					dispatch(setOpenModal(null));
					dispatch(refetchPosition('cross_margin'));
					dispatch(fetchBalances());
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
