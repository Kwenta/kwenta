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

export { MAX_UINT256, PERMIT2_ADDRESS, PermitSingleDetails, PermitSingleMessage }
