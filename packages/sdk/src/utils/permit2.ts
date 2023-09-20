import { BigNumber } from 'ethers'
import { PERMIT2_ADDRESS } from '../constants'
import { Provider } from '@ethersproject/providers'
import {
	AllowanceProvider,
	MaxUint48,
	MaxUint160,
	AllowanceTransfer,
	PermitSingle,
} from '@uniswap/permit2-sdk'

const getPermit2Nonce = async (
	provider: Provider,
	owner: string,
	token: string,
	spender: string
): Promise<number> => {
	const allowanceProvider = new AllowanceProvider(provider, PERMIT2_ADDRESS)
	const allowance = await allowanceProvider.getAllowanceData(token, owner, spender)
	return allowance.nonce
}

const getPermit2Amount = async (
	provider: Provider,
	owner: string,
	token: string,
	spender: string
): Promise<BigNumber> => {
	const allowanceProvider = new AllowanceProvider(provider, PERMIT2_ADDRESS)
	const allowance = await allowanceProvider.getAllowanceData(token, owner, spender)
	return allowance.amount
}

const getPermit2TypedData = async (
	provider: Provider,
	tokenAddress: string,
	owner: string,
	spender: string,
	amount?: BigNumber,
	deadline?: BigNumber
) => {
	const chainId = (await provider.getNetwork()).chainId

	const details = {
		token: tokenAddress,
		amount: amount?.toHexString() ?? MaxUint160.toHexString(),
		expiration: deadline?.toHexString() ?? MaxUint48.toHexString(),
		nonce: await getPermit2Nonce(provider, owner, tokenAddress, spender),
	}

	const message: PermitSingle = {
		details,
		spender,
		sigDeadline: deadline?.toHexString() ?? MaxUint48.toHexString(),
	}

	return AllowanceTransfer.getPermitData(message, PERMIT2_ADDRESS, chainId)
}

export { getPermit2TypedData, getPermit2Amount }
