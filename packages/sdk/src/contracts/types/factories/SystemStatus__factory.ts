/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from 'ethers'
import type { Provider } from '@ethersproject/providers'
import type { SystemStatus, SystemStatusInterface } from '../SystemStatus'

const _abi = [
	{
		inputs: [
			{
				internalType: 'address',
				name: '_owner',
				type: 'address',
			},
		],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'constructor',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'bytes32',
				name: 'section',
				type: 'bytes32',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'account',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'bool',
				name: 'canSuspend',
				type: 'bool',
			},
			{
				indexed: false,
				internalType: 'bool',
				name: 'canResume',
				type: 'bool',
			},
		],
		name: 'AccessControlUpdated',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'ExchangeResumed',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'ExchangeSuspended',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'bytes32',
				name: 'marketKey',
				type: 'bytes32',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'FuturesMarketResumed',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'bytes32',
				name: 'marketKey',
				type: 'bytes32',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'FuturesMarketSuspended',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'FuturesResumed',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'FuturesSuspended',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'IssuanceResumed',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'IssuanceSuspended',
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
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'bytes32',
				name: 'currencyKey',
				type: 'bytes32',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'SynthExchangeResumed',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'bytes32',
				name: 'currencyKey',
				type: 'bytes32',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'SynthExchangeSuspended',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'bytes32',
				name: 'currencyKey',
				type: 'bytes32',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'SynthResumed',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'bytes32',
				name: 'currencyKey',
				type: 'bytes32',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'SynthSuspended',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'SystemResumed',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'SystemSuspended',
		type: 'event',
	},
	{
		constant: true,
		inputs: [],
		name: 'CONTRACT_NAME',
		outputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'SECTION_EXCHANGE',
		outputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'SECTION_FUTURES',
		outputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'SECTION_ISSUANCE',
		outputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'SECTION_SYNTH',
		outputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'SECTION_SYNTH_EXCHANGE',
		outputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'SECTION_SYSTEM',
		outputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'SUSPENSION_REASON_UPGRADE',
		outputs: [
			{
				internalType: 'uint248',
				name: '',
				type: 'uint248',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [],
		name: 'acceptOwnership',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'accessControl',
		outputs: [
			{
				internalType: 'bool',
				name: 'canSuspend',
				type: 'bool',
			},
			{
				internalType: 'bool',
				name: 'canResume',
				type: 'bool',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'exchangeSuspension',
		outputs: [
			{
				internalType: 'bool',
				name: 'suspended',
				type: 'bool',
			},
			{
				internalType: 'uint248',
				name: 'reason',
				type: 'uint248',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		name: 'futuresMarketSuspension',
		outputs: [
			{
				internalType: 'bool',
				name: 'suspended',
				type: 'bool',
			},
			{
				internalType: 'uint248',
				name: 'reason',
				type: 'uint248',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'futuresSuspension',
		outputs: [
			{
				internalType: 'bool',
				name: 'suspended',
				type: 'bool',
			},
			{
				internalType: 'uint248',
				name: 'reason',
				type: 'uint248',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32[]',
				name: 'marketKeys',
				type: 'bytes32[]',
			},
		],
		name: 'getFuturesMarketSuspensions',
		outputs: [
			{
				internalType: 'bool[]',
				name: 'suspensions',
				type: 'bool[]',
			},
			{
				internalType: 'uint256[]',
				name: 'reasons',
				type: 'uint256[]',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32[]',
				name: 'synths',
				type: 'bytes32[]',
			},
		],
		name: 'getSynthExchangeSuspensions',
		outputs: [
			{
				internalType: 'bool[]',
				name: 'exchangeSuspensions',
				type: 'bool[]',
			},
			{
				internalType: 'uint256[]',
				name: 'reasons',
				type: 'uint256[]',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32[]',
				name: 'synths',
				type: 'bytes32[]',
			},
		],
		name: 'getSynthSuspensions',
		outputs: [
			{
				internalType: 'bool[]',
				name: 'suspensions',
				type: 'bool[]',
			},
			{
				internalType: 'uint256[]',
				name: 'reasons',
				type: 'uint256[]',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'isSystemUpgrading',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'issuanceSuspension',
		outputs: [
			{
				internalType: 'bool',
				name: 'suspended',
				type: 'bool',
			},
			{
				internalType: 'uint248',
				name: 'reason',
				type: 'uint248',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'address',
				name: '_owner',
				type: 'address',
			},
		],
		name: 'nominateNewOwner',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'nominatedOwner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'owner',
		outputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'requireExchangeActive',
		outputs: [],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'sourceCurrencyKey',
				type: 'bytes32',
			},
			{
				internalType: 'bytes32',
				name: 'destinationCurrencyKey',
				type: 'bytes32',
			},
		],
		name: 'requireExchangeBetweenSynthsAllowed',
		outputs: [],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'requireFuturesActive',
		outputs: [],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'marketKey',
				type: 'bytes32',
			},
		],
		name: 'requireFuturesMarketActive',
		outputs: [],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'requireIssuanceActive',
		outputs: [],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'currencyKey',
				type: 'bytes32',
			},
		],
		name: 'requireSynthActive',
		outputs: [],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'currencyKey',
				type: 'bytes32',
			},
		],
		name: 'requireSynthExchangeActive',
		outputs: [],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'sourceCurrencyKey',
				type: 'bytes32',
			},
			{
				internalType: 'bytes32',
				name: 'destinationCurrencyKey',
				type: 'bytes32',
			},
		],
		name: 'requireSynthsActive',
		outputs: [],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'requireSystemActive',
		outputs: [],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [],
		name: 'resumeExchange',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [],
		name: 'resumeFutures',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'marketKey',
				type: 'bytes32',
			},
		],
		name: 'resumeFuturesMarket',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32[]',
				name: 'marketKeys',
				type: 'bytes32[]',
			},
		],
		name: 'resumeFuturesMarkets',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [],
		name: 'resumeIssuance',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'currencyKey',
				type: 'bytes32',
			},
		],
		name: 'resumeSynth',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'currencyKey',
				type: 'bytes32',
			},
		],
		name: 'resumeSynthExchange',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32[]',
				name: 'currencyKeys',
				type: 'bytes32[]',
			},
		],
		name: 'resumeSynths',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32[]',
				name: 'currencyKeys',
				type: 'bytes32[]',
			},
		],
		name: 'resumeSynthsExchange',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [],
		name: 'resumeSystem',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'suspendExchange',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'suspendFutures',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'marketKey',
				type: 'bytes32',
			},
			{
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'suspendFuturesMarket',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32[]',
				name: 'marketKeys',
				type: 'bytes32[]',
			},
			{
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'suspendFuturesMarkets',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'suspendIssuance',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'currencyKey',
				type: 'bytes32',
			},
			{
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'suspendSynth',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'currencyKey',
				type: 'bytes32',
			},
			{
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'suspendSynthExchange',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32[]',
				name: 'currencyKeys',
				type: 'bytes32[]',
			},
			{
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'suspendSynths',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32[]',
				name: 'currencyKeys',
				type: 'bytes32[]',
			},
			{
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'suspendSynthsExchange',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'uint256',
				name: 'reason',
				type: 'uint256',
			},
		],
		name: 'suspendSystem',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		name: 'synthExchangeSuspension',
		outputs: [
			{
				internalType: 'bool',
				name: 'suspended',
				type: 'bool',
			},
			{
				internalType: 'uint248',
				name: 'reason',
				type: 'uint248',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'currencyKey',
				type: 'bytes32',
			},
		],
		name: 'synthSuspended',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [
			{
				internalType: 'bytes32',
				name: '',
				type: 'bytes32',
			},
		],
		name: 'synthSuspension',
		outputs: [
			{
				internalType: 'bool',
				name: 'suspended',
				type: 'bool',
			},
			{
				internalType: 'uint248',
				name: 'reason',
				type: 'uint248',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'systemSuspended',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: true,
		inputs: [],
		name: 'systemSuspension',
		outputs: [
			{
				internalType: 'bool',
				name: 'suspended',
				type: 'bool',
			},
			{
				internalType: 'uint248',
				name: 'reason',
				type: 'uint248',
			},
		],
		payable: false,
		stateMutability: 'view',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32',
				name: 'section',
				type: 'bytes32',
			},
			{
				internalType: 'address',
				name: 'account',
				type: 'address',
			},
			{
				internalType: 'bool',
				name: 'canSuspend',
				type: 'bool',
			},
			{
				internalType: 'bool',
				name: 'canResume',
				type: 'bool',
			},
		],
		name: 'updateAccessControl',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		constant: false,
		inputs: [
			{
				internalType: 'bytes32[]',
				name: 'sections',
				type: 'bytes32[]',
			},
			{
				internalType: 'address[]',
				name: 'accounts',
				type: 'address[]',
			},
			{
				internalType: 'bool[]',
				name: 'canSuspends',
				type: 'bool[]',
			},
			{
				internalType: 'bool[]',
				name: 'canResumes',
				type: 'bool[]',
			},
		],
		name: 'updateAccessControls',
		outputs: [],
		payable: false,
		stateMutability: 'nonpayable',
		type: 'function',
	},
]

export class SystemStatus__factory {
	static readonly abi = _abi
	static createInterface(): SystemStatusInterface {
		return new utils.Interface(_abi) as SystemStatusInterface
	}
	static connect(address: string, signerOrProvider: Signer | Provider): SystemStatus {
		return new Contract(address, _abi, signerOrProvider) as SystemStatus
	}
}
