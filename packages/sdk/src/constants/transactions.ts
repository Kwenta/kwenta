// Copied over from: https://github.com/Synthetixio/js-monorepo

import { TransactionEventCode } from '../types/transactions'

export const TRANSACTION_EVENTS: TransactionEventCode[] = [
	'txSent',
	'txConfirmed',
	'txFailed',
	'txError',
]

export const TRANSACTION_EVENTS_MAP = Object.fromEntries(
	TRANSACTION_EVENTS.map((event) => [event, event])
)

export const DEFAULT_GAS_BUFFER = 5000

export const ETH_UNIT = 1000000000000000000
export const GWEI_DECIMALS = 9
