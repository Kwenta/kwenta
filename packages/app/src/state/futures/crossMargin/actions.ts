import { V3_SYNTH_MARKET_IDS } from '@kwenta/sdk/constants'
import {
	PerpsV2Position,
	FuturesPositionHistory,
	NetworkId,
	PerpsMarketV3,
	PerpsV3AsyncOrder,
	PerpsV3Position,
	PositionSide,
	PotentialTradeStatus,
	SynthV3Asset,
	TransactionStatus,
} from '@kwenta/sdk/types'
import { calculateDesiredFillPrice, floorNumber, getDefaultPriceImpact } from '@kwenta/sdk/utils'
import { createAsyncThunk } from '@reduxjs/toolkit'
import Wei, { wei } from '@synthetixio/wei'
import { debounce } from 'lodash'

import { notifyError } from 'components/ErrorNotifier'
import { monitorAndAwaitTransaction } from 'state/app/helpers'
import {
	handleTransactionError,
	setOpenModal,
	setTransaction,
	updateTransactionHash,
} from 'state/app/reducer'
import { fetchV3BalancesAndAllowances } from 'state/balances/actions'
import { ZERO_STATE_TRADE_INPUTS } from 'state/constants'
import { selectLeverageSide, selectMarketInfo } from 'state/futures/selectors'
import { AppThunk } from 'state/store'
import { ThunkConfig } from 'state/types'
import { selectNetwork, selectWallet } from 'state/wallet/selectors'
import {
	serializePositionHistory,
	serializeV3AsyncOrder,
	serializeV3Market,
	serializeV3Positions,
} from 'utils/futures'
import logError from 'utils/logError'

import { selectMarketIndexPrice } from '../common/selectors'
import {
	AppFuturesMarginType,
	CrossMarginTradePreviewParams,
	DebouncedCMPreviewParams,
} from '../common/types'
import { ExecuteAsyncOrderInputs } from '../types'

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
	selectAsyncCrossMarginOrders,
	selectV3MarketInfo,
	selectV3Markets,
	selectCloseCMPositionModalInfo,
} from './selectors'
import { CrossMarginTradePreview } from './types'

export const fetchCrossMarginMarketData = createAsyncThunk<void, void, ThunkConfig>(
	'futures/fetchCrossMarginMarketData',
	async (_, { dispatch }) => {
		await dispatch(fetchV3Markets())
		// TODO: fetch v3 volume data
	}
)

export const fetchV3Markets = createAsyncThunk<
	{ markets: PerpsMarketV3<string>[]; networkId: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchV3Markets', async (_, { getState, extra: { sdk } }) => {
	const supportedNetwork = selectCrossMarginSupportedNetwork(getState())
	const networkId = selectNetwork(getState())
	if (!supportedNetwork) return
	try {
		const v3Markets = await sdk.perpsV3.getMarkets()

		return { markets: v3Markets.map(serializeV3Market), networkId }
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch markets', err)
		throw err
	}
})

export const fetchPerpsV3Account = createAsyncThunk<
	{ account: number; wallet: string; network: NetworkId } | undefined,
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

	try {
		// TODO: Support multiple accounts
		const accountIds = await sdk.perpsV3.getPerpsV3AccountIds(wallet)
		const defaultAccount = accountIds[0]
		if (defaultAccount) {
			return { account: defaultAccount, wallet, network }
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
	{ positions: PerpsV3Position<string>[]; account: number; network: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchCrossMarginPositions', async (_, { extra: { sdk }, getState }) => {
	const supportedNetwork = selectCrossMarginSupportedNetwork(getState())
	const { network, accountId } = selectAccountContext(getState())
	const markets = selectV3Markets(getState())

	if (!supportedNetwork || !accountId) return
	try {
		const positions = await sdk.perpsV3.getPositions(
			accountId,
			markets.map((m) => m.marketId)
		)

		return { positions: serializeV3Positions(positions), account: accountId, network }
	} catch (err) {
		logError(err)
		notifyError('Failed to fetch isolated margin positions', err)
		throw err
	}
})

export const fetchPositionHistoryV3 = createAsyncThunk<
	| {
			history: FuturesPositionHistory<string>[]
			account: number
			wallet: string
			networkId: NetworkId
	  }
	| undefined,
	void,
	ThunkConfig
>('futures/fetchPositionHistoryV3', async (_, { getState, extra: { sdk: _sdk } }) => {
	try {
		const { wallet, network, accountId } = selectAccountContext(getState())

		const futuresSupported = selectCrossMarginSupportedNetwork(getState())
		if (!wallet || !accountId || !futuresSupported) return
		// TODO: V3 position history
		// const history = await sdk.futures.getPositionHistory(accountId)
		return {
			account: accountId,
			wallet,
			networkId: network,
			history: serializePositionHistory([]),
		}
	} catch (err) {
		notifyError('Failed to fetch perps v3 position history', err)
		throw err
	}
})

export const refetchPosition = createAsyncThunk<
	{
		position: PerpsV2Position<string>
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
	{ orders: PerpsV3AsyncOrder<string>[]; wallet: string; networkId: NetworkId } | undefined,
	void,
	ThunkConfig
>('futures/fetchCrossMarginOpenOrders', async (_, { dispatch, getState, extra: { sdk } }) => {
	const { accountId, network, wallet } = selectAccountContext(getState())
	const supportedNetwork = selectCrossMarginSupportedNetwork(getState())
	const markets = selectV3Markets(getState())
	const existingOrders = selectAsyncCrossMarginOrders(getState())
	if (!accountId || !supportedNetwork || !markets.length || !wallet) return
	try {
		const marketIds = markets.map((market) => market.marketId)
		const orders = await sdk.perpsV3.getPendingAsyncOrders(accountId, marketIds)
		const orderDropped = existingOrders.length > orders.length
		if (orderDropped) {
			dispatch(fetchCrossMarginPositions())
		}

		return {
			networkId: network,
			orders: orders.map(serializeV3AsyncOrder),
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
	const marketInfo = selectV3MarketInfo(getState())
	const availableMargin = selectCrossMarginAvailableMargin(getState())
	try {
		if (!marketInfo) throw new Error('No market selected')
		if (!marketInfo.settlementStrategies[0]) throw new Error('No settlement strategy found')
		const preview = await sdk.perpsV3.getTradePreview(
			marketInfo.marketId,
			params.sizeDelta,
			marketInfo.settlementStrategies[0]
		)
		const priceImpact = preview.fillPrice.sub(marketPrice).div(marketPrice).abs()

		const notional = preview.fillPrice.mul(params.sizeDelta).abs()

		const populatedPreview = {
			settlementFee: preview.settlementFee.toString(),
			marketId: marketInfo.marketId,
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
					id: marketInfo.marketId,
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

// Contract Mutations

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

		// Already have an account fetched and persisted for this address
		if (accounts[network]?.[wallet]?.account) {
			notifyError('There is already an account associated with this wallet')
			rejectWithValue('Account already created')
		}

		try {
			const accountIds = await sdk.perpsV3.getPerpsV3AccountIds(wallet)

			if (accountIds.length > 0) {
				// Already have an account, no need to create one
				dispatch(setPerpsV3Account({ account: accountIds[0], wallet: wallet, network }))
				return
			}

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'create_cross_margin_account',
					hash: null,
				})
			)
			const tx = await sdk.perpsV3.createAccount()
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
		const accountId = selectCrossMarginAccount(getState())
		if (!accountId) throw new Error('Account id not found')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'deposit_isolated',
					hash: null,
				})
			)
			const tx = await sdk.perpsV3.depositToAccount(accountId, V3_SYNTH_MARKET_IDS.SNXUSD, amount)
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
		const accountId = selectCrossMarginAccount(getState())
		if (!accountId) throw new Error('Account id not found')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'withdraw_isolated',
					hash: null,
				})
			)
			const tx = await sdk.perpsV3.withdrawFromAccount(
				accountId,
				V3_SYNTH_MARKET_IDS.SNXUSD,
				amount
			)
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
		const market = selectV3MarketInfo(getState())
		const accountId = selectCrossMarginAccount(getState())
		const preview = selectCrossMarginTradePreview(getState())

		if (!market || !accountId || !preview) throw new Error('Invalid order submission')

		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'submit_cross_order',
					hash: null,
				})
			)
			const tx = await sdk.perpsV3.submitOrder(
				market.marketId,
				accountId,
				wei(nativeSizeDelta || 0),
				preview.desiredFillPrice,
				market.settlementStrategies[0].strategyId
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
	async (_, { getState, dispatch, extra: { sdk } }) => {
		const { market, position, marketPrice } = selectCloseCMPositionModalInfo(getState())
		const accountId = selectCrossMarginAccount(getState())
		// TODO: Support partial close

		try {
			if (!position) throw new Error('Missing position data')
			if (!accountId) throw new Error('Account not found')

			const sizeDelta = position.side === PositionSide.LONG ? position.size.neg() : position.size
			const priceImpact = getDefaultPriceImpact('market')
			const desiredFillPrice = calculateDesiredFillPrice(
				sizeDelta,
				// TODO: Use fill price from preview
				marketPrice,
				priceImpact
			)

			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'cancel_delayed_isolated',
					hash: null,
				})
			)

			const tx = await sdk.perpsV3.submitOrder(
				market.marketId,
				accountId,
				sizeDelta,
				desiredFillPrice,
				market.settlementStrategies[0].strategyId
			)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchCrossMarginOpenOrders())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
		// TODO: hookup submit v3 order
	}
)

export const cancelAsyncOrder = createAsyncThunk<void, number, ThunkConfig>(
	'futures/cancelAsyncOrder',
	async (marketId, { getState, dispatch, extra: { sdk } }) => {
		const account = selectCrossMarginAccount(getState())
		if (!account) throw new Error('No wallet connected')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'cancel_delayed_isolated',
					hash: null,
				})
			)
			const tx = await sdk.perpsV3.cancelAsyncOrder(marketId, account)
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchCrossMarginOpenOrders())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)

export const executeAsyncOrder = createAsyncThunk<void, ExecuteAsyncOrderInputs, ThunkConfig>(
	'futures/executeAsyncOrder',
	async ({ marketKey, marketId }, { getState, dispatch, extra: { sdk } }) => {
		const account = selectCrossMarginAccount(getState())
		if (!account) throw new Error('No wallet connected')
		try {
			dispatch(
				setTransaction({
					status: TransactionStatus.AwaitingExecution,
					type: 'execute_delayed_isolated',
					hash: null,
				})
			)
			const tx = await sdk.perpsV3.executeAsyncOrder(marketKey, marketId, Number(account))
			dispatch(updateTransactionHash(tx.hash))
			await monitorAndAwaitTransaction(dispatch, tx)
			dispatch(fetchCrossMarginOpenOrders())
		} catch (err) {
			dispatch(handleTransactionError(err.message))
			throw err
		}
	}
)
