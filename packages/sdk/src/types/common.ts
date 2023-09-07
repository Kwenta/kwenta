import { TransactionRequest, TransactionResponse } from '@ethersproject/providers'
import { ethers } from 'ethers'

export type PriceServer = 'KWENTA' | 'PYTH'

export type NetworkId = 1 | 5 | 420 | 10 | 42 | 69 | 31337

export type NetworkOverrideOptions = {
	networkId: NetworkId
	provider: ethers.providers.Provider
}

export enum TransactionStatus {
	AwaitingExecution = 'AwaitingExecution',
	Executed = 'Executed',
	Confirmed = 'Confirmed',
	Failed = 'Failed',
}

export const NetworkIdByName = {
	mainnet: 1,
	goerli: 5,
	'goerli-ovm': 420,
	'mainnet-ovm': 10,
	kovan: 42,
	'kovan-ovm': 69,
	'mainnet-fork': 31337,
} as const

export const NetworkNameById = {
	1: 'mainnet',
	5: 'goerli',
	42: 'kovan',
	10: 'mainnet-ovm',
	69: 'kovan-ovm',
	420: 'goerli-ovm',
	31337: 'mainnet-fork',
} as const

export type CurrencyKey = string

export type TxReturn<PrepareOnly extends boolean | undefined> = Promise<
	PrepareOnly extends true ? TransactionRequest : TransactionResponse
>
