import { PERMIT2_ADDRESS } from '@uniswap/permit2-sdk'

const PERMIT_STRUCT =
	'((address token,uint160 amount,uint48 expiration,uint48 nonce) details,address spender,uint256 sigDeadline)'

export { PERMIT2_ADDRESS, PERMIT_STRUCT }
