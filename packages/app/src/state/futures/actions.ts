import KwentaSDK from '@kwenta/sdk'
import {
	DEFAULT_PRICE_IMPACT_DELTA_PERCENT,
	ORDER_KEEPER_ETH_DEPOSIT,
	SL_TP_MAX_SIZE,
	ZERO_ADDRESS,
	ZERO_WEI,
} from '@kwenta/sdk/constants'
import {
	FuturesMarket,
	ConditionalOrder,
	FuturesPosition,
	FuturesPositionHistory,
	FuturesPotentialTradeDetails,
	FuturesTrade,
	FuturesVolumes,
	MarginTransfer,
	PositionSide,
	PotentialTradeStatus,
	SmartMarginOrderInputs,
	ConditionalOrderTypeEnum,
	SLTPOrderInputs,
	FuturesMarketKey,
	FuturesMarketAsset,
	NetworkId,
	TransactionStatus,
	FuturesMarginType,
} from '@kwenta/sdk/types'
import {
	calculateDesiredFillPrice,
	getTradeStatusMessage,
	serializePotentialTrade,
	marketOverrides,
	floorNumber,
} from '@kwenta/sdk/utils'
import { createAsyncThunk } from '@reduxjs/toolkit'
import Wei, { wei } from '@synthetixio/wei'
import { ethers } from 'ethers'
import { debounce } from 'lodash'

import { notifyError } from 'components/ErrorNotifier'
import {
	handleTransactionError,
	setOpenModal,
	setShowPositionModal,
	setTransaction,
	updateTransactionHash,
	updateTransactionStatus,
} from 'state/app/reducer'
import { fetchBalances } from 'state/balances/actions'
import { ZERO_CM_FEES, ZERO_STATE_TRADE_INPUTS } from 'state/constants'
import { fetchV3Markets } from 'state/crossMargin/actions'
import { serializeWeiObject } from 'state/helpers'
import { AppDispatch, AppThunk, RootState } from 'state/store'
import { ThunkConfig } from 'state/types'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import { computeDelayedOrderFee } from 'utils/costCalculations'
import {
	formatDelayedOrders,
	orderPriceInvalidLabel,
	serializeCmBalanceInfo,
	serializeDelayedOrders,
	serializeConditionalOrders,
	serializeFuturesVolumes,
	serializeMarkets,
	serializePositionHistory,
	serializeTrades,
} from 'utils/futures'
import logError from 'utils/logError'
import { refetchWithComparator } from 'utils/queries'

import {
	handlePreviewError,
	setSmartMarginAccount,
	setSmartMarginFees,
	setSmartMarginMarginDelta,
	setSmartMarginOrderCancelling,
	setSmartMarginOrderPrice,
	setSmartMarginOrderPriceInvalidLabel,
	setSmartMarginTradeInputs,
	setSmartMarginTradePreview,
	setLeverageInput,
	setLeverageSide,
	setSmartMarginEditPositionInputs,
	incrementCrossPreviewCount,
	setClosePositionSizeDelta,
	setClosePositionPrice,
	clearAllTradePreviews,
	setKeeperDeposit,
} from './reducer'
import {
	selectSmartMarginAccount,
	selectSmartMarginMarginDelta,
	selectSmartMarginOrderPrice,
	selectFuturesAccount,
	selectSmartMarginSupportedNetwork,
	selectFuturesType,
	selectIsConditionalOrder,
	selectKeeperEthBalance,
	selectLeverageSide,
	selectMarketAsset,
	selectMarketInfo,
	selectMarketKey,
	selectMarkets,
	selectOrderType,
	selectOrderFeeCap,
	selectPosition,
	selectSmartMarginTradeInputs,
	selectIdleMargin,
	selectSlTpTradeInputs,
	selectSmartMarginEditPosInputs,
	selectSmartMarginPreviewCount,
	selectTradePreview,
	selectClosePositionOrderInputs,
	selectFuturesPositions,
	selectEditPositionModalInfo,
	selectOpenDelayedOrders,
	selectSlTpModalInputs,
	selectSmartMarginKeeperDeposit,
	selectSkewAdjustedPrice,
	selectEditPositionPreview,
	selectClosePositionPreview,
	selectMarketIndexPrice,
} from './selectors'
import {
	AccountContext,
	AppFuturesMarginType,
	CancelDelayedOrderInputs,
	SmartMarginBalanceInfo,
	DebouncedPreviewParams,
	DelayedOrderWithDetails,
	ExecuteDelayedOrderInputs,
	PreviewAction,
	TradePreviewParams,
} from './types'

export const fetchMarkets = createAsyncThunk<
	{ markets: FuturesMarket<string>[]; networkId: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchMarkets', async (_, { getState, extra: { sdk } }) => {
	const supportedNetwork = selectSmartMarginSupportedNetwork(getState())
	const networkId = selectNetwork(getState())

	if (!supportedNetwork) return
	try {
		const markets = await sdk.futures.getMarkets()
		// apply overrides
		const overrideMarkets = markets.map((m) => {
			return marketOverrides[m.marketKey]
				? {
						...m,
						...marketOverrides[m.marketKey],
				  }
				: m
		})

		const serializedMarkets = serializeMarkets(overrideMarkets)
		return { markets: serializedMarkets, networkId }
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch markets', err)
		throw err
	}
})

export const fetchSmartMarginBalanceInfo = createAsyncThunk<
	{ balanceInfo: SmartMarginBalanceInfo<string>; account: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>(
	'futures/fetchSmartMarginBalanceInfo',
	async (_, { getState, extra: { sdk }, rejectWithValue }) => {
		const account = selectSmartMarginAccount(getState())
		const network = selectNetwork(getState())
		const wallet = selectWallet(getState())
		const crossMarginSupported = selectSmartMarginSupportedNetwork(getState())
		if (!account || !wallet || !crossMarginSupported) return
		try {
			const balanceInfo = await sdk.futures.getSmartMarginBalanceInfo(wallet, account)
			return { balanceInfo: serializeCmBalanceInfo(balanceInfo), account, network }
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch cross-margin balance info', err)
			rejectWithValue(err.message)
			return undefined
		}
	}
)

export const fetchSmartMarginPositions = createAsyncThunk<
	{ positions: FuturesPosition<string>[]; account: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchSmartMarginPositions', async (_, { getState, extra: { sdk } }) => {
	const account = selectSmartMarginAccount(getState())
	const supportedNetwork = selectSmartMarginSupportedNetwork(getState())
	const network = selectNetwork(getState())
	const markets = selectMarkets(getState())

	if (!account || !supportedNetwork) return
	try {
		const positions = await sdk.futures.getFuturesPositions(
			account,
			markets.map((m) => ({ asset: m.asset, marketKey: m.marketKey, address: m.market }))
		)
		const serializedPositions = positions.map(
			(p) => serializeWeiObject(p) as FuturesPosition<string>
		)
		return { positions: serializedPositions, account, network }
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch smart-margin positions', err)
		throw err
	}
})

export const refetchPosition = createAsyncThunk<
	{
		position: FuturesPosition<string>
		wallet: string
		futuresType: AppFuturesMarginType
		networkId: NetworkId
	} | null,
	AppFuturesMarginType,
	ThunkConfig
>('futures/refetchPosition', async (type, { getState, extra: { sdk } }) => {
	const account = selectFuturesAccount(getState())
	if (!account) throw new Error('No wallet connected')
	const marketInfo = selectMarketInfo(getState())
	const networkId = selectNetwork(getState())
	const position = selectPosition(getState())
	if (!marketInfo || !position) throw new Error('Market or position not found')

	const result = await refetchWithComparator(
		() =>
			sdk.futures.getFuturesPositions(account!, [
				{ asset: marketInfo.asset, marketKey: marketInfo.marketKey, address: marketInfo.market },
			]),
		position?.remainingMargin?.toString(),
		(existing, next) => {
			return existing === next[0]?.remainingMargin.toString()
		}
	)

	if (result.data[0]) {
		const serialized = serializeWeiObject(
			result.data[0] as FuturesPosition
		) as FuturesPosition<string>
		return { position: serialized, wallet: account, futuresType: type, networkId }
	}
	return null
})

export const fetchSmartMarginAccount = createAsyncThunk<
	{ account: string; wallet: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchSmartMarginAccount', async (_, { getState, extra: { sdk }, rejectWithValue }) => {
	const wallet = selectWallet(getState())
	const supportedNetwork = selectSmartMarginSupportedNetwork(getState())
	const network = selectNetwork(getState())
	if (!wallet || !supportedNetwork) return undefined
	const accounts = getState().futures.smartMargin.accounts

	// Already have an accoutn fetched and persisted for this address
	if (accounts[network]?.[wallet]?.account) return

	try {
		const accounts = await sdk.futures.getSmartMarginAccounts(wallet)
		const account = accounts[0]
		if (account) return { account, wallet, network }
		return undefined
	} catch (err) {
		notifyError('Failed to fetch smart margin account', err)
		rejectWithValue(err.message)
	}
})

export const fetchDailyVolumes = createAsyncThunk<FuturesVolumes<string>, void, ThunkConfig>(
	'futures/fetchDailyVolumes',
	async (_, { extra: { sdk } }) => {
		const volumes = await sdk.futures.getDailyVolumes()
		return serializeFuturesVolumes(volumes)
	}
)

export const fetchMarginTransfers = createAsyncThunk<
	| {
			marginTransfers: MarginTransfer[]
			idleTransfers: MarginTransfer[]
			context: AccountContext
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchMarginTransfers', async (_, { getState, extra: { sdk } }) => {
	const { wallet, futures } = getState()
	const supportedNetwork = selectSmartMarginSupportedNetwork(getState())
	const network = selectNetwork(getState())
	const cmAccount = selectSmartMarginAccount(getState())
	if (!wallet.walletAddress || !supportedNetwork) return
	try {
		const transfers = await sdk.futures.getIsolatedMarginTransfers(cmAccount)
		const idleTransfers = await sdk.futures.getSmartMarginTransfers(cmAccount)

		return {
			marginTransfers: transfers,
			idleTransfers: idleTransfers,
			context: {
				wallet: wallet.walletAddress,
				network: network,
				type: futures.selectedType,
				cmAccount,
			},
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch margin transfers', err)
		throw err
	}
})

export const fetchCombinedMarginTransfers = createAsyncThunk<
	| {
			smartMarginTransfers: MarginTransfer[]
			idleTransfers: MarginTransfer[]
			context: AccountContext
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchCombinedMarginTransfers', async (_, { getState, extra: { sdk } }) => {
	const { wallet, futures } = getState()
	const supportedNetwork = selectSmartMarginSupportedNetwork(getState())
	const network = selectNetwork(getState())
	const cmAccount = selectSmartMarginAccount(getState())
	if (!wallet.walletAddress || !supportedNetwork) return
	try {
		const smartMarginTransfers = cmAccount
			? await sdk.futures.getIsolatedMarginTransfers(cmAccount)
			: []
		const idleTransfers = cmAccount ? await sdk.futures.getSmartMarginTransfers(cmAccount) : []

		return {
			smartMarginTransfers,
			idleTransfers,
			context: {
				wallet: wallet.walletAddress,
				network: network,
				type: futures.selectedType,
				cmAccount,
			},
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch combined margin transfers', err)
		throw err
	}
})

export const fetchSmartMarginAccountData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchSmartMarginAccountData',
	async (_, { dispatch }) => {
		dispatch(fetchSmartMarginPositions())
		dispatch(fetchSmartMarginBalanceInfo())
	}
)

export const fetchSharedFuturesData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchSharedFuturesData',
	async (_, { dispatch }) => {
		await dispatch(fetchMarkets())
		await dispatch(fetchV3Markets())
		dispatch(fetchDailyVolumes())
	}
)

export const fetchSmartMarginOpenOrders = createAsyncThunk<
	| {
			conditionalOrders: ConditionalOrder<string>[]
			delayedOrders: DelayedOrderWithDetails<string>[]
			account: string
			network: NetworkId
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchSmartMarginOpenOrders', async (_, { dispatch, getState, extra: { sdk } }) => {
	const account = selectSmartMarginAccount(getState())
	const supportedNetwork = selectSmartMarginSupportedNetwork(getState())
	const network = selectNetwork(getState())
	const markets = selectMarkets(getState())
	const existingOrders = selectOpenDelayedOrders(getState())

	const marketAddresses = markets.map((market) => market.market)

	if (!account || !supportedNetwork) return
	try {
		const orders = await sdk.futures.getConditionalOrders(account)
		const delayedOrders = await sdk.futures.getDelayedOrders(account, marketAddresses)
		const nonzeroOrders = formatDelayedOrders(delayedOrders, markets)

		const orderDropped = existingOrders.length > nonzeroOrders.length
		if (orderDropped) {
			dispatch(fetchSmartMarginPositions())
		}

		return {
			account,
			network,
			delayedOrders: serializeDelayedOrders(nonzeroOrders),
			conditionalOrders: serializeConditionalOrders(orders),
		}
	} catch (err) {
		notifyError('Failed to fetch open orders', err)
		logError(err)
		throw err
	}
})

export const fetchCrossMarginTradePreview = createAsyncThunk<
	{ preview: FuturesPotentialTradeDetails<string> | null; type: PreviewAction },
	DebouncedPreviewParams,
	ThunkConfig
>(
	'futures/fetchCrossMarginTradePreview',
	async (params, { dispatch, getState, extra: { sdk } }) => {
		const account = selectFuturesAccount(getState())
		const freeMargin = selectIdleMargin(getState())
		const positions = selectFuturesPositions(getState())
		const position = positions.find((p) => p.marketKey === params.market.key)

		const marketMargin = position?.remainingMargin ?? wei(0)

		if (
			// Require both size and margin for a trade
			(params.action === 'trade' && (params.sizeDelta.eq(0) || params.marginDelta.eq(0))) ||
			// Require one or the other when editing a position
			(params.sizeDelta.eq(0) && params.marginDelta.eq(0))
		) {
			return { preview: null, type: params.action }
		}

		// If this is a trade with no existsing position size then we need to subtract
		// remaining idle market margin to get an accurate preview
		const marginDelta =
			(!position?.position || position?.position?.size.abs().eq(0)) &&
			marketMargin.gt(0) &&
			params.action === 'trade'
				? params.marginDelta.sub(marketMargin)
				: params.marginDelta

		try {
			const leverageSide = selectLeverageSide(getState())
			const preview = await sdk.futures.getSmartMarginTradePreview(
				account || ZERO_ADDRESS,
				params.market.key,
				params.market.address,
				{ ...params, leverageSide, marginDelta }
			)

			// Check the preview hasn't been cleared before query resolves
			const count = selectSmartMarginPreviewCount(getState())
			if (count !== params.debounceCount) {
				const existing = selectTradePreview(getState())
				const returnPreview = existing ? serializePotentialTrade(existing) : null
				return { preview: returnPreview, type: params.action }
			}

			if (params.marginDelta.gt(freeMargin) && preview.status === 0) {
				// Show insufficient margin message
				preview.status = PotentialTradeStatus.INSUFFICIENT_FREE_MARGIN
				preview.statusMessage = getTradeStatusMessage(PotentialTradeStatus.INSUFFICIENT_FREE_MARGIN)
				preview.showStatus = true
			}

			const serializedPreview = serializePotentialTrade({
				...preview,
				marketKey: params.market.key,
			})
			return { preview: serializedPreview, type: params.action }
		} catch (err) {
			logError(err)
			notifyError('Failed to generate trade preview', err)
			dispatch(
				handlePreviewError({
					error: err.message,
					previewType: params.action,
				})
			)
			return { preview: null, type: params.action }
		}
	}
)

export const clearTradeInputs = createAsyncThunk<void, void, ThunkConfig>(
	'futures/clearTradeInputs',
	async (_, { dispatch }) => {
		dispatch(setSmartMarginMarginDelta(''))
		dispatch(setSmartMarginFees(ZERO_CM_FEES))
		dispatch(setLeverageInput(''))
		dispatch(clearAllTradePreviews())
		dispatch(setSmartMarginTradeInputs(ZERO_STATE_TRADE_INPUTS))
		dispatch(setSmartMarginEditPositionInputs({ nativeSizeDelta: '', marginDelta: '' }))
	}
)

export const editCrossMarginTradeMarginDelta =
	(marginDelta: string): AppThunk =>
	(dispatch, getState) => {
		const orderPrice = selectMarketIndexPrice(getState())
		const marketInfo = selectMarketInfo(getState())
		const { susdSize, nativeSizeDelta } = selectSmartMarginTradeInputs(getState())

		if (!marketInfo) throw new Error('No market selected')

		if (!marginDelta || Number(marginDelta) === 0) {
			dispatch(setSmartMarginMarginDelta(marginDelta))
			dispatch(setSmartMarginTradePreview({ preview: null, type: 'trade' }))
			return
		}

		const marginDelatWei = wei(marginDelta)
		const leverage = wei(susdSize).div(marginDelatWei.abs())

		dispatch(setSmartMarginMarginDelta(marginDelta))
		if (!leverage.eq(0)) {
			dispatch(setLeverageInput(leverage.toString(2)))
		}

		dispatch(
			stageCrossMarginTradePreview({
				market: { key: marketInfo.marketKey, address: marketInfo.market },
				orderPrice,
				marginDelta: wei(marginDelta || 0),
				sizeDelta: nativeSizeDelta,
				action: 'trade',
			})
		)
	}

export const editCrossMarginTradeSize =
	(size: string, currencyType: 'usd' | 'native'): AppThunk =>
	(dispatch, getState) => {
		const indexPrice = selectMarketIndexPrice(getState())
		const marginDelta = selectSmartMarginMarginDelta(getState())
		const orderPrice = selectSmartMarginOrderPrice(getState())
		const isConditionalOrder = selectIsConditionalOrder(getState())
		const tradeSide = selectLeverageSide(getState())
		const marketInfo = selectMarketInfo(getState())
		const price = isConditionalOrder && Number(orderPrice) > 0 ? wei(orderPrice) : indexPrice

		if (!marketInfo) throw new Error('No market selected')

		if (size === '' || price.eq(0)) {
			dispatch(setSmartMarginTradeInputs(ZERO_STATE_TRADE_INPUTS))
			dispatch(setSmartMarginTradePreview({ preview: null, type: 'trade' }))
			dispatch(setLeverageInput(''))
			return
		}

		const nativeSize =
			currencyType === 'native' ? size : String(floorNumber(wei(size).div(price), 4))
		const usdSize = currencyType === 'native' ? String(floorNumber(price.mul(size), 4)) : size
		const leverage = marginDelta?.gt(0) ? wei(usdSize).div(marginDelta.abs()) : '0'
		const sizeDeltaWei =
			tradeSide === PositionSide.LONG ? wei(nativeSize || 0) : wei(nativeSize || 0).neg()
		dispatch(
			setSmartMarginTradeInputs({
				susdSize: usdSize,
				nativeSize: nativeSize,
			})
		)
		dispatch(setLeverageInput(leverage.toString(2)))
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
		)
	}

export const editCrossMarginPositionSize =
	(marketKey: FuturesMarketKey, nativeSizeDelta: string): AppThunk =>
	(dispatch, getState) => {
		const { marketPrice } = selectEditPositionModalInfo(getState())
		dispatch(
			setSmartMarginEditPositionInputs({
				marginDelta: '',
				nativeSizeDelta: nativeSizeDelta,
			})
		)
		try {
			const market = getMarketDetailsByKey(getState, marketKey)
			dispatch(
				stageCrossMarginTradePreview({
					orderPrice: marketPrice,
					market,
					marginDelta: ZERO_WEI,
					sizeDelta: wei(nativeSizeDelta || 0),
					action: 'edit',
				})
			)
		} catch (err) {
			dispatch(handlePreviewError({ error: err.message, previewType: 'edit' }))
		}
	}

export const editClosePositionSizeDelta =
	(marketKey: FuturesMarketKey, nativeSizeDelta: string): AppThunk =>
	(dispatch, getState) => {
		dispatch(setClosePositionSizeDelta(nativeSizeDelta))

		if (nativeSizeDelta === '' || !nativeSizeDelta) {
			dispatch(setSmartMarginTradePreview({ preview: null, type: 'close' }))
			return
		}
		const { price } = selectClosePositionOrderInputs(getState())
		const { marketPrice } = selectEditPositionModalInfo(getState())
		const accountType = selectFuturesType(getState())

		try {
			const market = getMarketDetailsByKey(getState, marketKey)
			const smartMarginPrice = isNaN(Number(price)) || !price ? marketPrice : wei(price)
			const odrderPrice =
				accountType === FuturesMarginType.CROSS_MARGIN ? marketPrice : smartMarginPrice
			const previewParams: TradePreviewParams = {
				market,
				sizeDelta: wei(nativeSizeDelta),
				orderPrice: odrderPrice,
				marginDelta: ZERO_WEI,
				action: 'close',
			}
			dispatch(stageCrossMarginTradePreview(previewParams))
		} catch (err) {
			dispatch(handlePreviewError({ error: err.message, previewType: 'close' }))
		}
	}

export const editClosePositionPrice =
	(marketKey: FuturesMarketKey, price: string): AppThunk =>
	(dispatch, getState) => {
		const { nativeSizeDelta, orderType } = selectClosePositionOrderInputs(getState())
		const marketPrice = selectMarketIndexPrice(getState())
		const { position } = selectEditPositionModalInfo(getState())
		const closeTradeSide =
			position?.position?.side === PositionSide.SHORT ? PositionSide.LONG : PositionSide.SHORT
		const invalidLabel = orderPriceInvalidLabel(
			price || '0',
			closeTradeSide,
			marketPrice,
			orderType
		)

		dispatch(setClosePositionPrice({ value: price, invalidLabel }))

		try {
			const marketInfo = getMarketDetailsByKey(getState, marketKey)
			dispatch(
				stageCrossMarginTradePreview({
					market: marketInfo,
					orderPrice: isNaN(Number(price)) || !price ? marketPrice : wei(price),
					marginDelta: ZERO_WEI,
					sizeDelta: wei(nativeSizeDelta || 0),
					action: 'edit',
				})
			)
		} catch (err) {
			dispatch(handlePreviewError({ error: err.message, previewType: 'close' }))
		}
	}

export const editCrossMarginPositionMargin =
	(marketKey: FuturesMarketKey, marginDelta: string): AppThunk =>
	(dispatch, getState) => {
		const { marketPrice } = selectEditPositionModalInfo(getState())
		dispatch(
			setSmartMarginEditPositionInputs({
				marginDelta: marginDelta,
				nativeSizeDelta: '',
			})
		)
		try {
			const market = getMarketDetailsByKey(getState, marketKey)

			dispatch(
				stageCrossMarginTradePreview({
					market,
					orderPrice: marketPrice,
					marginDelta: wei(marginDelta || 0),
					sizeDelta: ZERO_WEI,
					action: 'edit',
				})
			)
		} catch (err) {
			dispatch(handlePreviewError({ error: err.message, previewType: 'edit' }))
		}
	}

export const refetchTradePreview = (): AppThunk => (dispatch, getState) => {
	const orderPrice = selectSmartMarginOrderPrice(getState())
	const indexPrice = selectMarketIndexPrice(getState())
	const marketInfo = selectMarketInfo(getState())
	const marginDelta = selectSmartMarginMarginDelta(getState())
	const isConditionalOrder = selectIsConditionalOrder(getState())
	const price = isConditionalOrder && Number(orderPrice) > 0 ? wei(orderPrice) : indexPrice
	const { nativeSizeDelta } = selectSmartMarginTradeInputs(getState())

	if (!marketInfo) throw new Error('No market selected')

	dispatch(
		stageCrossMarginTradePreview({
			market: { key: marketInfo.marketKey, address: marketInfo.market },
			orderPrice: price,
			marginDelta,
			sizeDelta: nativeSizeDelta,
			action: 'trade',
		})
	)
}

const stageCrossMarginTradePreview = createAsyncThunk<void, TradePreviewParams, ThunkConfig>(
	'futures/stageCrossMarginTradePreview',
	async (inputs, { dispatch, getState }) => {
		dispatch(calculateSmartMarginFees(inputs))
		dispatch(incrementCrossPreviewCount())
		const debounceCount = selectSmartMarginPreviewCount(getState())
		debouncedPrepareCrossMarginTradePreview(dispatch, { ...inputs, debounceCount })
	}
)

export const editTradeSizeInput =
	(size: string, currencyType: 'usd' | 'native'): AppThunk =>
	(dispatch) => {
		dispatch(editCrossMarginTradeSize(size, currencyType))
	}

export const changeLeverageSide =
	(side: PositionSide): AppThunk =>
	(dispatch, getState) => {
		const { nativeSizeString } = selectSmartMarginTradeInputs(getState())
		dispatch(setLeverageSide(side))
		dispatch(editTradeSizeInput(nativeSizeString, 'native'))
	}

export const debouncedPrepareCrossMarginTradePreview = debounce(
	(dispatch, inputs: DebouncedPreviewParams) => {
		dispatch(fetchCrossMarginTradePreview(inputs))
	},
	500
)

export const editTradeOrderPrice =
	(price: string): AppThunk =>
	(dispatch, getState) => {
		const rate = selectSkewAdjustedPrice(getState())
		const orderType = selectOrderType(getState())
		const side = selectLeverageSide(getState())
		const inputs = selectSmartMarginTradeInputs(getState())
		dispatch(setSmartMarginOrderPrice(price))
		const invalidLabel = orderPriceInvalidLabel(price, side, rate, orderType)
		dispatch(setSmartMarginOrderPriceInvalidLabel(invalidLabel))
		if (!invalidLabel && price && inputs.susdSize) {
			// Recalc the trade
			dispatch(editCrossMarginTradeSize(inputs.susdSizeString, 'usd'))
		}
	}

export const fetchFuturesPositionHistory = createAsyncThunk<
	| {
			accountType: AppFuturesMarginType
			history: FuturesPositionHistory<string>[]
			account: string
			wallet: string
			networkId: NetworkId
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchFuturesPositionHistory', async (_, { getState, extra: { sdk } }) => {
	try {
		const account = selectFuturesAccount(getState())
		const accountType = selectFuturesType(getState())
		const networkId = selectNetwork(getState())
		const wallet = selectWallet(getState())
		const futuresSupported = selectSmartMarginSupportedNetwork(getState())
		if (!wallet || !account || !futuresSupported) return
		const history = await sdk.futures.getPositionHistory(account)
		return { accountType, account, wallet, networkId, history: serializePositionHistory(history) }
	} catch (err) {
		notifyError('Failed to fetch position history', err)
		throw err
	}
})

export const fetchPositionHistoryForTrader = createAsyncThunk<
	{ history: FuturesPositionHistory<string>[]; address: string; networkId: NetworkId } | undefined,
	string,
	ThunkConfig
>('futures/fetchPositionHistoryForTrader', async (traderAddress, { getState, extra: { sdk } }) => {
	try {
		const networkId = selectNetwork(getState())
		const futuresSupported = selectSmartMarginSupportedNetwork(getState())
		if (!futuresSupported) return
		const history = await sdk.futures.getPositionHistory(traderAddress, 'eoa')
		return { history: serializePositionHistory(history), networkId, address: traderAddress }
	} catch (err) {
		notifyError('Failed to fetch history for trader ' + traderAddress, err)
		throw err
	}
})

export const fetchTradesForSelectedMarket = createAsyncThunk<
	| {
			trades: FuturesTrade<string>[]
			account: string
			wallet: string
			networkId: NetworkId
			accountType: AppFuturesMarginType
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchTradesForSelectedMarket', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState())
		const networkId = selectNetwork(getState())
		const marketAsset = selectMarketAsset(getState())
		const accountType = selectFuturesType(getState())
		const account = selectFuturesAccount(getState())
		const futuresSupported = selectSmartMarginSupportedNetwork(getState())

		if (!futuresSupported || !wallet || !account) return
		const trades = await sdk.futures.getTradesForMarket(marketAsset, wallet, accountType)
		return { trades: serializeTrades(trades), networkId, account, accountType, wallet }
	} catch (err) {
		notifyError('Failed to fetch futures trades for selected market', err)
		throw err
	}
})

export const fetchAllTradesForAccount = createAsyncThunk<
	| {
			trades: FuturesTrade<string>[]
			account: string
			wallet: string
			networkId: NetworkId
			accountType: AppFuturesMarginType
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchAllTradesForAccount', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState())
		const networkId = selectNetwork(getState())
		const accountType = selectFuturesType(getState())
		const account = selectFuturesAccount(getState())
		const futuresSupported = selectSmartMarginSupportedNetwork(getState())
		if (!futuresSupported || !wallet || !account) return
		const trades = await sdk.futures.getAllTrades(wallet, accountType, 200)
		return { trades: serializeTrades(trades), networkId, account, accountType, wallet }
	} catch (err) {
		notifyError('Failed to fetch futures trades', err)
		throw err
	}
})

export const calculateSmartMarginFees =
	(params: TradePreviewParams): AppThunk =>
	(dispatch, getState) => {
		const markets = selectMarkets(getState())
		const market = markets.find((m) => m.marketKey === params.market.key)
		if (!market) throw new Error('Missing market info to compute fee')
		const keeperBalance = selectKeeperEthBalance(getState())
		const { delayedOrderFee } = computeDelayedOrderFee(
			market,
			params.sizeDelta.mul(params.orderPrice?.abs())
		)

		const requiredDeposit = keeperBalance.lt(ORDER_KEEPER_ETH_DEPOSIT)
			? ORDER_KEEPER_ETH_DEPOSIT.sub(keeperBalance)
			: wei(0)

		const fees = {
			delayedOrderFee: delayedOrderFee.toString(),
			keeperEthDeposit: requiredDeposit.toString(),
		}
		dispatch(setSmartMarginFees(fees))
	}

export const calculateKeeperDeposit = (): AppThunk => (dispatch, getState) => {
	const keeperBalance = selectKeeperEthBalance(getState())
	const requiredDeposit = keeperBalance.lt(ORDER_KEEPER_ETH_DEPOSIT)
		? ORDER_KEEPER_ETH_DEPOSIT.sub(keeperBalance)
		: wei(0)

	dispatch(setKeeperDeposit(requiredDeposit.toString()))
}

// Contract Mutations

export const createSmartMarginAccount = createAsyncThunk<
	{ account: string; wallet: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>(
	'futures/createSmartMarginAccount',
	async (_, { getState, dispatch, extra: { sdk }, rejectWithValue }) => {
		const wallet = selectWallet(getState())
		const supportedNetwork = selectSmartMarginSupportedNetwork(getState())
		const network = selectNetwork(getState())
		if (!wallet || !supportedNetwork) return undefined
		const accounts = getState().futures.smartMargin.accounts

		// Already have an accoutn fetched and persisted for this address
		if (accounts[network]?.[wallet]?.account) {
			notifyError('There is already an account associated with this wallet')
			rejectWithValue('Account already created')
		}

		try {
			const accounts = await sdk.futures.getSmartMarginAccounts()
			// Check for existing account on the contract as only one account per user
			if (accounts[0]) {
				dispatch(setSmartMarginAccount({ account: accounts[0], wallet: wallet, network }))
				return
			}

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'create_cross_margin_account',
					hash: null,
				})
			)
			const tx = await sdk.futures.createSmartMarginAccount()
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchSmartMarginAccount())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
		}
	}
)

export const withdrawSmartMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/withdrawSmartMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const account = selectSmartMarginAccount(getState())
		if (!account) {
			notifyError('No smart margin account')
			return
		}
		await submitSMTransferTransaction(dispatch, sdk, 'withdraw_cross_margin', account, amount)
	}
)

export const approveCrossMargin = createAsyncThunk<void, void, ThunkConfig>(
	'futures/approveCrossMargin',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const account = selectSmartMarginAccount(getState())
		if (!account) throw new Error('No smart margin account')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'approve_cross_margin',
					hash: null,
				})
			)
			const tx = await sdk.futures.approveSmartMarginDeposit(account)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchSmartMarginBalanceInfo())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const cancelDelayedOrder = createAsyncThunk<void, CancelDelayedOrderInputs, ThunkConfig>(
	'futures/cancelDelayedOrder',
	async ({ marketAddress, isOffchain }, { getState, dispatch, extra: { sdk } }) => {
		const account = selectFuturesAccount(getState())
		if (!account) throw new Error('No wallet connected')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'cancel_delayed_isolated',
					hash: null,
				})
			)
			const tx = await sdk.futures.cancelDelayedOrder(marketAddress, account, isOffchain)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchSmartMarginOpenOrders())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const executeDelayedOrder = createAsyncThunk<void, ExecuteDelayedOrderInputs, ThunkConfig>(
	'futures/executeDelayedOrder',
	async ({ marketKey, marketAddress, isOffchain }, { getState, dispatch, extra: { sdk } }) => {
		const account = selectFuturesAccount(getState())
		if (!account) throw new Error('No wallet connected')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'execute_delayed_isolated',
					hash: null,
				})
			)
			const tx = isOffchain
				? await sdk.futures.executeDelayedOffchainOrder(marketKey, marketAddress, account)
				: await sdk.futures.executeDelayedOrder(marketAddress, account)
			dispatch(updateTransactionHash(tx.hash))
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchSmartMarginOpenOrders())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const submitSmartMarginOrder = createAsyncThunk<void, boolean, ThunkConfig>(
	'futures/submitSmartMarginOrder',
	async (overridePriceProtection, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState())
		const account = selectSmartMarginAccount(getState())
		const tradeInputs = selectSmartMarginTradeInputs(getState())
		const marginDelta = selectSmartMarginMarginDelta(getState())
		const feeCap = selectOrderFeeCap(getState())
		const orderType = selectOrderType(getState())
		const orderPrice = selectSmartMarginOrderPrice(getState())
		const preview = selectTradePreview(getState())
		const keeperEthDeposit = selectSmartMarginKeeperDeposit(getState())
		const wallet = selectWallet(getState())
		const position = selectPosition(getState())
		const openDelayedOrders = selectOpenDelayedOrders(getState())
		const { stopLossPrice, takeProfitPrice } = selectSlTpTradeInputs(getState())

		try {
			if (!marketInfo) throw new Error('Market info not found')
			if (!account) throw new Error('No smart margin account found')
			if (!wallet) throw new Error('No wallet connected')
			if (!preview) throw new Error('Missing trade preview')
			if (!overridePriceProtection && preview.exceedsPriceProtection) {
				throw new Error('Price impact exceeds price protection')
			}

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'submit_cross_order',
					hash: null,
				})
			)

			const orderInputs: SmartMarginOrderInputs = {
				sizeDelta: tradeInputs.nativeSizeDelta,
				marginDelta: marginDelta,
				desiredFillPrice: preview.desiredFillPrice,
			}

			// To separate Stop Loss and Take Profit from other limit / stop orders
			// we set the size to max big num value.

			const maxSizeDelta = tradeInputs.nativeSizeDelta.gt(0) ? SL_TP_MAX_SIZE.neg() : SL_TP_MAX_SIZE

			if (Number(stopLossPrice) > 0) {
				const desiredSLFillPrice = calculateDesiredFillPrice(
					maxSizeDelta,
					wei(stopLossPrice || 0),
					wei(DEFAULT_PRICE_IMPACT_DELTA_PERCENT.STOP_LOSS)
				)
				orderInputs.stopLoss = {
					price: wei(stopLossPrice),
					desiredFillPrice: desiredSLFillPrice,
					sizeDelta: tradeInputs.nativeSizeDelta.gt(0) ? SL_TP_MAX_SIZE.neg() : SL_TP_MAX_SIZE,
				}
			}

			if (Number(takeProfitPrice) > 0) {
				const desiredTPFillPrice = calculateDesiredFillPrice(
					maxSizeDelta,
					wei(takeProfitPrice || 0),
					wei(DEFAULT_PRICE_IMPACT_DELTA_PERCENT.TAKE_PROFIT)
				)
				orderInputs.takeProfit = {
					price: wei(takeProfitPrice),
					desiredFillPrice: desiredTPFillPrice,
					sizeDelta: tradeInputs.nativeSizeDelta.gt(0) ? SL_TP_MAX_SIZE.neg() : SL_TP_MAX_SIZE,
				}
			}

			if (orderType !== 'market') {
				orderInputs['conditionalOrderInputs'] = {
					orderType:
						orderType === 'limit' ? ConditionalOrderTypeEnum.LIMIT : ConditionalOrderTypeEnum.STOP,
					feeCap,
					price: wei(orderPrice || '0'),
					reduceOnly: false,
				}
			}

			if (orderType !== 'market' || Number(takeProfitPrice) > 0 || Number(stopLossPrice) > 0) {
				orderInputs.keeperEthDeposit = keeperEthDeposit
			}

			let existingSize = position?.position?.size ?? wei(0)
			existingSize =
				position?.position?.side === PositionSide.SHORT ? existingSize.neg() : existingSize
			const isClosing = existingSize.add(tradeInputs.nativeSizeDelta).eq(0)

			const staleOrder = openDelayedOrders.find(
				(o) => o.isStale && o.marketKey === marketInfo.marketKey
			)

			const tx = await sdk.futures.submitSmartMarginOrder(
				{ address: marketInfo.market, key: marketInfo.marketKey },
				wallet,
				account,
				orderInputs,
				{ cancelPendingReduceOrders: isClosing, cancelExpiredDelayedOrders: !!staleOrder }
			)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchSmartMarginOpenOrders())
			dispatch(setOpenModal(null))
			dispatch(fetchBalances())
			dispatch(clearTradeInputs())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const submitSmartMarginAdjustMargin = createAsyncThunk<void, void, ThunkConfig>(
	'futures/submitSmartMarginAdjustMargin',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const { market } = selectEditPositionModalInfo(getState())
		const account = selectSmartMarginAccount(getState())
		const { marginDelta } = selectSmartMarginEditPosInputs(getState())

		try {
			if (!market) throw new Error('Market info not found')
			if (!account) throw new Error('No smart margin account found')
			if (!marginDelta || marginDelta === '') throw new Error('No margin amount set')

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'submit_cross_order',
					hash: null,
				})
			)

			const tx = await sdk.futures.modifySmartMarginMarketMargin(
				account,
				market.market,
				wei(marginDelta)
			)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(setOpenModal(null))
			dispatch(refetchPosition(FuturesMarginType.SMART_MARGIN))
			dispatch(fetchBalances())
			dispatch(clearTradeInputs())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const submitSmartMarginAdjustPositionSize = createAsyncThunk<void, boolean, ThunkConfig>(
	'futures/submitSmartMarginAdjustPositionSize',
	async (overridePriceProtection, { getState, dispatch, extra: { sdk } }) => {
		const { market, position } = selectEditPositionModalInfo(getState())
		const account = selectSmartMarginAccount(getState())
		const preview = selectEditPositionPreview(getState())
		const { nativeSizeDelta } = selectSmartMarginEditPosInputs(getState())

		try {
			if (!market) throw new Error('Market info not found')
			if (!account) throw new Error('No smart margin account found')
			if (!nativeSizeDelta || nativeSizeDelta === '') throw new Error('No margin amount set')
			if (!preview) throw new Error('Missing trade preview')
			if (!overridePriceProtection && preview.exceedsPriceProtection) {
				throw new Error('Price impact exceeds price protection')
			}

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'submit_cross_order',
					hash: null,
				})
			)

			let existingSize = position?.position?.size ?? wei(0)
			existingSize =
				position?.position?.side === PositionSide.SHORT ? existingSize.neg() : existingSize
			const isClosing = existingSize.add(nativeSizeDelta).eq(0)

			const tx = await sdk.futures.modifySmartMarginPositionSize(
				account,
				{
					key: market.marketKey,
					address: market.market,
				},
				wei(nativeSizeDelta),
				preview.desiredFillPrice,
				isClosing
			)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(setShowPositionModal(null))
			dispatch(fetchBalances())
			dispatch(clearTradeInputs())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const submitSmartMarginReducePositionOrder = createAsyncThunk<void, boolean, ThunkConfig>(
	'futures/submitSmartMarginReducePositionOrder',
	async (overridePriceProtection, { getState, dispatch, extra: { sdk } }) => {
		const { market, position } = selectEditPositionModalInfo(getState())
		const account = selectSmartMarginAccount(getState())
		const { nativeSizeDelta, orderType, price } = selectClosePositionOrderInputs(getState())
		const keeperEthDeposit = selectSmartMarginKeeperDeposit(getState())
		const feeCap = selectOrderFeeCap(getState())
		const wallet = selectWallet(getState())
		const preview = selectClosePositionPreview(getState())

		try {
			if (!market) throw new Error('Market info not found')
			if (!wallet) throw new Error('No wallet connected')
			if (!account) throw new Error('No smart margin account found')
			if (!nativeSizeDelta || nativeSizeDelta === '') throw new Error('No margin amount set')
			if (!preview) throw new Error('Missing trade preview')
			if (!overridePriceProtection && preview.exceedsPriceProtection) {
				throw new Error('Price impact exceeds price protection')
			}

			const isClosing = wei(nativeSizeDelta)
				.abs()
				.eq(position?.position?.size.abs() || 0)

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'submit_cross_order',
					hash: null,
				})
			)

			const orderInputs: SmartMarginOrderInputs = {
				sizeDelta: wei(nativeSizeDelta),
				marginDelta: wei(0),
				desiredFillPrice: preview.desiredFillPrice,
			}

			if (orderType !== 'market') {
				orderInputs['conditionalOrderInputs'] = {
					orderType:
						orderType === 'limit' ? ConditionalOrderTypeEnum.LIMIT : ConditionalOrderTypeEnum.STOP,
					feeCap,
					price: wei(price?.value || '0'),
					reduceOnly: true,
				}
				orderInputs.keeperEthDeposit = keeperEthDeposit
			}

			const tx =
				isClosing && orderType === 'market'
					? await sdk.futures.closeSmartMarginPosition(
							{ address: market.market, key: market.marketKey },
							account,
							preview.desiredFillPrice
					  )
					: await sdk.futures.submitSmartMarginOrder(
							{ address: market.market, key: market.marketKey },
							wallet,
							account,
							orderInputs,
							{ cancelPendingReduceOrders: isClosing }
					  )

			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(setOpenModal(null))
			dispatch(setShowPositionModal(null))
			dispatch(fetchBalances())
			dispatch(clearTradeInputs())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const cancelConditionalOrder = createAsyncThunk<void, number, ThunkConfig>(
	'futures/cancelConditionalOrder',
	async (contractOrderId, { getState, dispatch, extra: { sdk } }) => {
		const crossMarginAccount = selectSmartMarginAccount(getState())
		try {
			if (!crossMarginAccount) throw new Error('No smart margin account')
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'cancel_cross_margin_order',
					hash: null,
				})
			)

			// Handle contract id or subgraph id

			dispatch(setSmartMarginOrderCancelling(contractOrderId))
			const tx = await sdk.futures.cancelConditionalOrder(crossMarginAccount, contractOrderId)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(setSmartMarginOrderCancelling(undefined))
			dispatch(setOpenModal(null))
			dispatch(fetchSmartMarginOpenOrders())
		} catch (err) {
			dispatch(setSmartMarginOrderCancelling(undefined))
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const withdrawAccountKeeperBalance = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/withdrawAccountKeeperBalance',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const crossMarginAccount = selectSmartMarginAccount(getState())
		try {
			if (!crossMarginAccount) throw new Error('No smart margin account')
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'withdraw_keeper_balance',
					hash: null,
				})
			)

			const tx = await sdk.futures.withdrawAccountKeeperBalance(crossMarginAccount, amount)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(setOpenModal(null))
			dispatch(fetchSmartMarginBalanceInfo())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

// Utils

const submitSMTransferTransaction = async (
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
	)

	try {
		const tx =
			type === 'deposit_cross_margin'
				? await sdk.futures.depositSmartMarginAccount(account, amount)
				: await sdk.futures.withdrawSmartMarginAccount(account, amount)
		await monitorAndAwaitTransaction(dispatch, tx)
		dispatch(fetchSmartMarginBalanceInfo())
		dispatch(setOpenModal(null))
		dispatch(refetchPosition(FuturesMarginType.SMART_MARGIN))
		dispatch(fetchBalances())
		dispatch(fetchMarginTransfers())
		return tx
	} catch (err) {
		logError(err)
		dispatch(handleTransactionError(err.message))
		throw err
	}
}

export const updateStopLossAndTakeProfit = createAsyncThunk<void, void, ThunkConfig>(
	'futures/updateStopLossAndTakeProfit',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const { market, position } = selectEditPositionModalInfo(getState())
		const account = selectSmartMarginAccount(getState())
		const wallet = selectWallet(getState())
		const { stopLossPrice, takeProfitPrice } = selectSlTpModalInputs(getState())
		const keeperDeposit = selectSmartMarginKeeperDeposit(getState())

		try {
			if (!market) throw new Error('Market info not found')
			if (!account) throw new Error('No smart margin account found')
			if (!wallet) throw new Error('No wallet connected')

			const maxSizeDelta =
				position?.position?.side === PositionSide.LONG ? SL_TP_MAX_SIZE.neg() : SL_TP_MAX_SIZE

			const desiredSLFillPrice = calculateDesiredFillPrice(
				maxSizeDelta,
				wei(stopLossPrice || 0),
				wei(DEFAULT_PRICE_IMPACT_DELTA_PERCENT.STOP_LOSS)
			)

			const desiredTPFillPrice = calculateDesiredFillPrice(
				maxSizeDelta,
				wei(takeProfitPrice || 0),
				wei(DEFAULT_PRICE_IMPACT_DELTA_PERCENT.TAKE_PROFIT)
			)

			const params: SLTPOrderInputs = {
				keeperEthDeposit: keeperDeposit,
			}

			// To separate Stop Loss and Take Profit from other limit / stop orders
			// we set the size to max big num value.

			if (Number(stopLossPrice) > 0) {
				params.stopLoss = {
					price: wei(stopLossPrice),
					desiredFillPrice: desiredSLFillPrice,
					sizeDelta: maxSizeDelta,
				}
			} else if (!stopLossPrice) {
				params.stopLoss = {
					price: wei(0),
					desiredFillPrice: wei(0),
					sizeDelta: wei(0),
					isCancelled: true,
				}
			}

			if (Number(takeProfitPrice) > 0) {
				params.takeProfit = {
					price: wei(takeProfitPrice),
					desiredFillPrice: desiredTPFillPrice,
					sizeDelta: maxSizeDelta,
				}
			} else if (!takeProfitPrice) {
				params.takeProfit = {
					price: wei(0),
					desiredFillPrice: wei(0),
					sizeDelta: wei(0),
					isCancelled: true,
				}
			}

			if (params.stopLoss || params.takeProfit) {
				dispatch(
					setTransaction({
						status: TransactionStatus.AwaitingExecution,
						type: 'submit_cross_order',
						hash: null,
					})
				)

				const tx = await sdk.futures.updateStopLossAndTakeProfit(market.marketKey, account, params)
				await monitorAndAwaitTransaction(dispatch, tx)
				dispatch(setShowPositionModal(null))
			}
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const fetchFundingRatesHistory = createAsyncThunk<
	{ marketAsset: FuturesMarketAsset; rates: any },
	FuturesMarketAsset,
	ThunkConfig
>('futures/fetchFundingRatesHistory', async (marketAsset, { extra: { sdk } }) => {
	const rates = await sdk.futures.getMarketFundingRatesHistory(marketAsset)
	return { marketAsset, rates }
})

const monitorAndAwaitTransaction = async (
	dispatch: AppDispatch,
	tx: ethers.providers.TransactionResponse
) => {
	dispatch(updateTransactionHash(tx.hash))
	await tx.wait()
	dispatch(updateTransactionStatus(TransactionStatus.Confirmed))
}

const getMarketDetailsByKey = (getState: () => RootState, key: FuturesMarketKey) => {
	const markets = selectMarkets(getState())
	const market = markets.find((m) => {
		return m.marketKey === key
	})
	if (!market) throw new Error(`No market info found for ${key}`)
	return {
		address: market.market,
		key: market.marketKey,
	}
}
