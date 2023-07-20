import {
	DelayedOrder,
	FuturesMarket,
	FuturesPosition,
	FuturesPositionHistory,
	NetworkId,
	PositionSide,
	PotentialTradeStatus,
	SynthV3Asset,
	TransactionStatus,
} from '@kwenta/sdk/types'
import { floorNumber } from '@kwenta/sdk/utils'
import { createAsyncThunk } from '@reduxjs/toolkit'
import Wei, { wei } from '@synthetixio/wei'
import { debounce } from 'lodash'

import { notifyError } from 'components/ErrorNotifier'
import { monitorAndAwaitTransaction } from 'state/app/helpers'
import { handleTransactionError, setOpenModal, setTransaction } from 'state/app/reducer'
import { fetchV3BalancesAndAllowances } from 'state/balances/actions'
import { ZERO_STATE_TRADE_INPUTS } from 'state/constants'
import { selectLeverageSide, selectMarketInfo, selectMarkets } from 'state/futures/selectors'
import { AppThunk } from 'state/store'
import { ThunkConfig } from 'state/types'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import {
	formatDelayedOrders,
	perpsAccountIdFromAddress,
	serializeDelayedOrders,
	serializeMarkets,
	serializePositionHistory,
} from 'utils/futures'
import logError from 'utils/logError'

import { selectMarketIndexPrice } from '../common/selectors'
import {
	AppFuturesMarginType,
	CrossMarginTradePreviewParams,
	DebouncedCMPreviewParams,
	DelayedOrderWithDetails,
} from '../common/types'

import {
	incrementPreviewCrossMarginCount,
	setCrossMarginLeverageInput,
	setCrossMarginLeverageSide,
	setCrossMarginTradeInputs,
	setCrossMarginTradePreview,
	setPerpsV3Account,
	setPerpsV3MarketProxyAddress,
} from './reducer'
import {
	selectAccountContext,
	selectCrossMarginAccount,
	selectCrossMarginAvailableMargin,
	selectCrossMarginSupportedNetwork,
	selectCrossMarginTradeInputs,
	selectCrossMarginTradePreview,
	selectOpenDelayedOrdersV3,
	selectV3MarketId,
	selectV3MarketInfo,
	selectV3Markets,
} from './selectors'
import { CrossMarginTradePreview } from './types'

export const fetchMarketsV3 = createAsyncThunk<
	{ markets: FuturesMarket<string>[]; networkId: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchMarketsV3', async (_, { getState, extra: { sdk } }) => {
	const supportedNetwork = selectCrossMarginSupportedNetwork(getState())
	const networkId = selectNetwork(getState())
	if (!supportedNetwork) return
	try {
		const v3Markets = await sdk.perpsV3.getMarkets()

		return { markets: serializeMarkets(v3Markets), networkId }
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch markets', err)
		throw err
	}
})

export const fetchPerpsV3Account = createAsyncThunk<
	{ account: string; wallet: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchPerpsV3Account', async (_, { getState, extra: { sdk }, rejectWithValue }) => {
	const wallet = selectWallet(getState())
	const supportedNetwork = selectCrossMarginSupportedNetwork(getState())
	const network = selectNetwork(getState())

	if (!wallet || !supportedNetwork) return undefined

	const accounts = getState().crossMargin.accounts

	// Already have an account fetched and persisted for this address
	if (accounts[network]?.[wallet]?.account) return

	const id = perpsAccountIdFromAddress(wallet)

	try {
		const owner = await sdk.perpsV3.getAccountOwner(id)

		if (owner) {
			// Account already created
			if (owner.toLowerCase() !== wallet.toLowerCase()) {
				const errMessage = 'Account id registered with a different wallet'
				notifyError(errMessage)
				rejectWithValue(errMessage)
			}
			return { account: id, wallet, network }
		}
		return undefined
	} catch (err) {
		notifyError('Failed to fetch cross margin account', err)
		rejectWithValue(err.message)
	}
})

export const fetchPerpsV3Balances = createAsyncThunk<void, void, ThunkConfig>(
	'balances/fetchPerpsV3Balances',
	async (_, { dispatch, extra: { sdk } }) => {
		const spender = sdk.context.contracts.perpsV3MarketProxy?.address
		if (spender) {
			dispatch(fetchV3BalancesAndAllowances([spender]))
			dispatch(setPerpsV3MarketProxyAddress(spender))
		}
	}
)

export const fetchCrossMarginPositions = createAsyncThunk<
	{ positions: FuturesPosition<string>[]; account: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchCrossMarginPositions', async (_, { extra: { sdk }, getState }) => {
	const supportedNetwork = selectCrossMarginSupportedNetwork(getState())
	const { network, accountId } = selectAccountContext(getState())

	const markets = selectMarkets(getState())

	if (!supportedNetwork || !accountId) return
	try {
		const positions = await sdk.perpsV3.getPositions(
			accountId,
			markets.map((m) => Number(m.market))
		)

		return { positions: [], account: accountId, network }
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch isolated margin positions', err)
		throw err
	}
})

export const fetchPositionHistoryV3 = createAsyncThunk<
	| {
			history: FuturesPositionHistory<string>[]
			account: string
			wallet: string
			networkId: NetworkId
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchPositionHistoryV3', async (_, { getState, extra: { sdk } }) => {
	try {
		const { wallet, network, accountId } = selectAccountContext(getState())

		const futuresSupported = selectCrossMarginSupportedNetwork(getState())
		if (!wallet || !accountId || !futuresSupported) return
		const history = await sdk.futures.getPositionHistory(accountId)
		return {
			account: accountId,
			wallet,
			networkId: network,
			history: serializePositionHistory(history),
		}
	} catch (err) {
		notifyError('Failed to fetch perps v3 position history', err)
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
	void,
	ThunkConfig
>('futures/refetchPosition', async () => {
	// TODO: Refetch positions
	return null
})

export const fetchCrossMarginOpenOrders = createAsyncThunk<
	{ orders: DelayedOrderWithDetails<string>[]; wallet: string; networkId: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchCrossMarginOpenOrders', async (_, { dispatch, getState, extra: { sdk } }) => {
	const { accountId, network, wallet } = selectAccountContext(getState())
	const supportedNetwork = selectCrossMarginSupportedNetwork(getState())
	const markets = selectV3Markets(getState())
	const existingOrders = selectOpenDelayedOrdersV3(getState())
	if (!accountId || !supportedNetwork || !markets.length || !wallet) return

	try {
		const marketIds = markets.map((market) => market.market)
		const orders: DelayedOrder[] = await sdk.perpsV3.getDelayedOrders(accountId, marketIds)

		const nonzeroOrders = formatDelayedOrders(orders, markets)
		const orderDropped = existingOrders.length > nonzeroOrders.length
		if (orderDropped) {
			dispatch(fetchCrossMarginPositions())
		}

		return {
			networkId: network,
			orders: serializeDelayedOrders(nonzeroOrders),
			wallet: wallet,
		}
	} catch (err) {
		notifyError('Failed to fetch open orders', err)
		throw err
	}
})

export const fetchCrossMarginTradePreview = createAsyncThunk<
	{ preview: CrossMarginTradePreview<string>; type: 'trade' },
	DebouncedCMPreviewParams,
	ThunkConfig
>('futures/fetchCrossMarginTradePreview', async (params, { getState, extra: { sdk } }) => {
	// TODO: Fetch cross margin trade preview
	const marketPrice = params.orderPrice
	const marketId = selectV3MarketId(getState())
	const availableMargin = selectCrossMarginAvailableMargin(getState())
	try {
		if (!marketId) throw new Error('No market selected')
		const preview = await sdk.perpsV3.getTradePreview(Number(marketId), params.sizeDelta)
		const priceImpact = preview.fillPrice.sub(marketPrice).div(marketPrice).abs()

		const notional = preview.fillPrice.mul(params.sizeDelta).abs()

		const populatedPreview = {
			settlementFee: preview.settlementFee.toString(),
			marketId: Number(marketId),
			fee: preview.fee.toString(),
			fillPrice: preview.fillPrice.toString(),
			priceImpact: priceImpact.toString(),
			sizeDelta: params.sizeDelta.toString(),
			leverage: notional.gt(0) ? availableMargin.div(notional).toString() : '0',
			notionalValue: notional.toString(),
			side: params.sizeDelta.gt(0) ? PositionSide.LONG : PositionSide.SHORT,
			status: PotentialTradeStatus.OK,
		}
		return { preview: populatedPreview, type: 'trade' }
	} catch (err) {
		notifyError(err.message, err)
		throw err
	}
})

export const debouncedPrepareCrossMarginTradePreview = debounce(
	(dispatch, inputs: DebouncedCMPreviewParams) => {
		dispatch(fetchCrossMarginTradePreview(inputs))
	},
	500
)

export const fetchMarginTransfersV3 = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchMarginTransfers',
	async () => {
		// TODO: Fetch perps v3 balance transfers
	}
)

export const fetchAvailableMargin = createAsyncThunk<
	{ wallet: string; network: NetworkId; availableMargin: string } | undefined,
	void,
	ThunkConfig
>('futures/fetchAvailableMargin', async (_, { getState, extra: { sdk } }) => {
	const supportedNetwork = selectCrossMarginSupportedNetwork(getState())
	const { wallet, network, accountId } = selectAccountContext(getState())

	if (!supportedNetwork || !wallet || !accountId) return
	try {
		const availableMargin = await sdk.perpsV3.getAvailableMargin(accountId)
		return { wallet, network, availableMargin: availableMargin.toString() }
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch available margin', err)
		throw err
	}
})

export const fetchCrossMarginAccountData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchCrossMarginAccountData',
	async (_, { dispatch }) => {
		dispatch(fetchCrossMarginPositions())
		dispatch(fetchPerpsV3Balances())
		dispatch(fetchAvailableMargin())
	}
)

export const clearTradeInputs = createAsyncThunk<void, void, ThunkConfig>(
	'futures/clearTradeInputs',
	async () => {
		// TODO: Clear trade inputs for cross margin
	}
)

export const editCrossMarginTradeSize =
	(size: string, currencyType: 'usd' | 'native'): AppThunk =>
	(dispatch, getState) => {
		const indexPrice = selectMarketIndexPrice(getState())
		const tradeSide = selectLeverageSide(getState())
		const marketInfo = selectV3MarketInfo(getState())
		const availableMargin = selectCrossMarginAvailableMargin(getState())

		if (!marketInfo) throw new Error('No market selected')

		if (size === '' || indexPrice.eq(0)) {
			dispatch(setCrossMarginTradeInputs(ZERO_STATE_TRADE_INPUTS))
			dispatch(setCrossMarginTradePreview({ preview: null, type: 'trade' }))
			dispatch(setCrossMarginLeverageInput(''))
			return
		}

		const nativeSize =
			currencyType === 'native' ? size : String(floorNumber(wei(size).div(indexPrice), 4))
		const usdSize = currencyType === 'native' ? String(floorNumber(indexPrice.mul(size), 4)) : size
		const leverage = availableMargin?.gt(0) ? wei(usdSize).div(availableMargin.abs()) : '0'
		const sizeDeltaWei =
			tradeSide === PositionSide.LONG ? wei(nativeSize || 0) : wei(nativeSize || 0).neg()

		dispatch(
			setCrossMarginTradeInputs({
				susdSize: usdSize,
				nativeSize: nativeSize,
			})
		)
		dispatch(setCrossMarginLeverageInput(leverage.toString(2)))
		dispatch(
			stageCrossMarginTradePreview({
				market: {
					key: marketInfo.marketKey,
					address: marketInfo.market,
				},
				orderPrice: indexPrice,
				sizeDelta: sizeDeltaWei,
				action: 'trade',
			})
		)
	}

const stageCrossMarginTradePreview = createAsyncThunk<
	void,
	CrossMarginTradePreviewParams,
	ThunkConfig
>('futures/stageCrossMarginTradePreview', async (inputs, { dispatch, getState }) => {
	dispatch(incrementPreviewCrossMarginCount())
	const debounceCount = getState().crossMargin.previewDebounceCount
	debouncedPrepareCrossMarginTradePreview(dispatch, { ...inputs, debounceCount })
})

export const changeCrossMarginLeverageSide =
	(side: PositionSide): AppThunk =>
	(dispatch, getState) => {
		const { nativeSizeString } = selectCrossMarginTradeInputs(getState())
		dispatch(setCrossMarginLeverageSide(side))
		dispatch(editCrossMarginTradeSize(nativeSizeString, 'native'))
	}

export const createPerpsV3Account = createAsyncThunk<
	{ account: string; wallet: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>(
	'futures/createPerpsV3Account',
	async (_, { getState, dispatch, extra: { sdk }, rejectWithValue }) => {
		const wallet = selectWallet(getState())
		const supportedNetwork = selectCrossMarginSupportedNetwork(getState())
		const network = selectNetwork(getState())
		if (!wallet || !supportedNetwork) return undefined
		const accounts = getState().crossMargin.accounts

		// Already have an accoutn fetched and persisted for this address
		if (accounts[network]?.[wallet]?.account) {
			notifyError('There is already an account associated with this wallet')
			rejectWithValue('Account already created')
		}

		const id = perpsAccountIdFromAddress(wallet)

		try {
			// Check if this wallet has already registered an account from Kwenta
			// as we want to maintain one to one eoa account mapping for now

			const owner = await sdk.perpsV3.getAccountOwner(id)
			if (owner && owner.toLowerCase() !== wallet.toLowerCase()) {
				notifyError('Another wallet is already registered with account id ' + id)
				rejectWithValue('Account id already registered')
				return
			} else if (owner) {
				dispatch(setPerpsV3Account({ account: id.toString(), wallet: wallet, network }))
				return
			}

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'create_cross_margin_account',
					hash: null,
				})
			)
			const tx = await sdk.perpsV3.createPerpsV3Account(id)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchPerpsV3Account())
			dispatch(setOpenModal(null))
		} catch (err) {
			dispatch(handleTransactionError(err.message))
		}
	}
)

export const approveCrossMarginDeposit = createAsyncThunk<void, void, ThunkConfig>(
	'futures/approveCrossMarginDeposit',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState())
		if (!marketInfo) throw new Error('Market info not found')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'approve_cross_margin',
					hash: null,
				})
			)
			const tx = await sdk.perpsV3.approveDeposit(SynthV3Asset.SNXUSD)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchPerpsV3Balances())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const depositCrossMarginMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/depositCrossMarginMargin',
	async (amount, { getState, dispatch, extra: { sdk } }) => {
		const marketInfo = selectMarketInfo(getState())
		const accountId = selectCrossMarginAccount(getState())
		if (!marketInfo) throw new Error('Market info not found')
		if (!accountId) throw new Error('Account id not found')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'deposit_isolated',
					hash: null,
				})
			)
			const tx = await sdk.perpsV3.depositToMarket(accountId, SynthV3Asset.SNXUSD, amount)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(setOpenModal(null))
			dispatch(refetchPosition())
			dispatch(fetchPerpsV3Balances())
			dispatch(fetchMarginTransfersV3())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const withdrawCrossMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/withdrawCrossMargin',
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
			dispatch(refetchPosition())
			dispatch(setOpenModal(null))
			dispatch(fetchPerpsV3Balances())
			dispatch(fetchMarginTransfersV3())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const submitCrossMarginOrder = createAsyncThunk<void, void, ThunkConfig>(
	'futures/submitCrossMarginOrder',
	async (_, { dispatch, getState, extra: { sdk } }) => {
		const { nativeSizeDelta } = selectCrossMarginTradeInputs(getState())
		const marketId = selectV3MarketId(getState())
		const accountId = selectCrossMarginAccount(getState())
		const preview = selectCrossMarginTradePreview(getState())

		if (!marketId || !accountId || !preview) throw new Error('Invalid order submission')

		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'submit_cross_order',
					hash: null,
				})
			)
			const tx = await sdk.perpsV3.submitOrder(
				marketId,
				accountId,
				wei(nativeSizeDelta || 0),
				preview.desiredFillPrice
			)
			await monitorAndAwaitTransaction(dispatch, tx)
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
		// TODO: Handle perps v3 order submission
	}
)

export const submitCrossMarginReducePositionOrder = createAsyncThunk<void, void, ThunkConfig>(
	'futures/submitCrossMarginReducePositionOrder',
	async () => {
		// TODO: hookup submit v3 order
	}
)
