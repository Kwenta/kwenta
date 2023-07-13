import {
	DelayedOrder,
	FuturesMarket,
	FuturesPosition,
	FuturesPositionHistory,
	NetworkId,
	PositionSide,
	SynthV3Asset,
	TransactionStatus,
} from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'
import Wei from '@synthetixio/wei'
import { debounce } from 'lodash'

import { notifyError } from 'components/ErrorNotifier'
import { monitorAndAwaitTransaction } from 'state/app/helpers'
import { handleTransactionError, setOpenModal, setTransaction } from 'state/app/reducer'
import { fetchBalances, fetchV3BalancesAndAllowances } from 'state/balances/actions'
import { selectMarketInfo } from 'state/futures/selectors'
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

import {
	AppFuturesMarginType,
	DebouncedPreviewParams,
	DelayedOrderWithDetails,
} from '../common/types'

import {
	setCrossMarginLeverageSide,
	setPerpsV3Account,
	setPerpsV3MarketProxyAddress,
} from './reducer'
import {
	selectCrossMarginAccount,
	selectCrossMarginSupportedNetwork,
	selectCrossMarginTradeInputs,
	selectOpenDelayedOrdersV3,
	selectV3Markets,
} from './selectors'
import { editCrossMarginTradeSize } from '../smartMargin/actions'
import { AppThunk } from 'state/store'

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
		notifyError('Failed to fetch smart margin account', err)
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
>('futures/fetchCrossMarginPositions', async (_, { getState }) => {
	const supportedNetwork = selectCrossMarginSupportedNetwork(getState())
	const network = selectNetwork(getState())
	const account = selectCrossMarginAccount(getState())

	if (!supportedNetwork || !account) return
	try {
		// TODO: Fetch positions
		return { positions: [], account, network }
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
		const account = selectCrossMarginAccount(getState())
		const networkId = selectNetwork(getState())
		const wallet = selectWallet(getState())
		const futuresSupported = selectCrossMarginSupportedNetwork(getState())
		if (!wallet || !account || !futuresSupported) return
		const history = await sdk.futures.getPositionHistory(account)
		return { account, wallet, networkId, history: serializePositionHistory(history) }
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
	const wallet = selectWallet(getState())
	const supportedNetwork = selectCrossMarginSupportedNetwork(getState())
	const network = selectNetwork(getState())
	const markets = selectV3Markets(getState())
	const existingOrders = selectOpenDelayedOrdersV3(getState())
	if (!wallet || !supportedNetwork || !markets.length) return

	const marketAddresses = markets.map((market) => market.market)

	const orders: DelayedOrder[] = await sdk.futures.getDelayedOrders(wallet, marketAddresses)
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
})

export const fetchCrossMarginTradePreview = createAsyncThunk<
	void,
	DebouncedPreviewParams,
	ThunkConfig
>('futures/fetchCrossMarginTradePreview', async () => {
	// TODO: Fetch cross margin trade preview
})

export const debouncedPrepareCrossMarginTradePreview = debounce(
	(dispatch, inputs: DebouncedPreviewParams) => {
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

export const fetchCrossMarginAccountData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchCrossMarginAccountData',
	async (_, { dispatch }) => {
		dispatch(fetchCrossMarginPositions())
		dispatch(fetchPerpsV3Balances())
	}
)

export const clearTradeInputs = createAsyncThunk<void, void, ThunkConfig>(
	'futures/clearTradeInputs',
	async () => {
		// TODO: Clear trade inputs for cross margin
	}
)

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
	async () => {
		// TODO: Handle perps v3 order submission
	}
)

export const submitCrossMarginReducePositionOrder = createAsyncThunk<void, void, ThunkConfig>(
	'futures/submitCrossMarginReducePositionOrder',
	async () => {
		// TODO: hookup submit v3 order
	}
)
