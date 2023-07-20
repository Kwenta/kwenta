import KwentaSDK from '@kwenta/sdk'
import {
	DEFAULT_PRICE_IMPACT_DELTA_PERCENT,
	ORDER_KEEPER_ETH_DEPOSIT,
	PERIOD_IN_SECONDS,
	Period,
	SL_TP_MAX_SIZE,
	ZERO_ADDRESS,
	ZERO_WEI,
} from '@kwenta/sdk/constants'
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
	PositionSide,
	PotentialTradeStatus,
	SmartMarginOrderInputs,
	ConditionalOrderTypeEnum,
	SLTPOrderInputs,
	FuturesMarketKey,
	ContractOrderType,
	FuturesMarketAsset,
	NetworkId,
	TransactionStatus,
} from '@kwenta/sdk/types'
import {
	calculateDesiredFillPrice,
	getTradeStatusMessage,
	serializePotentialTrade,
	marketOverrides,
	floorNumber,
	stripZeros,
	getTransactionPrice,
} from '@kwenta/sdk/utils'
import { createAsyncThunk } from '@reduxjs/toolkit'
import Wei, { wei } from '@synthetixio/wei'
import { BigNumber, ethers } from 'ethers'
import { debounce } from 'lodash'

import { notifyError } from 'components/ErrorNotifier'
import { unserializeGasPrice } from 'state/app/helpers'
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
import { serializeWeiObject } from 'state/helpers'
import { selectLatestEthPrice } from 'state/prices/selectors'
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
	setTransactionEstimate,
	setCrossMarginEditPositionInputs,
	setIsolatedMarginEditPositionInputs,
	incrementIsolatedPreviewCount,
	incrementCrossPreviewCount,
	setClosePositionSizeDelta,
	setClosePositionPrice,
	clearAllTradePreviews,
	setKeeperDeposit,
} from './reducer'
import {
	selectCrossMarginAccount,
	selectCrossMarginMarginDelta,
	selectCrossMarginOrderPrice,
	selectCrossMarginTradeInputs,
	selectFuturesAccount,
	selectFuturesSupportedNetwork,
	selectFuturesType,
	selectIsConditionalOrder,
	selectIsolatedMarginTradeInputs,
	selectKeeperEthBalance,
	selectLeverageSide,
	selectMarketAsset,
	selectMarketInfo,
	selectMarketKey,
	selectMarkets,
	selectOrderType,
	selectOrderFeeCap,
	selectPosition,
	selectTradeSizeInputs,
	selectIdleMargin,
	selectSlTpTradeInputs,
	selectCrossMarginEditPosInputs,
	selectCrossPreviewCount,
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
	CancelDelayedOrderInputs,
	CrossMarginBalanceInfo,
	DebouncedPreviewParams,
	DelayedOrderWithDetails,
	ExecuteDelayedOrderInputs,
	FuturesTransactionType,
	PreviewAction,
	TradePreviewParams,
} from './types'

export const fetchMarkets = createAsyncThunk<
	{ markets: FuturesMarket<string>[]; networkId: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchMarkets', async (_, { getState, extra: { sdk } }) => {
	const supportedNetwork = selectFuturesSupportedNetwork(getState())
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

export const fetchCrossMarginBalanceInfo = createAsyncThunk<
	{ balanceInfo: CrossMarginBalanceInfo<string>; account: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>(
	'futures/fetchCrossMarginBalanceInfo',
	async (_, { getState, extra: { sdk }, rejectWithValue }) => {
		const account = selectCrossMarginAccount(getState())
		const network = selectNetwork(getState())
		const wallet = selectWallet(getState())
		const crossMarginSupported = selectFuturesSupportedNetwork(getState())
		if (!account || !wallet || !crossMarginSupported) return
		try {
			const balanceInfo = await sdk.futures.getCrossMarginBalanceInfo(wallet, account)
			return { balanceInfo: serializeCmBalanceInfo(balanceInfo), account, network }
		} catch (err) {
			logError(err)
			notifyError('Failed to fetch cross-margin balance info', err)
			rejectWithValue(err.message)
			return undefined
		}
	}
)

export const fetchCrossMarginPositions = createAsyncThunk<
	{ positions: FuturesPosition<string>[]; account: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchCrossMarginPositions', async (_, { getState, extra: { sdk } }) => {
	const account = selectCrossMarginAccount(getState())
	const supportedNetwork = selectFuturesSupportedNetwork(getState())
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

export const fetchIsolatedMarginPositions = createAsyncThunk<
	{ positions: FuturesPosition<string>[]; wallet: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchIsolatedMarginPositions', async (_, { getState, extra: { sdk } }) => {
	const { wallet } = getState()
	const supportedNetwork = selectFuturesSupportedNetwork(getState())
	const network = selectNetwork(getState())
	const markets = selectMarkets(getState())

	if (!wallet.walletAddress || !supportedNetwork) return
	try {
		const positions = await sdk.futures.getFuturesPositions(
			wallet.walletAddress,
			markets.map((m) => ({ asset: m.asset, marketKey: m.marketKey, address: m.market }))
		)
		return {
			positions: positions.map((p) => serializeWeiObject(p) as FuturesPosition<string>),
			wallet: wallet.walletAddress,
			network: network,
		}
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch isolated margin positions', err)
		throw err
	}
})

export const refetchPosition = createAsyncThunk<
	{
		position: FuturesPosition<string>
		wallet: string
		futuresType: FuturesAccountType
		networkId: NetworkId
	} | null,
	FuturesAccountType,
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

export const fetchCrossMarginAccount = createAsyncThunk<
	{ account: string; wallet: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchCrossMarginAccount', async (_, { getState, extra: { sdk }, rejectWithValue }) => {
	const wallet = selectWallet(getState())
	const supportedNetwork = selectFuturesSupportedNetwork(getState())
	const network = selectNetwork(getState())
	if (!wallet || !supportedNetwork) return undefined
	const accounts = getState().futures.crossMargin.accounts

	// Already have an accoutn fetched and persisted for this address
	if (accounts[network]?.[wallet]?.account) return

	try {
		const accounts = await sdk.futures.getCrossMarginAccounts(wallet)
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
	const supportedNetwork = selectFuturesSupportedNetwork(getState())
	const network = selectNetwork(getState())
	const cmAccount = selectCrossMarginAccount(getState())
	if (!wallet.walletAddress || !supportedNetwork) return
	try {
		const transfers =
			futures.selectedType === 'cross_margin'
				? await sdk.futures.getIsolatedMarginTransfers(cmAccount)
				: await sdk.futures.getIsolatedMarginTransfers()

		const idleTransfers =
			futures.selectedType === 'cross_margin'
				? await sdk.futures.getCrossMarginTransfers(cmAccount)
				: []

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
			isolatedMarginTransfers: MarginTransfer[]
			smartMarginTransfers: MarginTransfer[]
			idleTransfers: MarginTransfer[]
			context: AccountContext
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchCombinedMarginTransfers', async (_, { getState, extra: { sdk } }) => {
	const { wallet, futures } = getState()
	const supportedNetwork = selectFuturesSupportedNetwork(getState())
	const network = selectNetwork(getState())
	const cmAccount = selectCrossMarginAccount(getState())
	if (!wallet.walletAddress || !supportedNetwork) return
	try {
		const isolatedMarginTransfers = await sdk.futures.getIsolatedMarginTransfers()
		const smartMarginTransfers = cmAccount
			? await sdk.futures.getIsolatedMarginTransfers(cmAccount)
			: []
		const idleTransfers = cmAccount ? await sdk.futures.getCrossMarginTransfers(cmAccount) : []

		return {
			isolatedMarginTransfers,
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

export const fetchCrossMarginAccountData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchCrossMarginAccountData',
	async (_, { dispatch }) => {
		dispatch(fetchCrossMarginPositions())
		dispatch(fetchCrossMarginBalanceInfo())
	}
)

export const fetchIsolatedMarginAccountData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchIsolatedMarginAccountData',
	async (_, { dispatch }) => {
		dispatch(fetchIsolatedMarginPositions())
	}
)

export const fetchSharedFuturesData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchSharedFuturesData',
	async (_, { dispatch }) => {
		await dispatch(fetchMarkets())
		dispatch(fetchDailyVolumes())
	}
)

export const fetchIsolatedOpenOrders = createAsyncThunk<
	{ orders: DelayedOrderWithDetails<string>[]; wallet: string; networkId: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchIsolatedOpenOrders', async (_, { dispatch, getState, extra: { sdk } }) => {
	const wallet = selectWallet(getState())
	const supportedNetwork = selectFuturesSupportedNetwork(getState())
	const network = selectNetwork(getState())
	const markets = selectMarkets(getState())
	const existingOrders = selectOpenDelayedOrders(getState())
	if (!wallet || !supportedNetwork || !markets.length) return

	const marketAddresses = markets.map((market) => market.market)

	const orders: DelayedOrder[] = await sdk.futures.getDelayedOrders(wallet, marketAddresses)
	const nonzeroOrders = formatDelayedOrders(orders, markets)
	const orderDropped = existingOrders.length > nonzeroOrders.length
	if (orderDropped) {
		dispatch(fetchIsolatedMarginPositions())
	}

	return {
		networkId: network,
		orders: serializeDelayedOrders(nonzeroOrders),
		wallet: wallet,
	}
})

export const fetchCrossMarginOpenOrders = createAsyncThunk<
	| {
			conditionalOrders: ConditionalOrder<string>[]
			delayedOrders: DelayedOrderWithDetails<string>[]
			account: string
			network: NetworkId
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchCrossMarginOpenOrders', async (_, { dispatch, getState, extra: { sdk } }) => {
	const account = selectCrossMarginAccount(getState())
	const supportedNetwork = selectFuturesSupportedNetwork(getState())
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
			dispatch(fetchCrossMarginPositions())
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

export const fetchIsolatedMarginTradePreview = createAsyncThunk<
	{ preview: FuturesPotentialTradeDetails<string> | null; type: PreviewAction },
	DebouncedPreviewParams,
	ThunkConfig
>(
	'futures/fetchIsolatedMarginTradePreview',
	async (params, { dispatch, getState, extra: { sdk } }) => {
		const account = selectFuturesAccount(getState())
		const markets = selectMarkets(getState())

		const market = markets.find((m) => m.marketKey === params.market.key)

		try {
			const orderTypeNum = ContractOrderType.DELAYED_OFFCHAIN
			if (!market) throw new Error('No market data provided for preview')
			if (!account) throw new Error('No account to generate preview')
			if (!params.orderPrice) throw new Error('No price provided for preview')
			const leverageSide = selectLeverageSide(getState())

			const preview = await sdk.futures.getIsolatedTradePreview(
				params.market.address,
				params.market.key,
				orderTypeNum,
				{
					sizeDelta: params.sizeDelta,
					price: params.orderPrice,
					leverageSide,
				}
			)

			const serializedPreview = serializePotentialTrade({
				...preview,
				marketKey: params.market.key,
			})
			return { preview: serializedPreview, type: params.action }
		} catch (err) {
			logError(err)
			notifyError('Failed to generate trade preview', err)
			dispatch(handlePreviewError({ error: err.message, previewType: params.action }))
			throw err
		}
	}
)

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
			const preview = await sdk.futures.getCrossMarginTradePreview(
				account || ZERO_ADDRESS,
				params.market.key,
				params.market.address,
				{ ...params, leverageSide, marginDelta }
			)

			// Check the preview hasn't been cleared before query resolves
			const count = selectCrossPreviewCount(getState())
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
		dispatch(setCrossMarginMarginDelta(''))
		dispatch(setCrossMarginFees(ZERO_CM_FEES))
		dispatch(setIsolatedMarginFee('0'))
		dispatch(setLeverageInput(''))
		dispatch(clearAllTradePreviews())
		dispatch(setCrossMarginTradeInputs(ZERO_STATE_TRADE_INPUTS))
		dispatch(setIsolatedMarginTradeInputs(ZERO_STATE_TRADE_INPUTS))
		dispatch(setCrossMarginEditPositionInputs({ nativeSizeDelta: '', marginDelta: '' }))
		dispatch(setIsolatedMarginEditPositionInputs({ nativeSizeDelta: '', marginDelta: '' }))
	}
)

export const editCrossMarginTradeMarginDelta =
	(marginDelta: string): AppThunk =>
	(dispatch, getState) => {
		const orderPrice = selectMarketIndexPrice(getState())
		const marketInfo = selectMarketInfo(getState())
		const { susdSize, nativeSizeDelta } = selectCrossMarginTradeInputs(getState())

		if (!marketInfo) throw new Error('No market selected')

		if (!marginDelta || Number(marginDelta) === 0) {
			dispatch(setCrossMarginMarginDelta(marginDelta))
			dispatch(setCrossMarginTradePreview({ preview: null, type: 'trade' }))
			return
		}

		const marginDelatWei = wei(marginDelta)
		const leverage = wei(susdSize).div(marginDelatWei.abs())

		dispatch(setCrossMarginMarginDelta(marginDelta))
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
		const marginDelta = selectCrossMarginMarginDelta(getState())
		const orderPrice = selectCrossMarginOrderPrice(getState())
		const isConditionalOrder = selectIsConditionalOrder(getState())
		const tradeSide = selectLeverageSide(getState())
		const marketInfo = selectMarketInfo(getState())
		const price = isConditionalOrder && Number(orderPrice) > 0 ? wei(orderPrice) : indexPrice

		if (!marketInfo) throw new Error('No market selected')

		if (size === '' || price.eq(0)) {
			dispatch(setCrossMarginTradeInputs(ZERO_STATE_TRADE_INPUTS))
			dispatch(setCrossMarginTradePreview({ preview: null, type: 'trade' }))
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
			setCrossMarginTradeInputs({
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
			setCrossMarginEditPositionInputs({
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
			dispatch(setIsolatedTradePreview({ preview: null, type: 'close' }))
			dispatch(setCrossMarginTradePreview({ preview: null, type: 'close' }))
			return
		}
		const { price } = selectClosePositionOrderInputs(getState())
		const { marketPrice } = selectEditPositionModalInfo(getState())
		const accountType = selectFuturesType(getState())

		try {
			const market = getMarketDetailsByKey(getState, marketKey)
			const smartMarginPrice = isNaN(Number(price)) || !price ? marketPrice : wei(price)
			const odrderPrice = accountType === 'isolated_margin' ? marketPrice : smartMarginPrice
			const previewParams: TradePreviewParams = {
				market,
				sizeDelta: wei(nativeSizeDelta),
				orderPrice: odrderPrice,
				marginDelta: ZERO_WEI,
				action: 'close',
			}
			if (accountType === 'isolated_margin') {
				dispatch(stageIsolatedMarginTradePreview(previewParams))
			} else {
				dispatch(stageCrossMarginTradePreview(previewParams))
			}
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
			setCrossMarginEditPositionInputs({
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
	const orderPrice = selectCrossMarginOrderPrice(getState())
	const indexPrice = selectMarketIndexPrice(getState())
	const marketInfo = selectMarketInfo(getState())
	const marginDelta = selectCrossMarginMarginDelta(getState())
	const isConditionalOrder = selectIsConditionalOrder(getState())
	const price = isConditionalOrder && Number(orderPrice) > 0 ? wei(orderPrice) : indexPrice
	const { nativeSizeDelta } = selectCrossMarginTradeInputs(getState())

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
		dispatch(calculateCrossMarginFees(inputs))
		dispatch(incrementCrossPreviewCount())
		const debounceCount = selectCrossPreviewCount(getState())
		debouncedPrepareCrossMarginTradePreview(dispatch, { ...inputs, debounceCount })
	}
)

const stageIsolatedMarginTradePreview = createAsyncThunk<void, TradePreviewParams, ThunkConfig>(
	'futures/stageIsolatedMarginTradePreview',
	async (inputs, { dispatch, getState }) => {
		dispatch(incrementCrossPreviewCount())
		const debounceCount = selectCrossPreviewCount(getState())
		debouncedPrepareIsolatedMarginTradePreview(dispatch, { ...inputs, debounceCount })
	}
)

export const editIsolatedMarginSize =
	(size: string, currencyType: 'usd' | 'native'): AppThunk =>
	(dispatch, getState) => {
		const marketPrice = selectMarketIndexPrice(getState())
		const position = selectPosition(getState())
		const marketKey = selectMarketKey(getState())
		const tradeSide = selectLeverageSide(getState())

		if (
			size === '' ||
			marketPrice.eq(0) ||
			!position?.remainingMargin ||
			position?.remainingMargin.eq(0)
		) {
			dispatch(setIsolatedMarginTradeInputs(ZERO_STATE_TRADE_INPUTS))
			dispatch(setIsolatedTradePreview({ preview: null, type: 'edit' }))
			dispatch(setLeverageInput(''))
			return
		}

		const market = getMarketDetailsByKey(getState, marketKey)

		const nativeSize = currencyType === 'native' ? size : wei(size).div(marketPrice).toString()
		const usdSize = currencyType === 'native' ? stripZeros(marketPrice.mul(size).toString()) : size
		const leverage =
			Number(usdSize) > 0 && position?.remainingMargin.gt(0)
				? wei(usdSize).div(position?.remainingMargin).toString(2)
				: ''
		const nativeSizeDelta =
			tradeSide === PositionSide.LONG ? wei(nativeSize) : wei(nativeSize).neg()

		dispatch(setLeverageInput(leverage))
		dispatch(
			setIsolatedMarginTradeInputs({
				susdSize: usdSize,
				nativeSize: nativeSize,
			})
		)
		dispatch(calculateIsolatedMarginFees())
		dispatch(incrementIsolatedPreviewCount())
		dispatch(
			stageIsolatedMarginTradePreview({
				market,
				sizeDelta: nativeSizeDelta,
				orderPrice: marketPrice,
				marginDelta: ZERO_WEI,
				action: 'trade',
			})
		)
	}

export const editTradeSizeInput =
	(size: string, currencyType: 'usd' | 'native'): AppThunk =>
	(dispatch, getState) => {
		const type = selectFuturesType(getState())
		if (type === 'cross_margin') {
			dispatch(editCrossMarginTradeSize(size, currencyType))
		} else {
			dispatch(editIsolatedMarginSize(size, currencyType))
		}
	}

export const changeLeverageSide =
	(side: PositionSide): AppThunk =>
	(dispatch, getState) => {
		const { nativeSizeString } = selectTradeSizeInputs(getState())
		dispatch(setLeverageSide(side))
		dispatch(editTradeSizeInput(nativeSizeString, 'native'))
	}

export const setCrossMarginLeverage =
	(leverage: string): AppThunk =>
	(dispatch, getState) => {
		const marketKey = selectMarketKey(getState())
		dispatch(setCrossMarginLeverageForAsset({ marketKey: marketKey, leverage: leverage }))
	}

export const debouncedPrepareCrossMarginTradePreview = debounce(
	(dispatch, inputs: DebouncedPreviewParams) => {
		dispatch(fetchCrossMarginTradePreview(inputs))
	},
	500
)

export const debouncedPrepareIsolatedMarginTradePreview = debounce(
	(dispatch, inputs: DebouncedPreviewParams) => {
		dispatch(fetchIsolatedMarginTradePreview(inputs))
	},
	500
)

export const editTradeOrderPrice =
	(price: string): AppThunk =>
	(dispatch, getState) => {
		const rate = selectSkewAdjustedPrice(getState())
		const orderType = selectOrderType(getState())
		const side = selectLeverageSide(getState())
		const inputs = selectCrossMarginTradeInputs(getState())
		dispatch(setCrossMarginOrderPrice(price))
		const invalidLabel = orderPriceInvalidLabel(price, side, rate, orderType)
		dispatch(setCrossMarginOrderPriceInvalidLabel(invalidLabel))
		if (!invalidLabel && price && inputs.susdSize) {
			// Recalc the trade
			dispatch(editCrossMarginTradeSize(inputs.susdSizeString, 'usd'))
		}
	}

export const fetchFuturesPositionHistory = createAsyncThunk<
	| {
			accountType: FuturesAccountType
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
		const futuresSupported = selectFuturesSupportedNetwork(getState())
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
		const futuresSupported = selectFuturesSupportedNetwork(getState())
		if (!futuresSupported) return
		const history = await sdk.futures.getCompletePositionHistory(traderAddress)
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
			accountType: FuturesAccountType
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
		const futuresSupported = selectFuturesSupportedNetwork(getState())

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
			accountType: FuturesAccountType
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
		const futuresSupported = selectFuturesSupportedNetwork(getState())
		if (!futuresSupported || !wallet || !account) return
		const trades = await sdk.futures.getAllTrades(wallet, accountType, 200)
		return { trades: serializeTrades(trades), networkId, account, accountType, wallet }
	} catch (err) {
		notifyError('Failed to fetch futures trades', err)
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

export const calculateCrossMarginFees =
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
		dispatch(setCrossMarginFees(fees))
	}

export const calculateKeeperDeposit = (): AppThunk => (dispatch, getState) => {
	const keeperBalance = selectKeeperEthBalance(getState())
	const requiredDeposit = keeperBalance.lt(ORDER_KEEPER_ETH_DEPOSIT)
		? ORDER_KEEPER_ETH_DEPOSIT.sub(keeperBalance)
		: wei(0)

	dispatch(setKeeperDeposit(requiredDeposit.toString()))
}

export const calculateIsolatedMarginFees = (): AppThunk => (dispatch, getState) => {
	const market = selectMarketInfo(getState())
	const { susdSizeDelta } = selectIsolatedMarginTradeInputs(getState())
	const { delayedOrderFee } = computeDelayedOrderFee(market, susdSizeDelta)
	dispatch(setIsolatedMarginFee(delayedOrderFee.toString()))
}

// Contract Mutations

export const createCrossMarginAccount = createAsyncThunk<
	{ account: string; wallet: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>(
	'futures/createCrossMarginAccount',
	async (_, { getState, dispatch, extra: { sdk }, rejectWithValue }) => {
		const wallet = selectWallet(getState())
		const supportedNetwork = selectFuturesSupportedNetwork(getState())
		const network = selectNetwork(getState())
		if (!wallet || !supportedNetwork) return undefined
		const accounts = getState().futures.crossMargin.accounts

		// Already have an accoutn fetched and persisted for this address
		if (accounts[network]?.[wallet]?.account) {
			notifyError('There is already an account associated with this wallet')
			rejectWithValue('Account already created')
		}

		try {
			const accounts = await sdk.futures.getCrossMarginAccounts()
			// Check for existing account on the contract as only one account per user
			if (accounts[0]) {
				dispatch(setCrossMarginAccount({ account: accounts[0], wallet: wallet, network }))
				return
			}

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'create_cross_margin_account',
					hash: null,
				})
			)
			const tx = await sdk.futures.createCrossMarginAccount()
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchCrossMarginAccount())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
		}
	}
)

export const depositCrossMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/depositCrossMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const account = selectCrossMarginAccount(getState())
		if (!account) {
			notifyError('No smart margin account')
			return
		}
		await submitCMTransferTransaction(dispatch, sdk, 'deposit_cross_margin', account, amount)
	}
)

export const withdrawCrossMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/withdrawCrossMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const account = selectCrossMarginAccount(getState())
		if (!account) {
			notifyError('No smart margin account')
			return
		}
		await submitCMTransferTransaction(dispatch, sdk, 'withdraw_cross_margin', account, amount)
	}
)

export const approveCrossMargin = createAsyncThunk<void, void, ThunkConfig>(
	'futures/approveCrossMargin',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const account = selectCrossMarginAccount(getState())
		if (!account) throw new Error('No smart margin account')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'approve_cross_margin',
					hash: null,
				})
			)
			const tx = await sdk.futures.approveCrossMarginDeposit(account)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchCrossMarginBalanceInfo())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const depositIsolatedMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/depositIsolatedMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState())
		if (!marketInfo) throw new Error('Market info not found')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'deposit_isolated',
					hash: null,
				})
			)
			const tx = await sdk.futures.depositIsolatedMargin(marketInfo.market, amount)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(setOpenModal(null))
			dispatch(refetchPosition('isolated_margin'))
			dispatch(fetchBalances())
			dispatch(fetchMarginTransfers())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const withdrawIsolatedMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/withdrawIsolatedMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState())
		if (!marketInfo) throw new Error('Market info not found')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'withdraw_isolated',
					hash: null,
				})
			)
			const tx = await sdk.futures.withdrawIsolatedMargin(marketInfo.market, amount)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(refetchPosition('isolated_margin'))
			dispatch(setOpenModal(null))
			dispatch(fetchBalances())
			dispatch(fetchMarginTransfers())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const modifyIsolatedPosition = createAsyncThunk<void, void, ThunkConfig>(
	'futures/modifyIsolatedPosition',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const account = selectFuturesAccount(getState())
		const marketInfo = selectMarketInfo(getState())
		const preview = selectTradePreview(getState())
		const desiredFillPrice = preview?.desiredFillPrice ?? wei(0)
		const { nativeSizeDelta } = selectTradeSizeInputs(getState())
		try {
			if (!marketInfo) throw new Error('Market info not found')
			if (!account) throw new Error('Account not connected')

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'modify_isolated',
					hash: null,
				})
			)
			const tx = await sdk.futures.submitIsolatedMarginOrder(
				marketInfo.market,
				wei(nativeSizeDelta),
				desiredFillPrice
			)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchIsolatedOpenOrders())
			dispatch(setOpenModal(null))
			dispatch(clearTradeInputs())
			dispatch(fetchBalances())
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
			dispatch(fetchIsolatedOpenOrders())
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
			dispatch(fetchIsolatedOpenOrders())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const submitCrossMarginOrder = createAsyncThunk<void, boolean, ThunkConfig>(
	'futures/submitCrossMarginOrder',
	async (overridePriceProtection, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState())
		const account = selectCrossMarginAccount(getState())
		const tradeInputs = selectCrossMarginTradeInputs(getState())
		const marginDelta = selectCrossMarginMarginDelta(getState())
		const feeCap = selectOrderFeeCap(getState())
		const orderType = selectOrderType(getState())
		const orderPrice = selectCrossMarginOrderPrice(getState())
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

			const tx = await sdk.futures.submitCrossMarginOrder(
				{ address: marketInfo.market, key: marketInfo.marketKey },
				wallet,
				account,
				orderInputs,
				{ cancelPendingReduceOrders: isClosing, cancelExpiredDelayedOrders: !!staleOrder }
			)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchCrossMarginOpenOrders())
			dispatch(setOpenModal(null))
			dispatch(fetchBalances())
			dispatch(clearTradeInputs())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const submitCrossMarginAdjustMargin = createAsyncThunk<void, void, ThunkConfig>(
	'futures/submitCrossMarginAdjustMargin',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const { market } = selectEditPositionModalInfo(getState())
		const account = selectCrossMarginAccount(getState())
		const { marginDelta } = selectCrossMarginEditPosInputs(getState())

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
			dispatch(refetchPosition('cross_margin'))
			dispatch(fetchBalances())
			dispatch(clearTradeInputs())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const submitCrossMarginAdjustPositionSize = createAsyncThunk<void, boolean, ThunkConfig>(
	'futures/submitCrossMarginAdjustPositionSize',
	async (overridePriceProtection, { getState, dispatch, extra: { sdk } }) => {
		const { market, position } = selectEditPositionModalInfo(getState())
		const account = selectCrossMarginAccount(getState())
		const preview = selectEditPositionPreview(getState())
		const { nativeSizeDelta } = selectCrossMarginEditPosInputs(getState())

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
		const account = selectCrossMarginAccount(getState())
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
					? await sdk.futures.closeCrossMarginPosition(
							{ address: market.market, key: market.marketKey },
							account,
							preview.desiredFillPrice
					  )
					: await sdk.futures.submitCrossMarginOrder(
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

export const submitIsolatedMarginReducePositionOrder = createAsyncThunk<void, void, ThunkConfig>(
	'futures/submitIsolatedMarginReducePositionOrder',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const { market } = selectEditPositionModalInfo(getState())
		const closePreview = selectClosePositionPreview(getState())
		const { nativeSizeDelta } = selectClosePositionOrderInputs(getState())
		const wallet = selectWallet(getState())

		try {
			if (!market) throw new Error('Market info not found')
			if (!wallet) throw new Error('No wallet connected')
			if (!closePreview) throw new Error('Failed to generate trade preview')
			if (!nativeSizeDelta || nativeSizeDelta === '') throw new Error('No size amount set')

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'modify_isolated',
					hash: null,
				})
			)

			const tx = await sdk.futures.submitIsolatedMarginOrder(
				market.market,
				wei(nativeSizeDelta),
				closePreview.desiredFillPrice
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

export const cancelConditionalOrder = createAsyncThunk<void, number, ThunkConfig>(
	'futures/cancelConditionalOrder',
	async (contractOrderId, { getState, dispatch, extra: { sdk } }) => {
		const crossMarginAccount = selectCrossMarginAccount(getState())
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

			dispatch(setCrossMarginOrderCancelling(contractOrderId))
			const tx = await sdk.futures.cancelConditionalOrder(crossMarginAccount, contractOrderId)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(setCrossMarginOrderCancelling(undefined))
			dispatch(setOpenModal(null))
			dispatch(fetchCrossMarginOpenOrders())
		} catch (err) {
			dispatch(setCrossMarginOrderCancelling(undefined))
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const withdrawAccountKeeperBalance = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/withdrawAccountKeeperBalance',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const crossMarginAccount = selectCrossMarginAccount(getState())
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
			dispatch(fetchCrossMarginBalanceInfo())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

// Utils

export const estimateGasInteralAction = async (
	gasLimitEstimate: () => Promise<BigNumber>,
	type: FuturesTransactionType,
	config: {
		getState: () => RootState
		dispatch: AppDispatch
	}
) => {
	const { app } = config.getState()
	const ethPrice = selectLatestEthPrice(config.getState())

	try {
		const limit = await gasLimitEstimate()
		const estimate = getTransactionPrice(unserializeGasPrice(app.gasPrice), limit, ethPrice, wei(0))

		config.dispatch(
			setTransactionEstimate({
				type: type,
				limit: limit.toString(),
				cost: estimate?.toString() ?? '0',
			})
		)
	} catch (err) {
		config.dispatch(
			setTransactionEstimate({
				type: type,
				limit: '0',
				cost: '0',
				error: err.message,
			})
		)
		throw err
	}
}

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
	)

	try {
		const tx =
			type === 'deposit_cross_margin'
				? await sdk.futures.depositCrossMarginAccount(account, amount)
				: await sdk.futures.withdrawCrossMarginAccount(account, amount)
		await monitorAndAwaitTransaction(dispatch, tx)
		dispatch(fetchCrossMarginBalanceInfo())
		dispatch(setOpenModal(null))
		dispatch(refetchPosition('cross_margin'))
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
		const account = selectCrossMarginAccount(getState())
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
	{ marketAsset: FuturesMarketAsset; period: Period },
	ThunkConfig
>('futures/fetchFundingRatesHistory', async ({ marketAsset, period }, { extra: { sdk } }) => {
	const rates = await sdk.futures.getMarketFundingRatesHistory(
		marketAsset,
		PERIOD_IN_SECONDS[period]
	)
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
