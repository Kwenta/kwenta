import { FetchStatus } from './types'

export const ZERO_STATE_TRADE_INPUTS = {
	nativeSize: '',
	susdSize: '',
}

export const ZERO_CM_FEES = {
	delayedOrderFee: '0',
	keeperEthDeposit: '0',
}

export const ZERO_STATE_ISOLATED_ACCOUNT = {
	position: undefined,
	trades: [],
	marginTransfers: [],
	positions: [],
	delayedOrders: [],
	positionHistory: [],
}

export const ZERO_STATE_ACCOUNT = {
	position: undefined,
	balanceInfo: {
		freeMargin: '0',
		allowance: '0',
		keeperEthBal: '0',
		walletEthBal: '0',
	},
	trades: [],
	positions: [],
	idleTransfers: [],
	delayedOrders: [],
	conditionalOrders: [],
	positionHistory: [],
}

export const ZERO_STATE_CM_ACCOUNT = {
	...ZERO_STATE_ACCOUNT,
	balances: {},
}

export const DEFAULT_QUERY_STATUS = {
	status: FetchStatus.Idle,
	error: null,
}

export const LOADING_STATUS = {
	status: FetchStatus.Loading,
	error: null,
}

export const SUCCESS_STATUS = {
	status: FetchStatus.Success,
	error: null,
}

export const DEFAULT_MAP_BY_NETWORK = {
	420: {},
	10: {},
}
