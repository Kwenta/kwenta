import { createAsyncThunk } from '@reduxjs/toolkit';
import Wei, { wei } from '@synthetixio/wei';
import { BigNumber, ethers } from 'ethers';
import { debounce } from 'lodash';
import KwentaSDK from 'sdk';

import { notifyError } from 'components/ErrorView/ErrorNotifier';
import { ORDER_KEEPER_ETH_DEPOSIT } from 'constants/futures';
import { SL_TP_MAX_SIZE } from 'sdk/constants/futures';
import { ZERO_ADDRESS } from 'sdk/constants/global';
import { NetworkId } from 'sdk/types/common';
import { TransactionStatus } from 'sdk/types/common';
import {
	DelayedOrder,
	FuturesAccountType,
	FuturesMarket,
	ConditionalOrder,
	FuturesPosition,
	FuturesPositionHistory,
	FuturesPotentialTradeDetails,
	FuturesTrade,
	FuturesVolumes,
	MarginTransfer,
	OrderEnumByType,
	PositionSide,
	PotentialTradeStatus,
	SmartMarginOrderInputs,
	ConditionalOrderTypeEnum,
	sltpOrderInputs,
	FuturesMarketKey,
} from 'sdk/types/futures';
import {
	calculateCrossMarginFee,
	getTradeStatusMessage,
	serializePotentialTrade,
} from 'sdk/utils/futures';
import { unserializeGasPrice } from 'state/app/helpers';
import {
	handleTransactionError,
	setOpenModal,
	setShowPositionModal,
	setTransaction,
	updateTransactionHash,
	updateTransactionStatus,
} from 'state/app/reducer';
import { fetchBalances } from 'state/balances/actions';
import { ZERO_CM_FEES, ZERO_STATE_TRADE_INPUTS } from 'state/constants';
import { serializeWeiObject } from 'state/helpers';
import { selectLatestEthPrice } from 'state/prices/selectors';
import { AppDispatch, AppThunk, RootState } from 'state/store';
import { ThunkConfig } from 'state/types';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';
import { computeMarketFee, computeDelayedOrderFee } from 'utils/costCalculations';
import { floorNumber, stipZeros, zeroBN } from 'utils/formatters/number';
import {
	formatDelayedOrders,
	marketOverrides,
	orderPriceInvalidLabel,
	serializeCmBalanceInfo,
	serializeCrossMarginSettings,
	serializeDelayedOrders,
	serializeConditionalOrders,
	serializeFuturesVolumes,
	serializeMarkets,
	serializePositionHistory,
	serializeTrades,
} from 'utils/futures';
import logError from 'utils/logError';
import { getTransactionPrice } from 'utils/network';
import { refetchWithComparator } from 'utils/queries';

import {
	handleCrossMarginPreviewError,
	handleIsolatedMarginPreviewError,
	setCrossMarginAccount,
	setCrossMarginFees,
	setCrossMarginLeverageForAsset,
	setCrossMarginMarginDelta,
	setCrossMarginOrderCancelling,
	setCrossMarginOrderPrice,
	setCrossMarginOrderPriceInvalidLabel,
	setCrossMarginTradeInputs,
	setCrossMarginTradePreview,
	setIsolatedMarginFee,
	setLeverageInput,
	setIsolatedMarginTradeInputs,
	setIsolatedTradePreview,
	setLeverageSide,
	setOrderType,
	setTransactionEstimate,
	setCrossMarginEditPositionInputs,
	setIsolatedMarginEditPositionInputs,
	incrementIsolatedPreviewCount,
	incrementCrossPreviewCount,
	setClosePositionSizeDelta,
	setClosePositionPrice,
} from './reducer';
import {
	selectCrossMarginAccount,
	selectCrossMarginMarginDelta,
	selectCrossMarginOrderPrice,
	selectCrossMarginSettings,
	selectCrossMarginTradeFees,
	selectCrossMarginTradeInputs,
	selectFuturesAccount,
	selectFuturesSupportedNetwork,
	selectFuturesType,
	selectIsConditionalOrder,
	selectIsolatedMarginTradeInputs,
	selectKeeperEthBalance,
	selectLeverageSide,
	selectMarketPrice,
	selectMarketAsset,
	selectMarketInfo,
	selectMarketKey,
	selectMarkets,
	selectOrderType,
	selectOrderFeeCap,
	selectPosition,
	selectTradeSizeInputs,
	selectSkewAdjustedPrice,
	selectIdleMargin,
	selectSlTpTradeInputs,
	selectCrossMarginEditPosInputs,
	selectDesiredTradeFillPrice,
	selectCrossPreviewCount,
	selectTradePreview,
	selectEditPosDesiredFillPrice,
	selectClosePositionOrderInputs,
	selectFuturesPositions,
	selectEditPositionModalInfo,
	selectClosePosDesiredFillPrice,
	selectOpenDelayedOrders,
	selectPriceImpactOrDesiredFill,
} from './selectors';
import {
	AccountContext,
	CancelDelayedOrderInputs,
	CrossMarginBalanceInfo,
	CrossMarginSettings,
	DebouncedPreviewParams,
	DelayedOrderWithDetails,
	ExecuteDelayedOrderInputs,
	FuturesTransactionType,
	ModifyIsolatedPositionInputs,
	TradePreviewParams,
} from './types';

export const fetchMarkets = createAsyncThunk<
	{ markets: FuturesMarket<string>[] } | undefined,
	void,
	ThunkConfig
>('futures/fetchMarkets', async (_, { getState, extra: { sdk } }) => {
	const supportedNetwork = selectFuturesSupportedNetwork(getState());
	if (!supportedNetwork) return;
	try {
		const markets = await sdk.futures.getMarkets();
		// apply overrides
		const overrideMarkets = markets.map((m) => {
			return marketOverrides[m.marketKey]
				? {
						...m,
						...marketOverrides[m.marketKey],
				  }
				: m;
		});

		const serializedMarkets = serializeMarkets(overrideMarkets);
		return { markets: serializedMarkets };
	} catch (err) {
		logError(err);
		notifyError('Failed to fetch markets', err);
		throw err;
	}
});

export const fetchCrossMarginBalanceInfo = createAsyncThunk<
	{ balanceInfo: CrossMarginBalanceInfo<string>; account: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>(
	'futures/fetchCrossMarginBalanceInfo',
	async (_, { getState, extra: { sdk }, rejectWithValue }) => {
		const account = selectCrossMarginAccount(getState());
		const network = selectNetwork(getState());
		const wallet = selectWallet(getState());
		const crossMarginSupported = selectFuturesSupportedNetwork(getState());
		if (!account || !wallet || !crossMarginSupported) return;
		try {
			const balanceInfo = await sdk.futures.getCrossMarginBalanceInfo(wallet, account);
			return { balanceInfo: serializeCmBalanceInfo(balanceInfo), account, network };
		} catch (err) {
			logError(err);
			notifyError('Failed to fetch cross-margin balance info', err);
			rejectWithValue(err.message);
			return undefined;
		}
	}
);

export const fetchCrossMarginSettings = createAsyncThunk<
	CrossMarginSettings<string> | undefined,
	void,
	ThunkConfig
>('futures/fetchCrossMarginSettings', async (_, { getState, extra: { sdk } }) => {
	const supportedNetwork = selectFuturesSupportedNetwork(getState());
	if (!supportedNetwork) return;
	try {
		const settings = await sdk.futures.getCrossMarginSettings();
		return serializeCrossMarginSettings(settings);
	} catch (err) {
		logError(err);
		notifyError('Failed to fetch cross margin settings', err);
		throw err;
	}
});

export const fetchCrossMarginPositions = createAsyncThunk<
	{ positions: FuturesPosition<string>[]; account: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchCrossMarginPositions', async (_, { getState, extra: { sdk } }) => {
	const { futures } = getState();
	const account = selectCrossMarginAccount(getState());
	const supportedNetwork = selectFuturesSupportedNetwork(getState());
	const network = selectNetwork(getState());

	if (!account || !supportedNetwork) return;
	try {
		const positions = await sdk.futures.getFuturesPositions(
			account,
			futures.markets.map((m) => ({ asset: m.asset, marketKey: m.marketKey, address: m.market }))
		);
		const serializedPositions = positions.map(
			(p) => serializeWeiObject(p) as FuturesPosition<string>
		);
		return { positions: serializedPositions, account, network };
	} catch (err) {
		logError(err);
		notifyError('Failed to fetch cross-margin positions', err);
		throw err;
	}
});

export const fetchIsolatedMarginPositions = createAsyncThunk<
	{ positions: FuturesPosition<string>[]; wallet: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchIsolatedMarginPositions', async (_, { getState, extra: { sdk } }) => {
	const { wallet, futures } = getState();
	const supportedNetwork = selectFuturesSupportedNetwork(getState());
	const network = selectNetwork(getState());
	if (!wallet.walletAddress || !supportedNetwork) return;
	try {
		const positions = await sdk.futures.getFuturesPositions(
			wallet.walletAddress,
			futures.markets.map((m) => ({ asset: m.asset, marketKey: m.marketKey, address: m.market }))
		);
		return {
			positions: positions.map((p) => serializeWeiObject(p) as FuturesPosition<string>),
			wallet: wallet.walletAddress,
			network: network,
		};
	} catch (err) {
		logError(err);
		notifyError('Failed to fetch isolated margin positions', err);
		throw err;
	}
});

export const refetchPosition = createAsyncThunk<
	{
		position: FuturesPosition<string>;
		wallet: string;
		futuresType: FuturesAccountType;
		networkId: NetworkId;
	} | null,
	FuturesAccountType,
	ThunkConfig
>('futures/refetchPosition', async (type, { getState, extra: { sdk } }) => {
	const account = selectFuturesAccount(getState());
	if (!account) throw new Error('No wallet connected');
	const marketInfo = selectMarketInfo(getState());
	const networkId = selectNetwork(getState());
	const position = selectPosition(getState());
	if (!marketInfo || !position) throw new Error('Market or position not found');

	const result = await refetchWithComparator(
		() =>
			sdk.futures.getFuturesPositions(account!, [
				{ asset: marketInfo.asset, marketKey: marketInfo.marketKey, address: marketInfo.market },
			]),
		position?.remainingMargin?.toString(),
		(existing, next) => {
			return existing === next[0]?.remainingMargin.toString();
		}
	);

	if (result.data[0]) {
		const serialized = serializeWeiObject(result.data[0] as FuturesPosition) as FuturesPosition<
			string
		>;
		return { position: serialized, wallet: account, futuresType: type, networkId };
	}
	return null;
});

export const fetchCrossMarginAccount = createAsyncThunk<
	{ account: string; wallet: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchCrossMarginAccount', async (_, { getState, extra: { sdk }, rejectWithValue }) => {
	const wallet = selectWallet(getState());
	const supportedNetwork = selectFuturesSupportedNetwork(getState());
	const network = selectNetwork(getState());
	if (!wallet || !supportedNetwork) return undefined;
	const accounts = getState().futures.crossMargin.accounts;

	// Already have an accoutn fetched and persisted for this address
	if (accounts[network][wallet]) return;

	try {
		const accounts = await sdk.futures.getCrossMarginAccounts(wallet);
		const account = accounts[0];
		if (account) return { account, wallet, network };
		return undefined;
	} catch (err) {
		notifyError('Failed to fetch cross margin account', err);
		rejectWithValue(err.message);
	}
});

export const fetchDailyVolumes = createAsyncThunk<FuturesVolumes<string>, void, ThunkConfig>(
	'futures/fetchDailyVolumes',
	async (_, { extra: { sdk } }) => {
		const volumes = await sdk.futures.getDailyVolumes();
		return serializeFuturesVolumes(volumes);
	}
);

export const fetchMarginTransfers = createAsyncThunk<
	| {
			marginTransfers: MarginTransfer[];
			context: AccountContext;
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchMarginTransfers', async (_, { getState, extra: { sdk } }) => {
	const { wallet, futures } = getState();
	const supportedNetwork = selectFuturesSupportedNetwork(getState());
	const network = selectNetwork(getState());
	const cmAccount = selectCrossMarginAccount(getState());
	if (!wallet.walletAddress || !supportedNetwork) return;
	try {
		const transfers =
			futures.selectedType === 'cross_margin'
				? await sdk.futures.getCrossMarginTransfers(cmAccount)
				: await sdk.futures.getIsolatedMarginTransfers();

		return {
			marginTransfers: transfers,
			context: {
				wallet: wallet.walletAddress,
				network: network,
				type: futures.selectedType,
				cmAccount,
			},
		};
	} catch (err) {
		logError(err);
		notifyError('Failed to fetch margin transfers', err);
		throw err;
	}
});

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
		await dispatch(fetchMarkets());
		dispatch(fetchDailyVolumes());
	}
);

export const fetchIsolatedOpenOrders = createAsyncThunk<
	{ orders: DelayedOrderWithDetails<string>[]; wallet: string; networkId: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchIsolatedOpenOrders', async (_, { dispatch, getState, extra: { sdk } }) => {
	const wallet = selectWallet(getState());
	const supportedNetwork = selectFuturesSupportedNetwork(getState());
	const network = selectNetwork(getState());
	const markets = selectMarkets(getState());
	const existingOrders = selectOpenDelayedOrders(getState());
	if (!wallet || !supportedNetwork || !markets.length) return;

	const marketAddresses = markets.map((market) => market.market);

	const orders: DelayedOrder[] = await sdk.futures.getDelayedOrders(wallet, marketAddresses);
	const nonzeroOrders = formatDelayedOrders(orders, markets);
	const orderDropped = existingOrders.length > nonzeroOrders.length;
	if (orderDropped) {
		dispatch(fetchIsolatedMarginPositions());
	}

	return {
		networkId: network,
		orders: serializeDelayedOrders(nonzeroOrders),
		wallet: wallet,
	};
});

export const fetchCrossMarginOpenOrders = createAsyncThunk<
	| {
			conditionalOrders: ConditionalOrder<string>[];
			delayedOrders: DelayedOrderWithDetails<string>[];
			account: string;
			network: NetworkId;
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchCrossMarginOpenOrders', async (_, { getState, extra: { sdk } }) => {
	const account = selectCrossMarginAccount(getState());
	const supportedNetwork = selectFuturesSupportedNetwork(getState());
	const network = selectNetwork(getState());
	const markets = selectMarkets(getState());

	const marketAddresses = markets.map((market) => market.market);

	if (!account || !supportedNetwork) return;
	try {
		const orders = await sdk.futures.getConditionalOrders(account);
		const delayedOrders = await sdk.futures.getDelayedOrders(account, marketAddresses);
		const nonzeroOrders = formatDelayedOrders(delayedOrders, markets);

		return {
			account,
			network,
			delayedOrders: serializeDelayedOrders(nonzeroOrders),
			conditionalOrders: serializeConditionalOrders(orders),
		};
	} catch (err) {
		notifyError('Failed to fetch open orders', err);
		logError(err);
		throw err;
	}
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
		const price = selectMarketPrice(getState());
		const skewAdjustedPrice = selectSkewAdjustedPrice(getState());
		const orderType = selectOrderType(getState());

		const orderTypeNum = OrderEnumByType[orderType];
		if (!account) throw new Error('No account to fetch orders');
		if (!marketInfo) throw new Error('No market info');
		const leverageSide = selectLeverageSide(getState());
		try {
			const preview = await sdk.futures.getIsolatedTradePreview(marketInfo?.market, orderTypeNum, {
				sizeDelta,
				price,
				skewAdjustedPrice,
				leverageSide,
			});
			return serializePotentialTrade({ ...preview, marketKey: marketInfo.marketKey });
		} catch (err) {
			notifyError('Failed to generate trade preview', err);
			dispatch(handleIsolatedMarginPreviewError(err.message));
			throw err;
		}
	}
);

export const fetchCrossMarginTradePreview = createAsyncThunk<
	FuturesPotentialTradeDetails<string> | null,
	DebouncedPreviewParams,
	ThunkConfig
>(
	'futures/fetchCrossMarginTradePreview',
	async (params, { dispatch, getState, extra: { sdk } }) => {
		const account = selectFuturesAccount(getState());
		const freeMargin = selectIdleMargin(getState());
		const positions = selectFuturesPositions(getState());
		const position = positions.find((p) => p.marketKey === params.market.key);

		const marketMargin = position?.remainingMargin ?? wei(0);

		if (
			// Require both size and margin for a trade
			(params.action === 'trade' && (params.sizeDelta.eq(0) || params.marginDelta.eq(0))) ||
			// Require one or the other when editing a position
			(params.sizeDelta.eq(0) && params.marginDelta.eq(0))
		) {
			return null;
		}

		// If this is a trade with no existsing position size then we need to subtract
		// remaining idle market margin to get an accurate previw
		const marginDelta =
			position?.position?.size.abs().eq(0) && marketMargin.gt(0)
				? params.marginDelta.sub(marketMargin)
				: params.marginDelta;

		try {
			const leverageSide = selectLeverageSide(getState());
			const preview = await sdk.futures.getCrossMarginTradePreview(
				account || ZERO_ADDRESS,
				params.market.key,
				params.market.address,
				{ ...params, leverageSide, marginDelta }
			);

			// Check the preview hasn't been cleared before query resolves
			const count = selectCrossPreviewCount(getState());
			if (count !== params.debounceCount) {
				const existing = selectTradePreview(getState());
				return existing ? serializePotentialTrade(existing) : null;
			}

			if (params.marginDelta.gt(freeMargin) && preview.status === 0) {
				// Show insufficient margin message
				preview.status = PotentialTradeStatus.INSUFFICIENT_FREE_MARGIN;
				preview.statusMessage = getTradeStatusMessage(
					PotentialTradeStatus.INSUFFICIENT_FREE_MARGIN
				);
				preview.showStatus = true;
			}
			return serializePotentialTrade({ ...preview, marketKey: params.market.key });
		} catch (err) {
			notifyError('Failed to generate trade preview', err);
			dispatch(handleCrossMarginPreviewError(err.message));
			return null;
		}
	}
);

export const clearTradeInputs = createAsyncThunk<void, void, ThunkConfig>(
	'futures/clearTradeInputs',
	async (_, { dispatch }) => {
		dispatch(setCrossMarginMarginDelta(''));
		dispatch(setCrossMarginFees(ZERO_CM_FEES));
		dispatch(setIsolatedMarginFee('0'));
		dispatch(setLeverageInput(''));
		dispatch(setIsolatedTradePreview(null));
		dispatch(setCrossMarginTradePreview(null));
		dispatch(setCrossMarginTradeInputs(ZERO_STATE_TRADE_INPUTS));
		dispatch(setIsolatedMarginTradeInputs(ZERO_STATE_TRADE_INPUTS));
		dispatch(setCrossMarginEditPositionInputs({ nativeSizeDelta: '', marginDelta: '' }));
		dispatch(setIsolatedMarginEditPositionInputs({ nativeSizeDelta: '', marginDelta: '' }));
	}
);

export const editCrossMarginMarginDelta = (marginDelta: string): AppThunk => (
	dispatch,
	getState
) => {
	const orderPrice = selectMarketPrice(getState());
	const marketInfo = selectMarketInfo(getState());
	const { susdSize, nativeSizeDelta } = selectCrossMarginTradeInputs(getState());

	if (!marketInfo) throw new Error('No market selected');
	if (!marginDelta || Number(marginDelta) === 0) {
		dispatch(setCrossMarginMarginDelta(marginDelta));
		dispatch(setCrossMarginTradePreview(null));
		return;
	}

	const marginDelatWei = wei(marginDelta);
	const leverage = wei(susdSize).div(marginDelatWei.abs());

	dispatch(setCrossMarginMarginDelta(marginDelta));
	if (!leverage.eq(0)) {
		dispatch(setLeverageInput(leverage.toString(2)));
	}
	dispatch(
		stageCrossMarginTradePreview({
			market: { key: marketInfo.marketKey, address: marketInfo.market },
			orderPrice,
			marginDelta: wei(marginDelta || 0),
			sizeDelta: nativeSizeDelta,
			action: 'edit_position',
		})
	);
};

export const editCrossMarginTradeSize = (
	size: string,
	currencyType: 'usd' | 'native'
): AppThunk => (dispatch, getState) => {
	const assetRate = selectMarketPrice(getState());
	const marginDelta = selectCrossMarginMarginDelta(getState());
	const orderPrice = selectCrossMarginOrderPrice(getState());
	const isConditionalOrder = selectIsConditionalOrder(getState());
	const tradeSide = selectLeverageSide(getState());
	const marketInfo = selectMarketInfo(getState());
	const price = isConditionalOrder && Number(orderPrice) > 0 ? wei(orderPrice) : assetRate;

	if (!marketInfo) throw new Error('No market selected');

	if (size === '' || assetRate.eq(0)) {
		dispatch(setCrossMarginTradeInputs(ZERO_STATE_TRADE_INPUTS));
		dispatch(setCrossMarginTradePreview(null));
		dispatch(setLeverageInput(''));
		return;
	}

	const nativeSize =
		currencyType === 'native' ? size : String(floorNumber(wei(size).div(price), 4));
	const usdSize = currencyType === 'native' ? String(floorNumber(price.mul(size), 4)) : size;
	const leverage = marginDelta?.gt(0) ? wei(usdSize).div(marginDelta.abs()) : '0';
	const sizeDeltaWei =
		tradeSide === PositionSide.LONG ? wei(nativeSize || 0) : wei(nativeSize || 0).neg();
	dispatch(
		setCrossMarginTradeInputs({
			susdSize: usdSize,
			nativeSize: nativeSize,
		})
	);
	dispatch(setLeverageInput(leverage.toString(2)));
	dispatch(
		stageCrossMarginTradePreview({
			market: {
				key: marketInfo.marketKey,
				address: marketInfo.market,
			},
			orderPrice: price,
			marginDelta: wei(marginDelta),
			sizeDelta: sizeDeltaWei,
			action: 'trade',
		})
	);
};

export const editCrossMarginPositionSize = (
	marketKey: FuturesMarketKey,
	nativeSizeDelta: string
): AppThunk => (dispatch, getState) => {
	dispatch(
		setCrossMarginEditPositionInputs({
			marginDelta: '',
			nativeSizeDelta: nativeSizeDelta,
		})
	);
	try {
		const market = getMarketDetailsByKey(getState, marketKey);
		dispatch(
			stageCrossMarginTradePreview({
				market,
				marginDelta: zeroBN,
				sizeDelta: wei(nativeSizeDelta || 0),
				action: 'edit_position',
			})
		);
	} catch (err) {
		dispatch(handleCrossMarginPreviewError(err.message));
	}
};

export const editClosePositionSizeDelta = (
	marketKey: FuturesMarketKey,
	nativeSizeDelta: string
): AppThunk => (dispatch, getState) => {
	dispatch(setClosePositionSizeDelta(nativeSizeDelta));
	const { price } = selectClosePositionOrderInputs(getState());
	try {
		const market = getMarketDetailsByKey(getState, marketKey);
		dispatch(
			stageCrossMarginTradePreview({
				market,
				orderPrice: isNaN(Number(price)) || !price ? undefined : wei(price),
				marginDelta: zeroBN,
				sizeDelta: wei(nativeSizeDelta || 0),
				action: 'edit_position',
			})
		);
	} catch (err) {
		dispatch(handleCrossMarginPreviewError(err.message));
	}
};

export const editClosePositionPrice = (marketKey: FuturesMarketKey, price: string): AppThunk => (
	dispatch,
	getState
) => {
	const { nativeSizeDelta, orderType } = selectClosePositionOrderInputs(getState());
	const marketPrice = selectMarketPrice(getState());
	const { position } = selectEditPositionModalInfo(getState());
	const closeTradeSide =
		position?.position?.side === PositionSide.SHORT ? PositionSide.LONG : PositionSide.SHORT;
	const invalidLabel = orderPriceInvalidLabel(price || '0', closeTradeSide, marketPrice, orderType);

	dispatch(setClosePositionPrice({ value: price, invalidLabel }));

	try {
		const marketInfo = getMarketDetailsByKey(getState, marketKey);
		dispatch(
			stageCrossMarginTradePreview({
				market: marketInfo,
				orderPrice: isNaN(Number(price)) || !price ? undefined : wei(price),
				marginDelta: zeroBN,
				sizeDelta: wei(nativeSizeDelta || 0),
				action: 'edit_position',
			})
		);
	} catch (err) {
		dispatch(handleCrossMarginPreviewError(err.message));
	}
};

export const editCrossMarginPositionMargin = (
	marketKey: FuturesMarketKey,
	marginDelta: string
): AppThunk => (dispatch, getState) => {
	dispatch(
		setCrossMarginEditPositionInputs({
			marginDelta: marginDelta,
			nativeSizeDelta: '',
		})
	);
	try {
		const market = getMarketDetailsByKey(getState, marketKey);

		dispatch(
			stageCrossMarginTradePreview({
				market,
				marginDelta: wei(marginDelta || 0),
				sizeDelta: zeroBN,
				action: 'edit_position',
			})
		);
	} catch (err) {
		dispatch(handleCrossMarginPreviewError(err.message));
	}
};

const stageCrossMarginTradePreview = createAsyncThunk<void, TradePreviewParams, ThunkConfig>(
	'futures/stageCrossMarginPositionChange',
	async (inputs, { dispatch, getState }) => {
		dispatch(calculateCrossMarginFees());
		dispatch(incrementCrossPreviewCount());
		const debounceCount = selectCrossPreviewCount(getState());
		debouncedPrepareCrossMarginTradePreview(dispatch, { ...inputs, debounceCount });
	}
);

export const editIsolatedMarginSize = (size: string, currencyType: 'usd' | 'native'): AppThunk => (
	dispatch,
	getState
) => {
	const assetRate = selectMarketPrice(getState());
	const position = selectPosition(getState());
	if (
		size === '' ||
		assetRate.eq(0) ||
		!position?.remainingMargin ||
		position?.remainingMargin.eq(0)
	) {
		dispatch(setIsolatedMarginTradeInputs(ZERO_STATE_TRADE_INPUTS));
		dispatch(setIsolatedTradePreview(null));
		dispatch(setLeverageInput(''));
		return;
	}

	const nativeSize = currencyType === 'native' ? size : wei(size).div(assetRate).toString();
	const usdSize = currencyType === 'native' ? stipZeros(assetRate.mul(size).toString()) : size;
	const leverage =
		Number(usdSize) > 0 && position?.remainingMargin.gt(0)
			? wei(usdSize).div(position?.remainingMargin).toString(2)
			: '';

	dispatch(setLeverageInput(leverage));
	dispatch(
		setIsolatedMarginTradeInputs({
			susdSize: usdSize,
			nativeSize: nativeSize,
		})
	);
	dispatch(calculateIsolatedMarginFees());
	dispatch(incrementIsolatedPreviewCount());
	debouncedPrepareIsolatedMarginTradePreview(dispatch);
};

export const editTradeSizeInput = (size: string, currencyType: 'usd' | 'native'): AppThunk => (
	dispatch,
	getState
) => {
	const type = selectFuturesType(getState());
	if (type === 'cross_margin') {
		dispatch(editCrossMarginTradeSize(size, currencyType));
	} else {
		dispatch(editIsolatedMarginSize(size, currencyType));
	}
};

export const changeLeverageSide = (side: PositionSide): AppThunk => (dispatch, getState) => {
	const { nativeSizeString } = selectTradeSizeInputs(getState());
	dispatch(setLeverageSide(side));
	dispatch(editTradeSizeInput(nativeSizeString, 'native'));
};

export const setCrossMarginLeverage = (leverage: string): AppThunk => (dispatch, getState) => {
	const marketKey = selectMarketKey(getState());
	dispatch(setCrossMarginLeverageForAsset({ marketKey: marketKey, leverage: leverage }));
};

export const debouncedPrepareCrossMarginTradePreview = debounce(
	(dispatch, inputs: DebouncedPreviewParams) => {
		dispatch(fetchCrossMarginTradePreview(inputs));
	},
	500
);

export const debouncedPrepareIsolatedMarginTradePreview = debounce((dispatch) => {
	dispatch(prepareIsolatedMarginTradePreview());
}, 500);

export const editTradeOrderPrice = (price: string): AppThunk => (dispatch, getState) => {
	const rate = selectMarketPrice(getState());
	const orderType = selectOrderType(getState());
	const side = selectLeverageSide(getState());
	const inputs = selectCrossMarginTradeInputs(getState());
	dispatch(setCrossMarginOrderPrice(price));
	const invalidLabel = orderPriceInvalidLabel(price, side, rate, orderType);
	dispatch(setCrossMarginOrderPriceInvalidLabel(invalidLabel));
	if (!invalidLabel && price && inputs.susdSize) {
		// Recalc the trade
		dispatch(editCrossMarginTradeSize(inputs.susdSizeString, 'usd'));
	}
};

export const fetchKeeperEthBalance = createAsyncThunk<
	{ balance: string; account: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchKeeperEthBalance', async (_, { getState, extra: { sdk } }) => {
	const account = selectCrossMarginAccount(getState());
	const network = selectNetwork(getState());
	if (!account) return;
	const bal = await sdk.futures.getCrossMarginKeeperBalance(account);
	return { balance: bal.toString(), account, network };
});

export const fetchFuturesPositionHistory = createAsyncThunk<
	| {
			accountType: FuturesAccountType;
			history: FuturesPositionHistory<string>[];
			account: string;
			wallet: string;
			networkId: NetworkId;
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchFuturesPositionHistory', async (_, { getState, extra: { sdk } }) => {
	try {
		const account = selectFuturesAccount(getState());
		const accountType = selectFuturesType(getState());
		const networkId = selectNetwork(getState());
		const wallet = selectWallet(getState());
		const futuresSupported = selectFuturesSupportedNetwork(getState());
		if (!wallet || !account || !futuresSupported) return;
		const history = await sdk.futures.getPositionHistory(wallet);
		return { accountType, account, wallet, networkId, history: serializePositionHistory(history) };
	} catch (err) {
		notifyError('Failed to fetch position history', err);
		throw err;
	}
});

export const fetchPositionHistoryForTrader = createAsyncThunk<
	{ history: FuturesPositionHistory<string>[]; address: string; networkId: NetworkId } | undefined,
	string,
	ThunkConfig
>('futures/fetchPositionHistoryForTrader', async (traderAddress, { getState, extra: { sdk } }) => {
	try {
		const networkId = selectNetwork(getState());
		const futuresSupported = selectFuturesSupportedNetwork(getState());
		if (!futuresSupported) return;
		const history = await sdk.futures.getPositionHistory(traderAddress);
		return { history: serializePositionHistory(history), networkId, address: traderAddress };
	} catch (err) {
		notifyError('Failed to fetch history for trader ' + traderAddress, err);
		throw err;
	}
});

export const fetchTradesForSelectedMarket = createAsyncThunk<
	| {
			trades: FuturesTrade<string>[];
			account: string;
			wallet: string;
			networkId: NetworkId;
			accountType: FuturesAccountType;
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchTradesForSelectedMarket', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState());
		const networkId = selectNetwork(getState());
		const marketAsset = selectMarketAsset(getState());
		const accountType = selectFuturesType(getState());
		const account = selectFuturesAccount(getState());
		const futuresSupported = selectFuturesSupportedNetwork(getState());

		if (!futuresSupported || !wallet || !account) return;
		const trades = await sdk.futures.getTradesForMarket(marketAsset, wallet, accountType);
		return { trades: serializeTrades(trades), networkId, account, accountType, wallet };
	} catch (err) {
		notifyError('Failed to fetch futures trades for selected market', err);
		throw err;
	}
});

export const fetchAllTradesForAccount = createAsyncThunk<
	| {
			trades: FuturesTrade<string>[];
			account: string;
			wallet: string;
			networkId: NetworkId;
			accountType: FuturesAccountType;
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchAllTradesForAccount', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState());
		const networkId = selectNetwork(getState());
		const accountType = selectFuturesType(getState());
		const account = selectFuturesAccount(getState());
		const futuresSupported = selectFuturesSupportedNetwork(getState());
		if (!futuresSupported || !wallet || !account) return;
		const trades = await sdk.futures.getAllTrades(wallet, accountType, 10000);
		return { trades: serializeTrades(trades), networkId, account, accountType, wallet };
	} catch (err) {
		notifyError('Failed to fetch futures trades', err);
		throw err;
	}
});

export const calculateCrossMarginFees = (): AppThunk => (dispatch, getState) => {
	const market = selectMarketInfo(getState());
	const orderType = selectOrderType(getState());
	const keeperBalance = selectKeeperEthBalance(getState());
	const settings = selectCrossMarginSettings(getState());

	const { susdSize, susdSizeDelta } = selectCrossMarginTradeInputs(getState());

	const { delayedOrderFee } = computeDelayedOrderFee(market, susdSizeDelta, true);

	const currentDeposit =
		orderType === 'limit' || orderType === 'stop_market' ? keeperBalance : wei(0);
	const requiredDeposit = currentDeposit.lt(ORDER_KEEPER_ETH_DEPOSIT)
		? ORDER_KEEPER_ETH_DEPOSIT.sub(currentDeposit)
		: wei(0);

	const crossMarginFee = susdSize.mul(settings.fees.base);
	const limitStopOrderFee = calculateCrossMarginFee(orderType, susdSize, settings);

	const fees = {
		staticFee: delayedOrderFee.toString(),
		crossMarginFee: crossMarginFee.toString(),
		keeperEthDeposit: requiredDeposit.toString(),
		limitStopOrderFee: limitStopOrderFee.toString(),
		total: delayedOrderFee.add(crossMarginFee).add(limitStopOrderFee).toString(),
	};
	dispatch(setCrossMarginFees(fees));
};

export const calculateIsolatedMarginFees = (): AppThunk => (dispatch, getState) => {
	const market = selectMarketInfo(getState());
	const { susdSize, susdSizeDelta } = selectIsolatedMarginTradeInputs(getState());
	const staticRate = computeMarketFee(market, susdSizeDelta);
	const tradeFee = susdSize.mul(staticRate);
	dispatch(setIsolatedMarginFee(tradeFee.toString()));
};

export const prepareIsolatedMarginTradePreview = createAsyncThunk<void, void, ThunkConfig>(
	'futures/prepareIsolatedMarginTradePreview',
	async (_, { getState, dispatch }) => {
		const tradeInputs = selectIsolatedMarginTradeInputs(getState());
		dispatch(fetchIsolatedMarginTradePreview(tradeInputs.nativeSizeDelta));
	}
);

export const getClosePositionOrderFee = createAsyncThunk<string, void, ThunkConfig>(
	'futures/getClosePositionOrderFee',
	async (_, { getState, extra: { sdk } }) => {
		const state = getState();
		const position = selectPosition(state);
		const marketInfo = selectMarketInfo(state);
		try {
			if (!marketInfo) {
				throw new Error('No market found');
			} else if (!position?.position) {
				throw new Error('No active position in selected market');
			} else {
				const fee = await sdk.futures.getOrderFee(marketInfo.market, position.position.size.neg());
				return fee.toString();
			}
		} catch (err) {
			notifyError('Failed to get order fee', err);
			throw err;
		}
	}
);

// Contract Mutations

export const createCrossMarginAccount = createAsyncThunk<
	{ account: string; wallet: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>(
	'futures/createCrossMarginAccount',
	async (_, { getState, dispatch, extra: { sdk }, rejectWithValue }) => {
		const wallet = selectWallet(getState());
		const supportedNetwork = selectFuturesSupportedNetwork(getState());
		const network = selectNetwork(getState());
		if (!wallet || !supportedNetwork) return undefined;
		const accounts = getState().futures.crossMargin.accounts;

		// Already have an accoutn fetched and persisted for this address
		if (accounts[network][wallet]) {
			notifyError('There is already an account associated with this wallet');
			rejectWithValue('Account already created');
		}

		try {
			const accounts = await sdk.futures.getCrossMarginAccounts();
			// Check for existing account on the contract as only one account per user
			if (accounts[0]) {
				dispatch(setCrossMarginAccount({ account: accounts[0], wallet: wallet, network }));
				return;
			}

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'create_cross_margin_account',
					hash: null,
				})
			);
			const tx = await sdk.futures.createCrossMarginAccount();
			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(fetchCrossMarginAccount());
		} catch (err) {
			dispatch(handleTransactionError(err.message));
		}
	}
);

export const depositCrossMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/depositCrossMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const account = selectCrossMarginAccount(getState());
		if (!account) {
			notifyError('No cross margin account');
			return;
		}
		await submitCMTransferTransaction(dispatch, sdk, 'deposit_cross_margin', account, amount);
	}
);

export const withdrawCrossMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/withdrawCrossMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const account = selectCrossMarginAccount(getState());
		if (!account) {
			notifyError('No cross margin account');
			return;
		}
		await submitCMTransferTransaction(dispatch, sdk, 'withdraw_cross_margin', account, amount);
	}
);

export const approveCrossMargin = createAsyncThunk<void, void, ThunkConfig>(
	'futures/approveCrossMargin',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const account = selectCrossMarginAccount(getState());
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
			await monitorAndAwaitTransaction(dispatch, tx);
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
			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(setOpenModal(null));
			dispatch(refetchPosition('isolated_margin'));
			dispatch(fetchBalances());
			dispatch(fetchMarginTransfers());
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
			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(refetchPosition('isolated_margin'));
			dispatch(setOpenModal(null));
			dispatch(fetchBalances());
			dispatch(fetchMarginTransfers());
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
	async ({ delayed, offchain }, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		const { nativeSizeDelta } = selectTradeSizeInputs(getState());

		// TODO: Change to desired fill when mainnet changes deployed
		const priceImpactOrDesiredFill = selectPriceImpactOrDesiredFill(getState());
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
				wei(nativeSizeDelta),
				priceImpactOrDesiredFill,
				{
					delayed,
					offchain,
					estimationOnly: false,
				}
			);
			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(fetchIsolatedOpenOrders());
			dispatch(refetchPosition('isolated_margin'));
			dispatch(setOrderType('delayed_offchain'));
			dispatch(setOpenModal(null));
			dispatch(clearTradeInputs());
			dispatch(fetchBalances());
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
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
					type: 'cancel_delayed_isolated',
					hash: null,
				})
			);
			const tx = await sdk.futures.cancelDelayedOrder(marketAddress, account, isOffchain);
			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(fetchIsolatedOpenOrders());
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const executeDelayedOrder = createAsyncThunk<void, ExecuteDelayedOrderInputs, ThunkConfig>(
	'futures/executeDelayedOrder',
	async ({ marketKey, marketAddress, isOffchain }, { getState, dispatch, extra: { sdk } }) => {
		const account = selectFuturesAccount(getState());
		if (!account) throw new Error('No wallet connected');
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'execute_delayed_isolated',
					hash: null,
				})
			);
			const tx = isOffchain
				? await sdk.futures.executeDelayedOffchainOrder(marketKey, marketAddress, account)
				: await sdk.futures.executeDelayedOrder(marketAddress, account);
			dispatch(updateTransactionHash(tx.hash));
			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(fetchIsolatedOpenOrders());
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
		const priceImpactOrDesiredFill = selectPriceImpactOrDesiredFill(getState());
		if (!marketInfo) throw new Error('Market info not found');
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'close_isolated',
					hash: null,
				})
			);
			const tx = await sdk.futures.closeIsolatedPosition(
				marketInfo.market,
				priceImpactOrDesiredFill
			);
			await monitorAndAwaitTransaction(dispatch, tx);
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

export const submitCrossMarginOrder = createAsyncThunk<void, void, ThunkConfig>(
	'futures/submitCrossMarginOrder',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		const account = selectCrossMarginAccount(getState());
		const tradeInputs = selectCrossMarginTradeInputs(getState());
		const marginDelta = selectCrossMarginMarginDelta(getState());
		const feeCap = selectOrderFeeCap(getState());
		const orderType = selectOrderType(getState());
		const orderPrice = selectCrossMarginOrderPrice(getState());
		const { keeperEthDeposit } = selectCrossMarginTradeFees(getState());
		const desiredFillPrice = selectDesiredTradeFillPrice(getState());
		const wallet = selectWallet(getState());
		const { stopLossPrice, takeProfitPrice } = selectSlTpTradeInputs(getState());

		try {
			if (!marketInfo) throw new Error('Market info not found');
			if (!account) throw new Error('No cross margin account found');
			if (!wallet) throw new Error('No wallet connected');

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'submit_cross_order',
					hash: null,
				})
			);

			const orderInputs: SmartMarginOrderInputs = {
				sizeDelta: tradeInputs.nativeSizeDelta,
				marginDelta: marginDelta,
				desiredFillPrice: desiredFillPrice,
			};

			// To separate Stop Loss and Take Profit from other limit / stop orders
			// we set the size to max big num value.

			if (Number(stopLossPrice) > 0) {
				orderInputs.stopLoss = {
					price: wei(stopLossPrice),
					sizeDelta: tradeInputs.nativeSizeDelta.gt(0) ? SL_TP_MAX_SIZE.neg() : SL_TP_MAX_SIZE,
				};
			}

			if (Number(takeProfitPrice) > 0) {
				orderInputs.takeProfit = {
					price: wei(takeProfitPrice),
					sizeDelta: tradeInputs.nativeSizeDelta.gt(0) ? SL_TP_MAX_SIZE.neg() : SL_TP_MAX_SIZE,
				};
			}

			if (orderType !== 'market') {
				orderInputs['conditionalOrderInputs'] = {
					orderType:
						orderType === 'limit' ? ConditionalOrderTypeEnum.LIMIT : ConditionalOrderTypeEnum.STOP,
					keeperEthDeposit,
					feeCap,
					price: wei(orderPrice || '0'),
					reduceOnly: false,
				};
			}

			const tx = await sdk.futures.submitCrossMarginOrder(
				{ address: marketInfo.market, key: marketInfo.marketKey },
				wallet,
				account,
				orderInputs
			);
			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(setOpenModal(null));
			dispatch(refetchPosition('cross_margin'));
			dispatch(fetchBalances());
			dispatch(clearTradeInputs());
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const submitCrossMarginAdjustMargin = createAsyncThunk<void, void, ThunkConfig>(
	'futures/submitCrossMarginAdjustMargin',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const { market } = selectEditPositionModalInfo(getState());
		const account = selectCrossMarginAccount(getState());
		const { marginDelta } = selectCrossMarginEditPosInputs(getState());

		try {
			if (!market) throw new Error('Market info not found');
			if (!account) throw new Error('No cross margin account found');
			if (!marginDelta || marginDelta === '') throw new Error('No margin amount set');

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'submit_cross_order',
					hash: null,
				})
			);

			const tx = await sdk.futures.modifySmartMarginMarketMargin(
				account,
				market.market,
				wei(marginDelta)
			);
			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(setOpenModal(null));
			dispatch(refetchPosition('cross_margin'));
			dispatch(fetchBalances());
			dispatch(clearTradeInputs());
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const submitCrossMarginAdjustPositionSize = createAsyncThunk<void, void, ThunkConfig>(
	'futures/submitCrossMarginAdjustPositionSize',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const { market } = selectEditPositionModalInfo(getState());
		const account = selectCrossMarginAccount(getState());
		const desiredFillPrice = selectEditPosDesiredFillPrice(getState());
		const { nativeSizeDelta } = selectCrossMarginEditPosInputs(getState());

		try {
			if (!market) throw new Error('Market info not found');
			if (!account) throw new Error('No cross margin account found');
			if (!nativeSizeDelta || nativeSizeDelta === '') throw new Error('No margin amount set');

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'submit_cross_order',
					hash: null,
				})
			);

			const tx = await sdk.futures.modifySmartMarginPositionSize(
				account,
				market.market,
				wei(nativeSizeDelta),
				desiredFillPrice
			);
			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(setOpenModal(null));
			dispatch(refetchPosition('cross_margin'));
			dispatch(fetchBalances());
			dispatch(clearTradeInputs());
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const submitSmartMarginReducePositionOrder = createAsyncThunk<void, void, ThunkConfig>(
	'futures/submitSmartMarginReducePositionOrder',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const { market } = selectEditPositionModalInfo(getState());
		const account = selectCrossMarginAccount(getState());
		const desiredFillPrice = selectDesiredTradeFillPrice(getState());
		const { nativeSizeDelta, orderType, price } = selectClosePositionOrderInputs(getState());
		const { keeperEthDeposit } = selectCrossMarginTradeFees(getState());
		const feeCap = selectOrderFeeCap(getState());
		const wallet = selectWallet(getState());

		try {
			if (!market) throw new Error('Market info not found');
			if (!wallet) throw new Error('No wallet connected');
			if (!account) throw new Error('No cross margin account found');
			if (!nativeSizeDelta || nativeSizeDelta === '') throw new Error('No margin amount set');

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'submit_cross_order',
					hash: null,
				})
			);

			const orderInputs: SmartMarginOrderInputs = {
				sizeDelta: wei(nativeSizeDelta),
				marginDelta: wei(0),
				desiredFillPrice: desiredFillPrice,
			};

			if (orderType !== 'market') {
				orderInputs['conditionalOrderInputs'] = {
					orderType:
						orderType === 'limit' ? ConditionalOrderTypeEnum.LIMIT : ConditionalOrderTypeEnum.STOP,
					keeperEthDeposit,
					feeCap,
					price: wei(price?.value || '0'),
					reduceOnly: true,
				};
			}

			const tx = await sdk.futures.submitCrossMarginOrder(
				{ address: market.market, key: market.marketKey },
				wallet,
				account,
				orderInputs
			);

			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(setOpenModal(null));
			dispatch(setShowPositionModal(null));
			dispatch(refetchPosition('cross_margin'));
			dispatch(fetchBalances());
			dispatch(clearTradeInputs());
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const closeCrossMarginPosition = createAsyncThunk<void, void, ThunkConfig>(
	'futures/closeCrossMarginPosition',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const { position, market } = selectEditPositionModalInfo(getState());
		const crossMarginAccount = selectCrossMarginAccount(getState());
		const desiredFillPrice = selectClosePosDesiredFillPrice(getState());

		try {
			if (!position?.position) throw new Error('No position to close');
			if (!crossMarginAccount) throw new Error('No cross margin account');
			if (!market) throw new Error('Missing market info');

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'close_cross_margin',
					hash: null,
				})
			);
			const tx = await sdk.futures.closeCrossMarginPosition(
				{
					address: market.market,
					key: market.marketKey,
				},
				crossMarginAccount,
				{
					size: position.position.size,
					side: position.position?.side,
				},
				desiredFillPrice
			);
			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(setOpenModal(null));
			dispatch(refetchPosition('cross_margin'));
			dispatch(fetchBalances());
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const cancelConditionalOrder = createAsyncThunk<void, number, ThunkConfig>(
	'futures/cancelConditionalOrder',
	async (contractOrderId, { getState, dispatch, extra: { sdk } }) => {
		const crossMarginAccount = selectCrossMarginAccount(getState());
		try {
			if (!crossMarginAccount) throw new Error('No cross margin account');
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'cancel_cross_margin_order',
					hash: null,
				})
			);

			// Handle contract id or subgraph id

			dispatch(setCrossMarginOrderCancelling(contractOrderId));
			const tx = await sdk.futures.cancelConditionalOrder(crossMarginAccount, contractOrderId);
			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(setCrossMarginOrderCancelling(undefined));
			dispatch(setOpenModal(null));
			dispatch(fetchCrossMarginOpenOrders());
		} catch (err) {
			dispatch(setCrossMarginOrderCancelling(undefined));
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

export const withdrawAccountKeeperBalance = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/withdrawAccountKeeperBalance',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const crossMarginAccount = selectCrossMarginAccount(getState());
		try {
			if (!crossMarginAccount) throw new Error('No cross margin account');
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'withdraw_keeper_balance',
					hash: null,
				})
			);

			const tx = await sdk.futures.withdrawAccountKeeperBalance(crossMarginAccount, amount);
			await monitorAndAwaitTransaction(dispatch, tx);
			dispatch(setOpenModal(null));
			dispatch(fetchCrossMarginBalanceInfo());
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

// Utils

export const estimateGasInteralAction = async (
	gasLimitEstimate: () => Promise<BigNumber>,
	type: FuturesTransactionType,
	config: {
		getState: () => RootState;
		dispatch: AppDispatch;
	}
) => {
	const { app } = config.getState();
	const ethPrice = selectLatestEthPrice(config.getState());

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
				? await sdk.futures.depositCrossMarginAccount(account, amount)
				: await sdk.futures.withdrawCrossMarginAccount(account, amount);
		await monitorAndAwaitTransaction(dispatch, tx);
		dispatch(fetchCrossMarginBalanceInfo());
		dispatch(setOpenModal(null));
		dispatch(refetchPosition('cross_margin'));
		dispatch(fetchBalances());
		dispatch(fetchMarginTransfers());
		return tx;
	} catch (err) {
		logError(err);
		dispatch(handleTransactionError(err.message));
		throw err;
	}
};

export const updateStopLossAndTakeProfit = createAsyncThunk<void, void, ThunkConfig>(
	'futures/updateStopLossAndTakeProfit',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		const account = selectCrossMarginAccount(getState());
		const wallet = selectWallet(getState());
		const tradeInputs = selectCrossMarginTradeInputs(getState());
		const desiredFillPrice = selectDesiredTradeFillPrice(getState());
		const { stopLossPrice, takeProfitPrice } = selectSlTpTradeInputs(getState());

		try {
			if (!marketInfo) throw new Error('Market info not found');
			if (!account) throw new Error('No cross margin account found');
			if (!wallet) throw new Error('No wallet connected');

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'submit_cross_order',
					hash: null,
				})
			);

			const params: sltpOrderInputs = {};

			// To separate Stop Loss and Take Profit from other limit / stop orders
			// we set the size to max big num value.

			if (Number(stopLossPrice) > 0) {
				params.stopLoss = {
					price: wei(stopLossPrice),
					sizeDelta: tradeInputs.nativeSizeDelta.gt(0) ? SL_TP_MAX_SIZE.neg() : SL_TP_MAX_SIZE,
					isCancelled: false,
				};
			} else {
				params.stopLoss = {
					price: wei(0),
					sizeDelta: wei(0),
					isCancelled: true,
				};
			}

			if (Number(takeProfitPrice) > 0) {
				params.takeProfit = {
					price: wei(takeProfitPrice),
					sizeDelta: tradeInputs.nativeSizeDelta.gt(0) ? SL_TP_MAX_SIZE.neg() : SL_TP_MAX_SIZE,
					isCancelled: false,
				};
			} else {
				params.takeProfit = {
					price: wei(0),
					sizeDelta: wei(0),
					isCancelled: true,
				};
			}

			if (params.stopLoss || params.takeProfit) {
				const tx = await sdk.futures.updateStopLossAndTakeProfit(
					marketInfo.marketKey,
					account,
					desiredFillPrice,
					params
				);
				await monitorAndAwaitTransaction(dispatch, tx);
				dispatch(setOpenModal(null));
				dispatch(refetchPosition('cross_margin'));
			}
		} catch (err) {
			dispatch(handleTransactionError(err.message));
			throw err;
		}
	}
);

const monitorAndAwaitTransaction = async (
	dispatch: AppDispatch,
	tx: ethers.providers.TransactionResponse
) => {
	dispatch(updateTransactionHash(tx.hash));
	await tx.wait();
	dispatch(updateTransactionStatus(TransactionStatus.Confirmed));
};

const getMarketDetailsByKey = (getState: () => RootState, key: FuturesMarketKey) => {
	const market = getState().futures.markets.find((m) => {
		return m.marketKey === key;
	});
	if (!market) throw new Error(`No market info found for ${key}`);
	return {
		address: market.market,
		key: market.marketKey,
	};
};
