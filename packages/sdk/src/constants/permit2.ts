import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'

const PermitSingleMessage = [
	{ name: 'details', type: 'PermitDetails' },
	{ name: 'spender', type: 'address' },
	{ name: 'sigDeadline', type: 'uint256' },
]

const PermitSingleDetails = [
	{ name: 'token', type: 'address' },
	{ name: 'amount', type: 'uint160' },
	{ name: 'expiration', type: 'uint48' },
	{ name: 'nonce', type: 'uint48' },
]

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

const PERMIT_STRUCT =
	'((address token,uint160 amount,uint48 expiration,uint48 nonce) details,address spender,uint256 sigDeadline)'

export { MAX_UINT256, PERMIT2_ADDRESS, PermitSingleDetails, PermitSingleMessage, PERMIT_STRUCT }
