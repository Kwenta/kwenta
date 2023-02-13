import { FetchStatus } from './types';

export const ZERO_STATE_TRADE_INPUTS = {
	nativeSize: '',
	susdSize: '',
};

export const ZERO_STATE_CM_TRADE_INPUTS = {
	...ZERO_STATE_TRADE_INPUTS,
	leverage: '1',
};

export const ZERO_CM_FEES = {
	staticFee: '0',
	crossMarginFee: '0',
	limitStopOrderFee: '0',
	keeperEthDeposit: '0',
	total: '0',
};

export const ZERO_STATE_CM_ACCOUNT = {
	position: undefined,
	balanceInfo: {
		freeMargin: '0',
		keeperEthBal: '0',
		allowance: '0',
	},
	trades: [],
	positions: [],
	delayedOrders: [],
	advancedOrders: [],
	positionHistory: [],
};

export const DEFAULT_QUERY_STATUS = {
	status: FetchStatus.Idle,
	error: null,
};

export const LOADING_STATUS = {
	status: FetchStatus.Loading,
	error: null,
};

export const SUCCESS_STATUS = {
	status: FetchStatus.Success,
	error: null,
};

export const DEFAULT_MAP_BY_NETWORK = {
	420: {},
	10: {},
};
