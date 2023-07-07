/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
	BaseContract,
	BigNumber,
	BigNumberish,
	BytesLike,
	CallOverrides,
	ContractTransaction,
	Overrides,
	PopulatedTransaction,
	Signer,
	utils,
} from 'ethers'
import type { FunctionFragment, Result } from '@ethersproject/abi'
import type { Listener, Provider } from '@ethersproject/providers'
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from './common'

export declare namespace IMultipleMerkleDistributor {
	export type ClaimsStruct = {
		index: BigNumberish
		account: string
		amount: BigNumberish
		merkleProof: BytesLike[]
		epoch: BigNumberish
	}

	export type ClaimsStructOutput = [BigNumber, string, BigNumber, string[], BigNumber] & {
		index: BigNumber
		account: string
		amount: BigNumber
		merkleProof: string[]
		epoch: BigNumber
	}
}

export interface BatchClaimerInterface extends utils.Interface {
	functions: {
		'claimMultiple(address[],tuple[][])': FunctionFragment
	}

	getFunction(nameOrSignatureOrTopic: 'claimMultiple'): FunctionFragment

	encodeFunctionData(
		functionFragment: 'claimMultiple',
		values: [string[], IMultipleMerkleDistributor.ClaimsStruct[][]]
	): string

	decodeFunctionResult(functionFragment: 'claimMultiple', data: BytesLike): Result

	events: {}
}

export interface BatchClaimer extends BaseContract {
	connect(signerOrProvider: Signer | Provider | string): this
	attach(addressOrName: string): this
	deployed(): Promise<this>

	interface: BatchClaimerInterface

	queryFilter<TEvent extends TypedEvent>(
		event: TypedEventFilter<TEvent>,
		fromBlockOrBlockhash?: string | number | undefined,
		toBlock?: string | number | undefined
	): Promise<Array<TEvent>>

	listeners<TEvent extends TypedEvent>(
		eventFilter?: TypedEventFilter<TEvent>
	): Array<TypedListener<TEvent>>
	listeners(eventName?: string): Array<Listener>
	removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this
	removeAllListeners(eventName?: string): this
	off: OnEvent<this>
	on: OnEvent<this>
	once: OnEvent<this>
	removeListener: OnEvent<this>

	functions: {
		claimMultiple(
			_distributors: string[],
			_claims: IMultipleMerkleDistributor.ClaimsStruct[][],
			overrides?: Overrides & { from?: string }
		): Promise<ContractTransaction>
	}

	claimMultiple(
		_distributors: string[],
		_claims: IMultipleMerkleDistributor.ClaimsStruct[][],
		overrides?: Overrides & { from?: string }
	): Promise<ContractTransaction>

	callStatic: {
		claimMultiple(
			_distributors: string[],
			_claims: IMultipleMerkleDistributor.ClaimsStruct[][],
			overrides?: CallOverrides
		): Promise<void>
	}

	filters: {}

	estimateGas: {
		claimMultiple(
			_distributors: string[],
			_claims: IMultipleMerkleDistributor.ClaimsStruct[][],
			overrides?: Overrides & { from?: string }
		): Promise<BigNumber>
	}

	populateTransaction: {
		claimMultiple(
			_distributors: string[],
			_claims: IMultipleMerkleDistributor.ClaimsStruct[][],
			overrides?: Overrides & { from?: string }
		): Promise<PopulatedTransaction>
	}
}
