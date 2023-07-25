import { getContractFactory, predeploys } from '@eth-optimism/contracts'
import { BigNumber } from '@ethersproject/bignumber'
import { wei } from '@synthetixio/wei'
import { TypedDataDomain, TypedDataField, ethers } from 'ethers'
import { omit, clone } from 'lodash'

import KwentaSDK from '..'
import * as sdkErrors from '../common/errors'
import { getEthGasPrice } from '../common/gas'
import { TRANSACTION_EVENTS_MAP } from '../constants/transactions'
import { ContractName } from '../contracts'
import { NetworkIdByName } from '../types/common'
import { Emitter } from '../types/transactions'
import { createEmitter, getRevertReason } from '../utils/transactions'

const OVMGasPriceOracle = getContractFactory('OVM_GasPriceOracle').attach(
	predeploys.OVM_GasPriceOracle
)

const contractAbi = JSON.parse(
	OVMGasPriceOracle.interface.format(ethers.utils.FormatTypes.json) as string
)

const DEFAULT_GAS_BUFFER = 0.2

export default class TransactionsService {
	private sdk: KwentaSDK

	constructor(sdk: KwentaSDK) {
		this.sdk = sdk
	}

	// Copied over from: https://github.com/Synthetixio/js-monorepo
	hash(transactionHash: string): Emitter {
		const emitter = createEmitter()
		setTimeout(() => this.watchTransaction(transactionHash, emitter), 5)
		return emitter
	}

	watchTransaction(transactionHash: string, emitter: Emitter): void {
		emitter.emit(TRANSACTION_EVENTS_MAP.txSent, { transactionHash })
		this.sdk.context.provider
			.waitForTransaction(transactionHash)
			.then(({ status, blockNumber, transactionHash }) => {
				if (status === 1) {
					emitter.emit(TRANSACTION_EVENTS_MAP.txConfirmed, {
						status,
						blockNumber,
						transactionHash,
					})
				} else {
					setTimeout(() => {
						this.sdk.context.provider.getNetwork().then(({ chainId }) => {
							try {
								getRevertReason({
									txHash: transactionHash,
									networkId: chainId,
									blockNumber,
									provider: this.sdk.context.provider,
								}).then((revertReason) =>
									emitter.emit(TRANSACTION_EVENTS_MAP.txFailed, {
										transactionHash,
										failureReason: revertReason,
									})
								)
							} catch (e) {
								emitter.emit(TRANSACTION_EVENTS_MAP.txFailed, {
									transactionHash,
									failureReason: 'Transaction reverted for an unknown reason',
								})
							}
						})
					}, 5000)
				}
			})
	}

	public createContractTxn(
		contract: ethers.Contract,
		method: string,
		args: any[],
		txnOptions: Partial<ethers.providers.TransactionRequest> = {},
		options?: { gasLimitBuffer?: number }
	) {
		const txn = {
			to: contract.address,
			data: contract.interface.encodeFunctionData(method, args),
			value: BigNumber.from(0),
			...txnOptions,
		}

		return this.createEVMTxn(txn, options)
	}

	public async createEVMTxn(txn: ethers.providers.TransactionRequest, options?: any) {
		const execTxn = clone(txn)

		if (!execTxn.gasLimit) {
			const newGasLimit = await this.estimateGas(execTxn)
			execTxn.gasLimit = wei(newGasLimit ?? 0, 9)
				.mul(1 + (options?.gasLimitBuffer || DEFAULT_GAS_BUFFER))
				.toBN()
		}

		const txnData = await this.sdk.context.signer.sendTransaction(execTxn)

		return txnData
	}

	public createSynthetixTxn(
		contractName: ContractName,
		method: string,
		args: any[],
		txnOptions: Partial<ethers.providers.TransactionRequest> = {},
		options?: any
	) {
		const contract = this.sdk.context.contracts[contractName]

		if (!contract) {
			throw new Error(sdkErrors.UNSUPPORTED_NETWORK)
		}

		return this.createContractTxn(contract, method, args, txnOptions, options)
	}

	public async estimateGas(txn: ethers.providers.TransactionRequest) {
		return this.sdk.context.signer.estimateGas(
			omit(txn, ['gasPrice', 'maxPriorityFeePerGas', 'maxFeePerGas'])
		)
	}

	public async getOptimismLayerOneFees(txn?: ethers.providers.TransactionRequest) {
		if (!txn || !this.sdk.context.signer) return null

		const isNotOvm =
			this.sdk.context.networkId !== NetworkIdByName['mainnet-ovm'] &&
			this.sdk.context.networkId !== NetworkIdByName['kovan-ovm'] &&
			this.sdk.context.networkId !== NetworkIdByName['goerli-ovm']

		if (isNotOvm) {
			return null
		}

		const OptimismGasPriceOracleContract = new ethers.Contract(
			OVMGasPriceOracle.address,
			contractAbi,
			this.sdk.context.signer
		)

		const cleanedTxn = omit(txn, ['from', 'maxPriorityFeePerGas', 'maxFeePerGas'])
		const serializedTxn = ethers.utils.serializeTransaction(
			cleanedTxn as ethers.UnsignedTransaction
		)

		return wei(await OptimismGasPriceOracleContract.getL1Fee(serializedTxn))
	}

	public getGasPrice() {
		return getEthGasPrice(this.sdk.context.networkId, this.sdk.context.provider)
	}

	public async signTypedData({
		domain,
		types,
		values,
	}: {
		domain: TypedDataDomain
		types: Record<string, Array<TypedDataField>>
		values: Record<string, any>
	}) {
		return this.sdk.context.signer._signTypedData(domain, types, values)
	}
}
