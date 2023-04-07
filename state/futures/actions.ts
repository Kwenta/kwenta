import { createAsyncThunk } from '@reduxjs/toolkit';
import Wei, { wei } from '@synthetixio/wei';
import { BigNumber, ethers } from 'ethers';
import { debounce } from 'lodash';
import KwentaSDK from 'sdk';

import { notifyError } from 'components/ErrorView/ErrorNotifier';
import { ORDER_KEEPER_ETH_DEPOSIT } from 'constants/futures';
import { NetworkId } from 'sdk/types/common';
import { TransactionStatus } from 'sdk/types/common';
import {
	CrossMarginOrderType,
	DelayedOrder,
	FuturesAccountType,
	FuturesMarket,
	FuturesOrder,
	FuturesPosition,
	FuturesPositionHistory,
	FuturesPotentialTradeDetails,
	FuturesTrade,
	FuturesVolumes,
	MarginTransfer,
	OrderEnumByType,
	PositionSide,
	PotentialTradeStatus,
} from 'sdk/types/futures';
import {
	calculateCrossMarginFee,
	getMarketName,
	getTradeStatusMessage,
	serializePotentialTrade,
} from 'sdk/utils/futures';
import { unserializeGasPrice } from 'state/app/helpers';
import {
	handleTransactionError,
	setOpenModal,
	setTransaction,
	updateTransactionHash,
	updateTransactionStatus,
} from 'state/app/reducer';
import { fetchBalances } from 'state/balances/actions';
import { ZERO_CM_FEES, ZERO_STATE_CM_TRADE_INPUTS } from 'state/constants';
import { serializeWeiObject } from 'state/helpers';
import { selectLatestEthPrice } from 'state/prices/selectors';
import { AppDispatch, AppThunk, RootState } from 'state/store';
import { ThunkConfig } from 'state/types';
import { selectNetwork, selectWallet } from 'state/wallet/selectors';
import { computeMarketFee } from 'utils/costCalculations';
import { stipZeros } from 'utils/formatters/number';
import {
	calculateMarginDelta,
	marketOverrides,
	orderPriceInvalidLabel,
	serializeCmBalanceInfo,
	serializeCrossMarginSettings,
	serializeDelayedOrders,
	serializeFuturesOrders,
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
	setCrossMarginFees,
	setCrossMarginLeverageForAsset,
	setCrossMarginMarginDelta,
	setCrossMarginOrderCancelling,
	setCrossMarginOrderPrice,
	setCrossMarginOrderPriceInvalidLabel,
	setCrossMarginTradeInputs,
	setCrossMarginTradePreview,
	setIsolatedMarginFee,
	setIsolatedMarginLeverageInput,
	setIsolatedMarginTradeInputs,
	setIsolatedTradePreview,
	setLeverageSide,
	setOrderType,
	setTransactionEstimate,
} from './reducer';
import {
	selectCrossMarginAccount,
	selectCrossMarginMarginDelta,
	selectCrossMarginOrderPrice,
	selectCrossMarginSelectedLeverage,
	selectCrossMarginSettings,
	selectCrossMarginTradeFees,
	selectCrossMarginTradeInputs,
	selectFuturesAccount,
	selectFuturesSupportedNetwork,
	selectFuturesType,
	selectIsAdvancedOrder,
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
	selectCrossMarginBalanceInfo,
	selectIsolatedMarginOpenOrders,
	selectPriceImpactOrDesiredFill,
	selectIsolatedPriceImpact,
	selectDesiredTradeFillPrice,
} from './selectors';
import {
	CancelDelayedOrderInputs,
	CrossMarginBalanceInfo,
	CrossMarginSettings,
	DelayedOrderWithDetails,
	ExecuteDelayedOrderInputs,
	FuturesTransactionType,
	ModifyIsolatedPositionInputs,
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
		position.remainingMargin,
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
			wallet: string;
			network: NetworkId;
			type: FuturesAccountType;
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchMarginTransfers', async (_, { getState, extra: { sdk } }) => {
	const { wallet, futures } = getState();
	const supportedNetwork = selectFuturesSupportedNetwork(getState());
	const network = selectNetwork(getState());
	if (!wallet.walletAddress || !supportedNetwork) return;
	try {
		const transfers =
			futures.selectedType === 'cross_margin'
				? await sdk.futures.getCrossMarginTransfers()
				: await sdk.futures.getIsolatedMarginTransfers();
		return {
			marginTransfers: transfers,
			wallet: wallet.walletAddress,
			network: network,
			type: futures.selectedType,
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
	const existingOrders = selectIsolatedMarginOpenOrders(getState());
	if (!wallet || !supportedNetwork || !markets.length) return;

	const marketAddresses = markets.map((market) => market.market);

	const orders: DelayedOrder[] = await sdk.futures.getDelayedOrders(wallet, marketAddresses);

	const nonzeroOrders = orders
		.filter((o) => o.size.abs().gt(0))
		.reduce((acc, o) => {
			const market = markets.find((m) => m.market === o.marketAddress);
			if (!market) return acc;

			acc.push({
				...o,
				marketKey: market.marketKey,
				asset: market.asset,
				market: getMarketName(market.asset),
				executableAtTimestamp:
					market && o.isOffchain // Manual fix for an incorrect
						? o.submittedAtTimestamp +
						  (o.isOffchain
								? market.settings.offchainDelayedOrderMinAge * 1000
								: market.settings.minDelayTimeDelta * 1000)
						: o.executableAtTimestamp,
			});
			return acc;
		}, [] as DelayedOrderWithDetails[]);

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
			orders: FuturesOrder<string>[];
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
	if (!account || !supportedNetwork) return;
	try {
		const orders = await sdk.futures.getCrossMarginOpenOrders(account);
		return {
			account,
			network,
			orders: serializeFuturesOrders(orders),
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
			return serializePotentialTrade(preview);
		} catch (err) {
			notifyError('Failed to generate trade preview', err);
			dispatch(handleIsolatedMarginPreviewError(err.message));
			throw err;
		}
	}
);

export const fetchCrossMarginTradePreview = createAsyncThunk<
	FuturesPotentialTradeDetails<string> | null,
	{ price?: Wei; sizeDelta: Wei; marginDelta: Wei },
	ThunkConfig
>(
	'futures/fetchCrossMarginTradePreview',
	async (inputs, { dispatch, getState, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState());
		const account = selectFuturesAccount(getState());
		const marginDelta = selectCrossMarginMarginDelta(getState());
		const { freeMargin } = selectCrossMarginBalanceInfo(getState());
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
			if (marginDelta.gt(freeMargin) && preview.status === 0) {
				// Show insufficient margin message
				preview.status = PotentialTradeStatus.INSUFFICIENT_FREE_MARGIN;
				preview.statusMessage = getTradeStatusMessage(
					PotentialTradeStatus.INSUFFICIENT_FREE_MARGIN
				);
				preview.showStatus = true;
			}
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
		dispatch(setCrossMarginMarginDelta('0'));
		dispatch(setCrossMarginFees(ZERO_CM_FEES));
		dispatch(setIsolatedMarginFee('0'));
		dispatch(setIsolatedMarginLeverageInput(''));
		dispatch(setIsolatedTradePreview(null));
		dispatch(setCrossMarginTradePreview(null));
	}
);

export const editCrossMarginSize = (size: string, currencyType: 'usd' | 'native'): AppThunk => (
	dispatch,
	getState
) => {
	const leverage = selectCrossMarginSelectedLeverage(getState());
	const assetRate = selectMarketPrice(getState());
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
		dispatch(calculateCrossMarginFees());
		const tradeInputs = selectCrossMarginTradeInputs(getState());
		const fees = selectCrossMarginTradeFees(getState());
		const rate = selectMarketPrice(getState());
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
		debouncedPrepareCrossMarginTradePreview(dispatch);
	}
);

export const editExistingPositionLeverage = createAsyncThunk<void, string, ThunkConfig>(
	'futures/editExistingPositionLeverage',
	async (leverage, { dispatch, getState }) => {
		dispatch(calculateCrossMarginFees());
		const fees = selectCrossMarginTradeFees(getState());
		const position = selectPosition(getState());
		const rate = selectMarketPrice(getState());
		const price = selectCrossMarginOrderPrice(getState());
		const marginDelta = await calculateMarginDelta(
			{
				susdSizeDelta: wei(0),
				nativeSizeDelta: wei(0),
				price: price ? wei(price) : rate,
				leverage: wei(leverage),
			},
			fees,
			position
		);
		dispatch(setCrossMarginMarginDelta(marginDelta.toString()));
		debouncedPrepareCrossMarginTradePreview(dispatch);
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
		dispatch(setIsolatedMarginTradeInputs(ZERO_STATE_CM_TRADE_INPUTS));
		dispatch(setIsolatedTradePreview(null));
		dispatch(setIsolatedMarginLeverageInput(''));
		return;
	}

	const nativeSize = currencyType === 'native' ? size : wei(size).div(assetRate).toString();
	const usdSize = currencyType === 'native' ? stipZeros(assetRate.mul(size).toString()) : size;
	const leverage =
		Number(usdSize) > 0 && position?.remainingMargin.gt(0)
			? wei(usdSize).div(position?.remainingMargin).toString(2)
			: '';
	dispatch(setIsolatedMarginLeverageInput(leverage));
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

export const setCrossMarginLeverage = (leverage: string): AppThunk => (dispatch, getState) => {
	const marketKey = selectMarketKey(getState());
	dispatch(setCrossMarginLeverageForAsset({ marketKey: marketKey, leverage: leverage }));
};

export const debouncedPrepareCrossMarginTradePreview = debounce((dispatch) => {
	dispatch(prepareCrossMarginTradePreview());
}, 500);

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
		dispatch(editCrossMarginSize(inputs.susdSizeString, 'usd'));
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
		return { accountType, account, networkId, history: serializePositionHistory(history) };
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
		notifyError('Failed to fetch futures trades', err);
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

	const staticRate = computeMarketFee(market, susdSizeDelta);
	const tradeFee = susdSize.mul(staticRate);

	const currentDeposit =
		orderType === 'limit' || orderType === 'stop_market' ? keeperBalance : wei(0);
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
	const { susdSize, susdSizeDelta } = selectIsolatedMarginTradeInputs(getState());
	const staticRate = computeMarketFee(market, susdSizeDelta);
	const tradeFee = susdSize.mul(staticRate);
	dispatch(setIsolatedMarginFee(tradeFee.toString()));
};

export const prepareCrossMarginTradePreview = createAsyncThunk<void, void, ThunkConfig>(
	'futures/prepareCrossMarginTradePreview',
	async (_, { getState, dispatch }) => {
		const tradeInputs = selectCrossMarginTradeInputs(getState());
		const assetPrice = selectMarketPrice(getState());
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
	async ({ sizeDelta, delayed, offchain }, { getState, dispatch, extra: { sdk } }) => {
		const account = selectFuturesAccount(getState());
		const marketInfo = selectMarketInfo(getState());
		const priceImpact = selectIsolatedPriceImpact(getState());
		const desiredFill = selectDesiredTradeFillPrice(getState());
		if (!marketInfo) throw new Error('Market info not found');
		if (!account) throw new Error('Account not connected');

		try {
			const isFlagged = await sdk.futures.getIsFlagged(account, marketInfo.market);

			// TODO: Remove this dynamic logic when the markets are upgraded
			const priceImpactOrFill = isFlagged == null ? priceImpact : desiredFill;

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
				priceImpactOrFill,
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
		const priceImpact = selectPriceImpactOrDesiredFill(getState());
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
		const marketKey = selectMarketKey(getState());
		const account = selectCrossMarginAccount(getState());
		const tradeInputs = selectCrossMarginTradeInputs(getState());
		const marginDelta = selectCrossMarginMarginDelta(getState());
		const feeCap = selectOrderFeeCap(getState());
		const orderType = selectOrderType(getState());
		const orderPrice = selectCrossMarginOrderPrice(getState());
		const { keeperEthDeposit } = selectCrossMarginTradeFees(getState());

		try {
			if (!marketKey) throw new Error('Market info not found');
			if (!account) throw new Error('No cross margin account found');

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'submit_cross_order',
					hash: null,
				})
			);
			const tx = await sdk.futures.submitCrossMarginOrder(marketKey, account, {
				type: orderType as CrossMarginOrderType, // TODO: A better way handle isolated and cross margin order types
				sizeDelta: tradeInputs.nativeSizeDelta,
				marginDelta: marginDelta,
				advancedOrderInputs: {
					keeperEthDeposit,
					feeCap,
					price: wei(orderPrice || '0'),
				},
			});
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

export const closeCrossMarginPosition = createAsyncThunk<void, void, ThunkConfig>(
	'futures/closeCrossMarginPosition',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const marketKey = selectMarketKey(getState());
		const position = selectPosition(getState());
		const crossMarginAccount = selectCrossMarginAccount(getState());

		try {
			if (!position?.position) throw new Error('No position to close');
			if (!crossMarginAccount) throw new Error('No cross margin account');

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'close_cross_margin',
					hash: null,
				})
			);
			const tx = await sdk.futures.closeCrossMarginPosition(marketKey, crossMarginAccount, {
				size: position.position.size,
				side: position.position?.side,
			});
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

export const cancelCrossMarginOrder = createAsyncThunk<void, string, ThunkConfig>(
	'futures/cancelCrossMarginOrder',
	async (orderId, { getState, dispatch, extra: { sdk } }) => {
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
			const id = orderId.includes('-') ? orderId.split('-')[2] : orderId;

			dispatch(setCrossMarginOrderCancelling(orderId));
			const tx = await sdk.futures.cancelCrossMarginOrder(crossMarginAccount, id);
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
				? await sdk.futures.depositCrossMargin(account, amount)
				: await sdk.futures.withdrawCrossMargin(account, amount);
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

const monitorAndAwaitTransaction = async (
	dispatch: AppDispatch,
	tx: ethers.providers.TransactionResponse
) => {
	dispatch(updateTransactionHash(tx.hash));
	await tx.wait();
	dispatch(updateTransactionStatus(TransactionStatus.Confirmed));
};

export const getClosePositionOrderFee = createAsyncThunk<Wei, void, ThunkConfig>(
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
				return sdk.futures.getOrderFee(marketInfo.market, position.position.size.neg());
			}
		} catch (err) {
			notifyError('Failed to get order fee', err);
			throw err;
		}
	}
);
