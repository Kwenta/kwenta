import {
	FuturesAccountType,
	FuturesMarket,
	FuturesPositionHistory,
	NetworkId,
	TransactionStatus,
} from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import { selectFuturesAccount, selectFuturesType } from 'state/futures/selectors'
import { ThunkConfig } from 'state/types'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import {
	perpsAccountIdFromAddress,
	serializeMarkets,
	serializePositionHistory,
} from 'utils/futures'
import logError from 'utils/logError'

import { selectPerpsV3SupportedNetwork } from './selectors'
import { setPerpsV3Account } from './reducer'
import {
	handleTransactionError,
	setTransaction,
	updateTransactionHash,
	updateTransactionStatus,
} from 'state/app/reducer'
import { AppDispatch } from 'state/store'
import { ethers } from 'ethers'

export const fetchV3Markets = createAsyncThunk<
	{ markets: FuturesMarket<string>[]; networkId: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchV3Markets', async (_, { getState, extra: { sdk } }) => {
	const supportedNetwork = selectPerpsV3SupportedNetwork(getState())
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
	const supportedNetwork = selectPerpsV3SupportedNetwork(getState())
	const network = selectNetwork(getState())
	if (!wallet || !supportedNetwork) return undefined

	const accounts = getState().futures.crossMargin.accounts

	// Already have an account fetched and persisted for this address
	if (accounts[network]?.[wallet]?.account) return

	const id = perpsAccountIdFromAddress(wallet)

	try {
		const owner = await sdk.perpsV3.getAccountOwner(id)
		console.log('owner', owner)
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

export const fetchPerpsV3PositionHistory = createAsyncThunk<
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
>('futures/fetchPerpsV3PositionHistory', async (_, { getState, extra: { sdk } }) => {
	try {
		const account = selectFuturesAccount(getState())
		const accountType = selectFuturesType(getState())
		const networkId = selectNetwork(getState())
		const wallet = selectWallet(getState())
		const futuresSupported = selectPerpsV3SupportedNetwork(getState())
		if (!wallet || !account || !futuresSupported) return
		const history = await sdk.futures.getPositionHistory(account)
		return { accountType, account, wallet, networkId, history: serializePositionHistory(history) }
	} catch (err) {
		notifyError('Failed to fetch perps v3 position history', err)
		throw err
	}
})

export const createPerpsV3Account = createAsyncThunk<
	{ account: string; wallet: string; network: NetworkId } | undefined,
	void,
	ThunkConfig
>(
	'futures/createPerpsV3Account',
	async (_, { getState, dispatch, extra: { sdk }, rejectWithValue }) => {
		const wallet = selectWallet(getState())
		const supportedNetwork = selectPerpsV3SupportedNetwork(getState())
		const network = selectNetwork(getState())
		if (!wallet || !supportedNetwork) return undefined
		const accounts = getState().perpsV3.accounts

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
			dispatch(fetchPe())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
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
