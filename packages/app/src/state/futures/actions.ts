import { PERIOD_IN_SECONDS, Period } from '@kwenta/sdk/constants'
import {
	FuturesPositionHistory,
	FuturesMarketAsset,
	NetworkId,
	TransactionStatus,
	FuturesMarginType,
} from '@kwenta/sdk/types'
import { createAsyncThunk } from '@reduxjs/toolkit'

import { notifyError } from 'components/ErrorNotifier'
import { monitorAndAwaitTransaction } from 'state/app/helpers'
import { handleTransactionError, setTransaction } from 'state/app/reducer'
import { ZERO_CM_FEES, ZERO_STATE_TRADE_INPUTS } from 'state/constants'
import {
	editCrossMarginTradeSize,
	fetchV3Markets,
	fetchPositionHistoryV3,
} from 'state/futures/crossMargin/actions'
import { AppThunk } from 'state/store'
import { ThunkConfig } from 'state/types'
import { selectNetwork } from 'state/wallet/selectors'
import { serializePositionHistory } from 'utils/futures'

import { selectFuturesType } from './common/selectors'
import { selectFuturesAccount } from './selectors'
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
import {
	selectSmartMarginAccount,
	selectSmartMarginSupportedNetwork,
} from './smartMargin/selectors'

export const fetchMarkets = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchMarkets',
	async (_, { dispatch, getState }) => {
		if (getState().futures.selectedType === FuturesMarginType.SMART_MARGIN) {
			dispatch(fetchMarketsV2())
		} else {
			dispatch(fetchV3Markets())
		}
	}
)

export const fetchDailyVolumes = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchDailyVolumes',
	async (_, { dispatch }) => {
		// TODO: Fetch v3 daily volumes
		dispatch(fetchDailyVolumesV2())
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
	(dispatch, getState) => {
		const type = selectFuturesType(getState())
		if (type === FuturesMarginType.CROSS_MARGIN) {
			dispatch(editCrossMarginTradeSize(size, currencyType))
		} else {
			dispatch(editSmartMarginTradeSize(size, currencyType))
		}
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

export const cancelDelayedOrder = createAsyncThunk<void, string, ThunkConfig>(
	'futures/cancelDelayedOrder',
	async (marketAddress, { getState, dispatch, extra: { sdk } }) => {
		const account = selectSmartMarginAccount(getState())
		if (!account) throw new Error('No wallet connected')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'cancel_delayed_isolated',
					hash: null,
				})
			)

			const tx = await sdk.futures.cancelDelayedOrder({
				marketAddress,
				account,
				isOffchain: true,
			})
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
