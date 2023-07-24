import { BigNumber } from 'ethers'
import {
	MAX_UINT256,
	PERMIT2_ADDRESS,
	PermitSingleDetails,
	PermitSingleMessage,
} from '../constants'
import { PermitToken, TPermit2Domain, TPermitSingleMessage } from '../types'
import { Provider } from '@ethersproject/providers'
import { AllowanceProvider } from '@uniswap/permit2-sdk'

const getPermit2Domain = (token: PermitToken): TPermit2Domain => {
	const { address: name, chainId, address } = token
	const domain: TPermit2Domain = { name, chainId, verifyingContract: address }
	return domain
}

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

const createTypedPermitSingleData = (message: TPermitSingleMessage, domain: TPermit2Domain) => {
	const typedData = {
		types: {
			PermitSingle: PermitSingleMessage,
			PermitDetails: PermitSingleDetails,
		},
		primaryType: 'Permit2',
		domain,
		message,
	}

	return typedData
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
		amount: amount?.toHexString() ?? MAX_UINT256,
		expiration: deadline?.toHexString() ?? MAX_UINT256,
		nonce: await getPermit2Nonce(provider, owner, tokenAddress, spender),
	}

	const message: TPermitSingleMessage = {
		details,
		spender,
		sigDeadline: deadline?.toHexString() ?? MAX_UINT256,
	}

	const token: PermitToken = {
		address: tokenAddress,
		chainId,
		name: 'Permit2',
	}

	const domain = getPermit2Domain(token)

	return createTypedPermitSingleData(message, domain)
}

export { getPermit2TypedData }
