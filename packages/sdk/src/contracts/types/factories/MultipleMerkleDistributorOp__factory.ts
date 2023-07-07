/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import type {
	MultipleMerkleDistributorOp,
	MultipleMerkleDistributorOpInterface,
} from '../MultipleMerkleDistributorOp'

const _abi = [
	{
		inputs: [
			{
				internalType: 'address',
				name: '_owner',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_token',
				type: 'address',
			},
		],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint256',
				name: 'index',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'account',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'epoch',
				type: 'uint256',
			},
		],
		name: 'Claimed',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint256',
				name: 'epoch',
				type: 'uint256',
			},
		],
		name: 'MerkleRootModified',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'address',
				name: 'oldOwner',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'OwnerChanged',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'OwnerNominated',
		type: 'event',
	},
	{
		inputs: [],
		name: 'acceptOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'index',
				type: 'uint256',
			},
			{
				internalType: 'address',
				name: 'account',
				type: 'address',
			},
			{
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
			{
				internalType: 'bytes32[]',
				name: 'merkleProof',
				type: 'bytes32[]',
			},
			{
				internalType: 'uint256',
				name: 'epoch',
				type: 'uint256',
			},
		],
		name: 'claim',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				components: [
					{
						internalType: 'uint256',
						name: 'index',
						type: 'uint256',
					},
					{
						internalType: 'address',
						name: 'account',
						type: 'address',
					},
					{
						internalType: 'uint256',
						name: 'amount',
						type: 'uint256',
					},
					{
						internalType: 'bytes32[]',
						name: 'merkleProof',
						type: 'bytes32[]',
					},
					{
						internalType: 'uint256',
						name: 'epoch',
						type: 'uint256',
					},
				],
				internalType: 'struct IMultipleMerkleDistributor.Claims[]',
				name: 'claims',
				type: 'tuple[]',
			},
		],
		name: 'claimMultiple',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'index',
				type: 'uint256',
			},
			{
				internalType: 'uint256',
				name: 'epoch',
				type: 'uint256',
			},
		],
		name: 'isClaimed',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		name: 'merkleRoots',
		outputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_owner',
				type: 'address',
			},
		],
		name: 'nominateNewOwner',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'nominatedOwner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'owner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'bytes32',
				name: 'merkleRoot',
				type: 'bytes32',
			},
			{
				internalType: 'uint256',
				name: 'epoch',
				type: 'uint256',
			},
		],
		name: 'setMerkleRootForEpoch',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'token',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
] as const

export class MultipleMerkleDistributorOp__factory {
	static readonly abi = _abi
	static createInterface(): MultipleMerkleDistributorOpInterface {
		return new utils.Interface(_abi) as MultipleMerkleDistributorOpInterface
	}
	static connect(
		address: string,
		signerOrProvider: Signer | Provider
	): MultipleMerkleDistributorOp {
		return new Contract(address, _abi, signerOrProvider) as MultipleMerkleDistributorOp
	}
}
