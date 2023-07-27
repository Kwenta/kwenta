import KwentaSDK from '@kwenta/sdk'
import {
	DEFAULT_PRICE_IMPACT_DELTA_PERCENT,
	ORDER_KEEPER_ETH_DEPOSIT,
	SL_TP_MAX_SIZE,
	ZERO_ADDRESS,
	ZERO_WEI,
} from '@kwenta/sdk/constants'
import {
	PerpsMarketV2,
	ConditionalOrder,
	PerpsV2Position,
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
import { debounce } from 'lodash'

import { notifyError } from 'components/ErrorNotifier'
import { monitorAndAwaitTransaction } from 'state/app/helpers'
import {
	handleTransactionError,
	setOpenModal,
	setShowPositionModal,
	setTransaction,
	updateTransactionHash,
} from 'state/app/reducer'
import { fetchBalances } from 'state/balances/actions'
import { ZERO_CM_FEES, ZERO_STATE_TRADE_INPUTS } from 'state/constants'
import { fetchV3Markets } from 'state/futures/crossMargin/actions'
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
	serializeV2Markets,
	serializePositionHistory,
	serializeTrades,
} from 'utils/futures'
import logError from 'utils/logError'
import { refetchWithComparator } from 'utils/queries'

import {
	AccountContext,
	DebouncedSMPreviewParams,
	DelayedOrderWithDetails,
	PreviewAction,
	SmartMarginTradePreviewParams,
} from '../common/types'
import { ExecuteDelayedOrderInputs } from '../types'

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
	setSmartMarginLeverageInput,
	setLeverageSide,
	setSmartMarginEditPositionInputs,
	incrementCrossPreviewCount,
	setClosePositionSizeDelta,
	setClosePositionPrice,
	clearSmartMarginTradePreviews,
	setKeeperDeposit,
} from './reducer'
import {
	selectSmartMarginAccount,
	selectSmartMarginMarginDelta,
	selectSmartMarginOrderPrice,
	selectSmartMarginSupportedNetwork,
	selectIsConditionalOrder,
	selectKeeperEthBalance,
	selectSmartMarginLeverageSide,
	selectV2MarketAsset,
	selectV2Markets,
	selectOrderType,
	selectOrderFeeCap,
	selectPosition,
	selectSmartMarginTradeInputs,
	selectIdleMargin,
	selectSlTpTradeInputs,
	selectSmartMarginEditPosInputs,
	selectSmartMarginPreviewCount,
	selectTradePreview,
	selectCloseSMPositionOrderInputs,
	selectSmartMarginPositions,
	selectEditPositionModalInfo,
	selectSlTpModalInputs,
	selectSmartMarginKeeperDeposit,
	selectSkewAdjustedPrice,
	selectEditPositionPreview,
	selectClosePositionPreview,
	selectMarketIndexPrice,
	selectV2MarketInfo,
	selectSmartMarginDelayedOrders,
} from './selectors'
import { SmartMarginBalanceInfo } from './types'

export const fetchMarketsV2 = createAsyncThunk<
	{ markets: PerpsMarketV2<string>[]; networkId: NetworkId } | undefined,
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

		const serializedMarkets = serializeV2Markets(overrideMarkets)
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
	{ positions: PerpsV2Position<string>[]; account: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchSmartMarginPositions', async (_, { getState, extra: { sdk } }) => {
	const account = selectSmartMarginAccount(getState())
	const supportedNetwork = selectSmartMarginSupportedNetwork(getState())
	const network = selectNetwork(getState())
	const markets = selectV2Markets(getState())

	if (!account || !supportedNetwork) return
	try {
		const positions = await sdk.futures.getFuturesPositions(
			account,
			markets.map((m) => ({ asset: m.asset, marketKey: m.marketKey, address: m.marketAddress }))
		)
		const serializedPositions = positions.map(
			(p) => serializeWeiObject(p) as PerpsV2Position<string>
		)
		return { positions: serializedPositions, account, network }
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch smart-margin positions', err)
		throw err
	}
})

export const refetchSmartMarginPosition = createAsyncThunk<
	{
		position: PerpsV2Position<string>
		wallet: string
		networkId: NetworkId
	} | null,
	void,
	ThunkConfig
>('futures/refetchSmartMarginPosition', async (type, { getState, extra: { sdk } }) => {
	const account = selectSmartMarginAccount(getState())
	if (!account) throw new Error('No wallet connected')
	const marketInfo = selectV2MarketInfo(getState())
	const networkId = selectNetwork(getState())
	const position = selectPosition(getState())
	if (!marketInfo || !position) throw new Error('Market or position not found')

	const result = await refetchWithComparator(
		() =>
			sdk.futures.getFuturesPositions(account!, [
				{
					asset: marketInfo.asset,
					marketKey: marketInfo.marketKey,
					address: marketInfo.marketAddress,
				},
			]),
		position?.remainingMargin?.toString(),
		(existing, next) => {
			return existing === next[0]?.remainingMargin.toString()
		}
	)

	if (result.data[0]) {
		const serialized = serializeWeiObject(
			result.data[0] as PerpsV2Position
		) as PerpsV2Position<string>
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
	const accounts = getState().smartMargin.accounts

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

export const fetchDailyVolumesV2 = createAsyncThunk<FuturesVolumes<string>, void, ThunkConfig>(
	'futures/fetchDailyVolumesV2',
	async (_, { extra: { sdk } }) => {
		const volumes = await sdk.futures.getDailyVolumes()
		return serializeFuturesVolumes(volumes)
	}
)

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
		await dispatch(fetchMarketsV2())
		await dispatch(fetchV3Markets())
		dispatch(fetchDailyVolumesV2())
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
	const markets = selectV2Markets(getState())
	const existingOrders = selectSmartMarginDelayedOrders(getState())

	const marketAddresses = markets.map((market) => market.marketAddress)

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

export const fetchSmartMarginTradePreview = createAsyncThunk<
	{ preview: FuturesPotentialTradeDetails<string> | null; type: PreviewAction },
	DebouncedSMPreviewParams,
	ThunkConfig
>(
	'futures/fetchSmartMarginTradePreview',
	async (params, { dispatch, getState, extra: { sdk } }) => {
		const account = selectSmartMarginAccount(getState())
		const freeMargin = selectIdleMargin(getState())
		const positions = selectSmartMarginPositions(getState())
		const position = positions.find((p) => p.market.marketKey === params.market.key)

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
			(!position || position.size.abs().eq(0)) && marketMargin.gt(0) && params.action === 'trade'
				? params.marginDelta.sub(marketMargin)
				: params.marginDelta

		try {
			const leverageSide = selectSmartMarginLeverageSide(getState())
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
		dispatch(setSmartMarginLeverageInput(''))
		dispatch(clearSmartMarginTradePreviews())
		dispatch(setSmartMarginTradeInputs(ZERO_STATE_TRADE_INPUTS))
		dispatch(setSmartMarginEditPositionInputs({ nativeSizeDelta: '', marginDelta: '' }))
	}
)

export const editCrossMarginTradeMarginDelta =
	(marginDelta: string): AppThunk =>
	(dispatch, getState) => {
		const orderPrice = selectMarketIndexPrice(getState())
		const marketInfo = selectV2MarketInfo(getState())
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
			dispatch(setSmartMarginLeverageInput(leverage.toString(2)))
		}

		dispatch(
			stageSmartMarginTradePreview({
				market: { key: marketInfo.marketKey, address: marketInfo.marketAddress },
				orderPrice,
				marginDelta: wei(marginDelta || 0),
				sizeDelta: nativeSizeDelta,
				action: 'trade',
			})
		)
	}

export const editSmartMarginTradeSize =
	(size: string, currencyType: 'usd' | 'native'): AppThunk =>
	(dispatch, getState) => {
		const indexPrice = selectMarketIndexPrice(getState())
		const marginDelta = selectSmartMarginMarginDelta(getState())
		const orderPrice = selectSmartMarginOrderPrice(getState())
		const isConditionalOrder = selectIsConditionalOrder(getState())
		const tradeSide = selectSmartMarginLeverageSide(getState())
		const marketInfo = selectV2MarketInfo(getState())
		const price = isConditionalOrder && Number(orderPrice) > 0 ? wei(orderPrice) : indexPrice

		if (!marketInfo) throw new Error('No market selected')

		if (size === '' || price.eq(0)) {
			dispatch(setSmartMarginTradeInputs(ZERO_STATE_TRADE_INPUTS))
			dispatch(setSmartMarginTradePreview({ preview: null, type: 'trade' }))
			dispatch(setSmartMarginLeverageInput(''))
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
		dispatch(setSmartMarginLeverageInput(leverage.toString(2)))
		dispatch(
			stageSmartMarginTradePreview({
				market: {
					key: marketInfo.marketKey,
					address: marketInfo.marketAddress,
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
				stageSmartMarginTradePreview({
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
		const { price } = selectCloseSMPositionOrderInputs(getState())
		const { marketPrice } = selectEditPositionModalInfo(getState())

		try {
			const market = getMarketDetailsByKey(getState, marketKey)
			const smartMarginPrice = isNaN(Number(price)) || !price ? marketPrice : wei(price)
			const odrderPrice = smartMarginPrice
			const previewParams: SmartMarginTradePreviewParams = {
				market,
				sizeDelta: wei(nativeSizeDelta),
				orderPrice: odrderPrice,
				marginDelta: ZERO_WEI,
				action: 'close',
			}
			dispatch(stageSmartMarginTradePreview(previewParams))
		} catch (err) {
			dispatch(handlePreviewError({ error: err.message, previewType: 'close' }))
		}
	}

export const editClosePositionPrice =
	(marketKey: FuturesMarketKey, price: string): AppThunk =>
	(dispatch, getState) => {
		const { nativeSizeDelta, orderType } = selectCloseSMPositionOrderInputs(getState())
		const marketPrice = selectMarketIndexPrice(getState())
		const { position } = selectEditPositionModalInfo(getState())
		const closeTradeSide =
			position?.side === PositionSide.SHORT ? PositionSide.LONG : PositionSide.SHORT
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
				stageSmartMarginTradePreview({
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

export const editSmartMarginPositionMargin =
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
				stageSmartMarginTradePreview({
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
	const marketInfo = selectV2MarketInfo(getState())
	const marginDelta = selectSmartMarginMarginDelta(getState())
	const isConditionalOrder = selectIsConditionalOrder(getState())
	const price = isConditionalOrder && Number(orderPrice) > 0 ? wei(orderPrice) : indexPrice
	const { nativeSizeDelta } = selectSmartMarginTradeInputs(getState())

	if (!marketInfo) throw new Error('No market selected')

	dispatch(
		stageSmartMarginTradePreview({
			market: { key: marketInfo.marketKey, address: marketInfo.marketAddress },
			orderPrice: price,
			marginDelta,
			sizeDelta: nativeSizeDelta,
			action: 'trade',
		})
	)
}

const stageSmartMarginTradePreview = createAsyncThunk<
	void,
	SmartMarginTradePreviewParams,
	ThunkConfig
>('futures/stageSmartMarginTradePreview', async (inputs, { dispatch, getState }) => {
	dispatch(calculateSmartMarginFees(inputs))
	dispatch(incrementCrossPreviewCount())
	const debounceCount = selectSmartMarginPreviewCount(getState())
	debouncedPrepareCrossMarginTradePreview(dispatch, { ...inputs, debounceCount })
})

export const changeLeverageSide =
	(side: PositionSide): AppThunk =>
	(dispatch, getState) => {
		const { nativeSizeString } = selectSmartMarginTradeInputs(getState())
		dispatch(setLeverageSide(side))
		dispatch(editSmartMarginTradeSize(nativeSizeString, 'native'))
	}

export const debouncedPrepareCrossMarginTradePreview = debounce(
	(dispatch, inputs: DebouncedSMPreviewParams) => {
		dispatch(fetchSmartMarginTradePreview(inputs))
	},
	500
)

export const editTradeOrderPrice =
	(price: string): AppThunk =>
	(dispatch, getState) => {
		const rate = selectSkewAdjustedPrice(getState())
		const orderType = selectOrderType(getState())
		const side = selectSmartMarginLeverageSide(getState())
		const inputs = selectSmartMarginTradeInputs(getState())
		dispatch(setSmartMarginOrderPrice(price))
		const invalidLabel = orderPriceInvalidLabel(price, side, rate, orderType)
		dispatch(setSmartMarginOrderPriceInvalidLabel(invalidLabel))
		if (!invalidLabel && price && inputs.susdSize) {
			// Recalc the trade
			dispatch(editSmartMarginTradeSize(inputs.susdSizeString, 'usd'))
		}
	}

export const fetchPositionHistoryV2 = createAsyncThunk<
	| {
			history: FuturesPositionHistory<string>[]
			wallet: string
			networkId: NetworkId
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchPositionHistoryV2', async (_, { getState, extra: { sdk } }) => {
	try {
		const account = selectSmartMarginAccount(getState())
		const networkId = selectNetwork(getState())
		const wallet = selectWallet(getState())
		const supported = selectSmartMarginSupportedNetwork(getState())
		if (!wallet || !account || !supported) return
		const history = await sdk.futures.getPositionHistory(account)
		return { account, wallet, networkId, history: serializePositionHistory(history) }
	} catch (err) {
		notifyError('Failed to fetch position history', err)
		throw err
	}
})

export const fetchTradesForSelectedMarket = createAsyncThunk<
	| {
			trades: FuturesTrade<string>[]
			account: string
			wallet: string
			networkId: NetworkId
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchTradesForSelectedMarket', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState())
		const networkId = selectNetwork(getState())
		const marketAsset = selectV2MarketAsset(getState())
		const account = selectSmartMarginAccount(getState())
		const futuresSupported = selectSmartMarginSupportedNetwork(getState())

		if (!futuresSupported || !wallet || !account) return
		const trades = await sdk.futures.getTradesForMarket(
			marketAsset,
			wallet,
			FuturesMarginType.SMART_MARGIN
		)
		return { trades: serializeTrades(trades), networkId, account, wallet }
	} catch (err) {
		notifyError('Failed to fetch futures trades for selected market', err)
		throw err
	}
})

export const fetchAllV2TradesForAccount = createAsyncThunk<
	| {
			trades: FuturesTrade<string>[]
			account: string
			wallet: string
			networkId: NetworkId
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchAllV2TradesForAccount', async (_, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState())
		const networkId = selectNetwork(getState())
		const account = selectSmartMarginAccount(getState())
		const futuresSupported = selectSmartMarginSupportedNetwork(getState())
		if (!futuresSupported || !wallet || !account) return
		const trades = await sdk.futures.getAllTrades(wallet, FuturesMarginType.SMART_MARGIN, 200)
		return { trades: serializeTrades(trades), networkId, account, wallet }
	} catch (err) {
		notifyError('Failed to fetch futures trades', err)
		throw err
	}
})

export const calculateSmartMarginFees =
	(params: SmartMarginTradePreviewParams): AppThunk =>
	(dispatch, getState) => {
		const markets = selectV2Markets(getState())
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

export const fetchMarginTransfersV2 = createAsyncThunk<
	| {
			marginTransfers: MarginTransfer[]
			idleTransfers: MarginTransfer[]
			context: AccountContext
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchMarginTransfersV2', async (_, { getState, extra: { sdk } }) => {
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

export const fetchFuturesFees = createAsyncThunk<
	{
		totalFuturesFeePaid: string
	},
	{
		start: number
		end: number
	},
	ThunkConfig
>('futures/fetchFuturesFees', async ({ start, end }, { extra: { sdk } }) => {
	try {
		const totalFuturesFeePaid = await sdk.kwentaToken.getFuturesFee(start, end)
		return { totalFuturesFeePaid: totalFuturesFeePaid.toString() }
	} catch (err) {
		notifyError('Failed to fetch futures fees', err)
		throw err
	}
})

export const fetchFuturesFeesForAccount = createAsyncThunk<
	{
		futuresFeePaid: string
	},
	{
		start: number
		end: number
	},
	ThunkConfig
>('futures/fetchFuturesFeesForAccount', async ({ start, end }, { getState, extra: { sdk } }) => {
	try {
		const wallet = selectWallet(getState())
		const futuresFeePaid = await sdk.kwentaToken.getFuturesFeeForAccount(wallet!, start, end)
		return { futuresFeePaid: futuresFeePaid.toString() }
	} catch (err) {
		notifyError('Failed to fetch futures fees for the account', err)
		throw err
	}
})

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
		const accounts = getState().smartMargin.accounts

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
		await submitSMTransferTransaction(dispatch, sdk, 'withdraw_smart_margin', account, amount)
	}
)

export const approveSmartMargin = createAsyncThunk<void, void, ThunkConfig>(
	'futures/approveSmartMargin',
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

export const submitSmartMarginOrder = createAsyncThunk<void, boolean, ThunkConfig>(
	'futures/submitSmartMarginOrder',
	async (overridePriceProtection, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectV2MarketInfo(getState())
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
		const openDelayedOrders = selectSmartMarginDelayedOrders(getState())
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
				(o) => o.isStale && o.market.marketKey === marketInfo.marketKey
			)

			const tx = await sdk.futures.submitSmartMarginOrder(
				{ address: marketInfo.marketAddress, key: marketInfo.marketKey },
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
				market.marketAddress,
				wei(marginDelta)
			)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(setOpenModal(null))
			dispatch(refetchSmartMarginPosition())
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

			let existingSize = position?.size ?? wei(0)
			existingSize = position?.side === PositionSide.SHORT ? existingSize.neg() : existingSize
			const isClosing = existingSize.add(nativeSizeDelta).eq(0)

			const tx = await sdk.futures.modifySmartMarginPositionSize(
				account,
				{
					key: market.marketKey,
					address: market.marketAddress,
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
		const { nativeSizeDelta, orderType, price } = selectCloseSMPositionOrderInputs(getState())
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
				.eq(position?.size.abs() || 0)

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
							{ address: market.marketAddress, key: market.marketKey },
							account,
							preview.desiredFillPrice
					  )
					: await sdk.futures.submitSmartMarginOrder(
							{ address: market.marketAddress, key: market.marketKey },
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

export const executeDelayedOrder = createAsyncThunk<void, ExecuteDelayedOrderInputs, ThunkConfig>(
	'futures/executeDelayedOrder',
	async ({ marketKey, marketAddress }, { getState, dispatch, extra: { sdk } }) => {
		const account = selectSmartMarginAccount(getState())
		if (!account) throw new Error('No wallet connected')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'execute_delayed_isolated',
					hash: null,
				})
			)
			const tx = await sdk.futures.executeDelayedOffchainOrder(marketKey, marketAddress, account)
			dispatch(updateTransactionHash(tx.hash))
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchSmartMarginOpenOrders())
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
	type: 'withdraw_smart_margin' | 'deposit_smart_margin',
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
			type === 'deposit_smart_margin'
				? await sdk.futures.depositSmartMarginAccount(account, amount)
				: await sdk.futures.withdrawSmartMarginAccount(account, amount)
		await monitorAndAwaitTransaction(dispatch, tx)
		dispatch(fetchSmartMarginBalanceInfo())
		dispatch(setOpenModal(null))
		dispatch(refetchSmartMarginPosition())
		dispatch(fetchBalances())
		dispatch(fetchMarginTransfersV2())
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
				position?.side === PositionSide.LONG ? SL_TP_MAX_SIZE.neg() : SL_TP_MAX_SIZE

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

const getMarketDetailsByKey = (getState: () => RootState, key: FuturesMarketKey) => {
	const markets = selectV2Markets(getState())
	const market = markets.find((m) => {
		return m.marketKey === key
	})
	if (!market) throw new Error(`No market info found for ${key}`)
	return {
		address: market.marketAddress,
		key: market.marketKey,
	}
}
