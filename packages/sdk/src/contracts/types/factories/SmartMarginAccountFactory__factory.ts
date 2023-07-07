/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import type {
	SmartMarginAccountFactory,
	SmartMarginAccountFactoryInterface,
} from '../SmartMarginAccountFactory'

const _abi = [
	{
		inputs: [
			{
				internalType: 'address',
				name: '_owner',
				type: 'address',
			},
		],
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		inputs: [],
		name: 'AccountDoesNotExist',
		type: 'error',
	},
	{
		inputs: [
			{
				internalType: 'bytes',
				name: 'data',
				type: 'bytes',
			},
		],
		name: 'AccountFailedToFetchVersion',
		type: 'error',
	},
	{
		inputs: [],
		name: 'CannotUpgrade',
		type: 'error',
	},
	{
		inputs: [
			{
				internalType: 'bytes',
				name: 'data',
				type: 'bytes',
			},
		],
		name: 'FailedToSetAcountOwner',
		type: 'error',
	},
	{
		inputs: [],
		name: 'OnlyAccount',
		type: 'error',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'address',
				name: 'implementation',
				type: 'address',
			},
		],
		name: 'AccountImplementationUpgraded',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'creator',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'account',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'bytes32',
				name: 'version',
				type: 'bytes32',
			},
		],
		name: 'NewAccount',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'address',
				name: 'user',
				type: 'address',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'OwnershipTransferred',
		type: 'event',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'accounts',
				type: 'address',
			},
		],
		name: 'accounts',
		outputs: [
			{
				internalType: 'bool',
				name: 'exist',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'canUpgrade',
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
				internalType: 'address',
				name: '_account',
				type: 'address',
			},
		],
		name: 'getAccountOwner',
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
				internalType: 'address',
				name: '_owner',
				type: 'address',
			},
		],
		name: 'getAccountsOwnedBy',
		outputs: [
			{
				internalType: 'address[]',
				name: '',
				type: 'address[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'implementation',
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
		name: 'newAccount',
		outputs: [
			{
				internalType: 'address payable',
				name: 'accountAddress',
				type: 'address',
			},
		],
		stateMutability: 'nonpayable',
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
		inputs: [],
		name: 'removeUpgradability',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'newOwner',
				type: 'address',
			},
		],
		name: 'transferOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_account',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_newOwner',
				type: 'address',
			},
			{
				internalType: 'address',
				name: '_oldOwner',
				type: 'address',
			},
		],
		name: 'updateAccountOwnership',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '_implementation',
				type: 'address',
			},
		],
		name: 'upgradeAccountImplementation',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
] as const

export class SmartMarginAccountFactory__factory {
	static readonly abi = _abi
	static createInterface(): SmartMarginAccountFactoryInterface {
		return new utils.Interface(_abi) as SmartMarginAccountFactoryInterface
	}
	static connect(address: string, signerOrProvider: Signer | Provider): SmartMarginAccountFactory {
		return new Contract(address, _abi, signerOrProvider) as SmartMarginAccountFactory
	}
}
