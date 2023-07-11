import { PERIOD_IN_SECONDS, Period } from '@kwenta/sdk/constants'
import {
	FuturesPosition,
	FuturesPositionHistory,
	FuturesMarketAsset,
	NetworkId,
	TransactionStatus,
	FuturesMarginType,
} from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import { monitorAndAwaitTransaction } from 'state/app/helpers'
import { handleTransactionError, setTransaction, updateTransactionHash } from 'state/app/reducer'
import { ZERO_CM_FEES, ZERO_STATE_TRADE_INPUTS } from 'state/constants'
import { fetchMarketsV3, fetchPositionHistoryV3 } from 'state/futures/crossMargin/actions'
import { serializeWeiObject } from 'state/helpers'
import { AppThunk } from 'state/store'
import { ThunkConfig } from 'state/types'
import { selectNetwork } from 'state/wallet/selectors'
import { serializePositionHistory } from 'utils/futures'
import { refetchWithComparator } from 'utils/queries'

import { AppFuturesMarginType } from './common/types'
import { selectFuturesAccount, selectMarketInfo, selectPosition } from './selectors'
import {
	editSmartMarginTradeSize,
	fetchDailyVolumesV2,
	fetchMarginTransfersV2,
	fetchMarketsV2,
	fetchPositionHistoryV2,
	fetchSmartMarginOpenOrders,
} from './smartMargin/actions'
import {
	setSmartMarginLeverageInput,
	setSmartMarginFees,
	setSmartMarginMarginDelta,
	clearSmartMarginTradePreviews,
	setSmartMarginTradeInputs,
	setSmartMarginEditPositionInputs,
} from './smartMargin/reducer'
import { selectSmartMarginSupportedNetwork } from './smartMargin/selectors'
import { CancelDelayedOrderInputs, ExecuteDelayedOrderInputs } from './types'

export const fetchMarkets = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchMarkets',
	async (_, { dispatch, getState }) => {
		if (getState().futures.selectedType === FuturesMarginType.SMART_MARGIN) {
			dispatch(fetchMarketsV2())
		} else {
			dispatch(fetchMarketsV3())
		}
	}
)

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

export const fetchDailyVolumes = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchDailyVolumes',
	async (_, { dispatch }) => {
		// TODO: Fetch v3 daily volumes
		dispatch(fetchDailyVolumesV2())
	}
)

export const fetchSharedFuturesData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchSharedFuturesData',
	async (_, { dispatch }) => {
		await dispatch(fetchMarkets())
		dispatch(fetchDailyVolumes())
	}
)

export const fetchMarginTransfers = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchMarginTransfers',
	async (_, { dispatch }) => {
		// TODO: Conditionally fetch cross / smart
		dispatch(fetchMarginTransfersV2())
	}
)

export const clearTradeInputs = createAsyncThunk<void, void, ThunkConfig>(
	'futures/clearTradeInputs',
	async (_, { dispatch }) => {
		// TODO: Separate to cross / smart
		dispatch(setSmartMarginMarginDelta(''))
		dispatch(setSmartMarginFees(ZERO_CM_FEES))
		dispatch(setSmartMarginLeverageInput(''))
		dispatch(clearSmartMarginTradePreviews())
		dispatch(setSmartMarginTradeInputs(ZERO_STATE_TRADE_INPUTS))
		dispatch(setSmartMarginEditPositionInputs({ nativeSizeDelta: '', marginDelta: '' }))
	}
)

export const editTradeSizeInput =
	(size: string, currencyType: 'usd' | 'native'): AppThunk =>
	(dispatch) => {
		dispatch(editSmartMarginTradeSize(size, currencyType))
	}

export const fetchFuturesPositionHistory = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchFuturesPositionHistory',
	async (_, { getState, dispatch }) => {
		const accountType = selectFuturesAccount(getState())
		accountType === FuturesMarginType.CROSS_MARGIN
			? dispatch(fetchPositionHistoryV3())
			: dispatch(fetchPositionHistoryV2())
	}
)

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

// Contract Mutations

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

// Utils

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
