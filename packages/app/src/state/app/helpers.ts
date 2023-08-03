import { GasPrice, TransactionStatus } from '@kwenta/sdk/types'
import { BigNumber, ethers } from 'ethers'

import { AppDispatch } from 'state/store'

import { updateTransactionHash, updateTransactionStatus } from './reducer'

export const serializeGasPrice = (gasPrice: GasPrice): GasPrice<string> => ({
	baseFeePerGas: gasPrice.baseFeePerGas?.toString() ?? '0',
	maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString() ?? '0',
	maxFeePerGas: gasPrice.maxFeePerGas?.toString() ?? '0',
	gasPrice: gasPrice.gasPrice?.toString() ?? '0',
})

export const unserializeGasPrice = (gasPrice: GasPrice<string>): GasPrice => ({
	baseFeePerGas: BigNumber.from(gasPrice.baseFeePerGas),
	maxPriorityFeePerGas: BigNumber.from(gasPrice.maxPriorityFeePerGas),
	maxFeePerGas: BigNumber.from(gasPrice.maxFeePerGas),
	gasPrice: BigNumber.from(gasPrice.gasPrice),
})

export const monitorAndAwaitTransaction = async (
	dispatch: AppDispatch,
	tx: ethers.providers.TransactionResponse
) => {
	dispatch(updateTransactionHash(tx.hash))
	await tx.wait()
	dispatch(updateTransactionStatus(TransactionStatus.Confirmed))
}
