import { BigNumber } from '@ethersproject/bignumber'
import { weiFromEth } from '@kwenta/sdk/utils'

import Connector from 'containers/Connector/Connector'

import { DEFAULT_NETWORK, MOCK_SIGNER, TEST_ADDR } from './data/app'

export type MockEthProvider = Record<string, any>

const DEFAULT_PROVIDER = {
	network: DEFAULT_NETWORK,
	blockNumber: 5000,
	getNetwork: () => DEFAULT_NETWORK,
	waitForTransaction: () => {},
	getBlockNumber: () => 5000,
	getGasPrice: () => BigNumber.from('2000000000'),
	getBalance: () => BigNumber.from(weiFromEth('10')),
	estimateGas: () => BigNumber.from('100000'),
	sendTransaction: () => {},
	getLogs: () => [],
	getEtherPrice: () => 1000,
	getTransactionCount: () => 1,
	getAvatar: () => '',
	lookupAddress: () => 'name',
}

export const mockProvider = (overrides: MockEthProvider = {}) => {
	return {
		...DEFAULT_PROVIDER,
		...overrides,
	}
}

export const DEFAULT_CONNECTOR = {
	activeChain: {
		id: DEFAULT_NETWORK.id,
		name: DEFAULT_NETWORK.name,
		network: DEFAULT_NETWORK.name,
		rpcUrls: {
			infura: '',
			default: '',
		},
	},
	unsupportedNetwork: false,
	isWalletConnected: true,
	walletAddress: TEST_ADDR,
	provider: mockProvider(),
	l2Provider: null,
	signer: MOCK_SIGNER,
	network: DEFAULT_NETWORK,
	synthsMap: {},
	tokensMap: {},
	staticMainnetProvider: null,
	l2SynthsMap: {},
	providerReady: true,
}

const mockConnector = (overrides?: Record<string, any>) => {
	// @ts-ignore
	jest.spyOn(Connector, 'useContainer').mockImplementation(() => {
		return {
			...DEFAULT_CONNECTOR,
			...(overrides ?? {}),
		}
	})
}

export default mockConnector
