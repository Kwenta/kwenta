// Copied from: https://github.com/Synthetixio/js-monorepo

import { Deferrable } from '@ethersproject/properties'
import type { TransactionRequest } from '@ethersproject/providers'
import { toUtf8String } from '@ethersproject/strings'
import Wei, { wei } from '@synthetixio/wei'

import { DEFAULT_GAS_BUFFER, GWEI_DECIMALS } from '../constants/transactions'
import { Emitter, GasLimitEstimate, GasPrice, RevertReasonParams } from '../types/transactions'

const isKovan = (networkId: number): boolean => networkId === 42

export const getRevertReason = async ({
	txHash,
	networkId,
	blockNumber,
	provider,
}: RevertReasonParams): Promise<string> => {
	// Since we are using Infura, we cannot decode Kovan revert reasons
	if (isKovan(networkId)) return 'Unable to decode revert reason'
	validateInputPreProvider(txHash)

	await validateInputPostProvider({ txHash, networkId, blockNumber, provider })

	try {
		const tx = await provider.getTransaction(txHash)
		const code = await provider.call(tx as Deferrable<TransactionRequest>, blockNumber)
		return decodeMessage(code)
	} catch (err) {
		return 'Unable to decode revert reason'
	}
}

const validateInputPreProvider = (txHash: string) => {
	if (!/^0x([A-Fa-f0-9]{64})$/.test(txHash) || txHash.substring(0, 2) !== '0x') {
		throw new Error('Invalid transaction hash')
	}
}

async function validateInputPostProvider({ blockNumber, provider }: RevertReasonParams) {
	if (typeof blockNumber === 'number') {
		const currentBlockNumber = await provider.getBlockNumber()
		blockNumber = Number(blockNumber)

		if (blockNumber > currentBlockNumber) {
			throw new Error('You cannot use a block number that has not yet happened.')
		}

		// A block older than 128 blocks needs access to an archive node
		if (blockNumber < currentBlockNumber - 128)
			throw new Error(
				'You cannot use a block number that is older than 128 blocks. Please use a provider that uses a full archival node.'
			)
	}
}

function decodeMessage(code: string) {
	let codeString = `0x${code.substring(138)}`.replace(/0+$/, '')

	// If the codeString is an odd number of characters, add a trailing 0
	if (codeString.length % 2 === 1) {
		codeString += '0'
	}

	return toUtf8String(codeString)
}

export function createEmitter(): Emitter {
	return {
		listeners: {},
		on: function (eventCode, listener) {
			switch (eventCode) {
				case 'txSent':
				case 'txConfirmed':
				case 'txFailed':
				case 'txError':
					break
				default:
					throw new Error('Not a valid event')
			}
			if (typeof listener !== 'function') {
				throw new Error('Listener must be a function')
			}
			this.listeners[eventCode] = listener
		},
		emit: function (eventCode, data) {
			if (this.listeners[eventCode]) {
				return this.listeners[eventCode](data)
			}
		},
	}
}

export const getTotalGasPrice = (gasPriceObj?: GasPrice | null) => {
	if (!gasPriceObj) return wei(0)
	const { gasPrice, baseFeePerGas, maxPriorityFeePerGas } = gasPriceObj
	if (gasPrice) {
		return wei(gasPrice, GWEI_DECIMALS)
	}
	return wei(baseFeePerGas || 0, GWEI_DECIMALS).add(wei(maxPriorityFeePerGas || 0, GWEI_DECIMALS))
}

export const getTransactionPrice = (
	gasPrice: GasPrice | null,
	gasLimit: GasLimitEstimate,
	ethPrice: Wei | null,
	optimismLayerOneFee: Wei | null
) => {
	if (!gasPrice || !gasLimit || !ethPrice) return null
	const totalGasPrice = getTotalGasPrice(gasPrice)
	const gasPriceCost = totalGasPrice.mul(wei(gasLimit, GWEI_DECIMALS)).mul(ethPrice)
	const l1Cost = ethPrice.mul(optimismLayerOneFee || 0)
	return gasPriceCost.add(l1Cost)
}

export const normalizeGasLimit = (gasLimit: number) => gasLimit + DEFAULT_GAS_BUFFER
