import {
	DelayedOrder,
	FuturesMarket,
	FuturesPosition,
	FuturesPositionHistory,
	NetworkId,
	TransactionStatus,
} from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import {
	selectSmartMarginAccount,
	selectFuturesAccount,
	selectFuturesType,
	selectMarketInfo,
	selectOpenDelayedOrders,
	selectEditPositionModalInfo,
	selectClosePositionPreview,
	selectClosePositionOrderInputs,
} from 'state/futures/selectors'
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

import { selectCrossMarginSupportedNetwork, selectV3Markets } from './selectors'
import { setPerpsV3Account } from './reducer'
import {
	handleTransactionError,
	setOpenModal,
	setShowPositionModal,
	setTransaction,
	updateTransactionHash,
	updateTransactionStatus,
} from 'state/app/reducer'
import { AppDispatch } from 'state/store'
import { ethers } from 'ethers'
import { AppFuturesMarginType, DelayedOrderWithDetails } from 'state/futures/types'
import Wei, { wei } from '@synthetixio/wei'
import { fetchBalances } from 'state/balances/actions'

export const fetchV3Markets = createAsyncThunk<
	{ markets: FuturesMarket<string>[]; networkId: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchV3Markets', async (_, { getState, extra: { sdk } }) => {
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

	const accounts = getState().futures.smartMargin.accounts

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

export const fetchCrossMarginPositions = createAsyncThunk<
	{ positions: FuturesPosition<string>[]; account: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchCrossMarginPositions', async (_, { getState, extra: { sdk } }) => {
	const supportedNetwork = selectCrossMarginSupportedNetwork(getState())
	const network = selectNetwork(getState())
	const account = selectSmartMarginAccount(getState())
	const markets = selectV3Markets(getState())

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

export const fetchPerpsV3PositionHistory = createAsyncThunk<
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
>('futures/fetchPerpsV3PositionHistory', async (_, { getState, extra: { sdk } }) => {
	try {
		const account = selectFuturesAccount(getState())
		const accountType = selectFuturesType(getState())
		const networkId = selectNetwork(getState())
		const wallet = selectWallet(getState())
		const futuresSupported = selectCrossMarginSupportedNetwork(getState())
		if (!wallet || !account || !futuresSupported) return
		const history = await sdk.futures.getPositionHistory(account)
		return { accountType, account, wallet, networkId, history: serializePositionHistory(history) }
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
>('futures/refetchPosition', async (type, { getState, extra: { sdk } }) => {
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
	const existingOrders = selectOpenDelayedOrders(getState())
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

export const fetchMarginTransfers = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchMarginTransfers',
	async (_, { getState, extra: { sdk } }) => {
		// TODO: Fetch perps v3 balance transfers
	}
)

export const clearTradeInputs = createAsyncThunk<void, void, ThunkConfig>(
	'futures/clearTradeInputs',
	async (_, { dispatch }) => {
		// TODO: Clear trade inputs for cross margin
	}
)

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
		} catch (err) {
			dispatch(handleTransactionError(err.message))
		}
	}
)

export const depositCrossMarginMargin = createAsyncThunk<void, Wei, ThunkConfig>(
	'futures/depositCrossMarginMargin',
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
			dispatch(refetchPosition())
			dispatch(fetchBalances())
			dispatch(fetchMarginTransfers())
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
			dispatch(fetchBalances())
			dispatch(fetchMarginTransfers())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const submitCrossMarginOrder = createAsyncThunk<void, void, ThunkConfig>(
	'futures/submitCrossMarginOrder',
	async (_, { getState, dispatch, extra: { sdk } }) => {
		// TODO: Handle perps v3 order submission
	}
)

export const submitCrossMarginReducePositionOrder = createAsyncThunk<void, void, ThunkConfig>(
	'futures/submitCrossMarginReducePositionOrder',
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
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

// TODO: Move this to shared action under app

const monitorAndAwaitTransaction = async (
	dispatch: AppDispatch,
	tx: ethers.providers.TransactionResponse
) => {
	dispatch(updateTransactionHash(tx.hash))
	await tx.wait()
	dispatch(updateTransactionStatus(TransactionStatus.Confirmed))
}
