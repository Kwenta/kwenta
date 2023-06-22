import Connector from 'containers/Connector/Connector'

import { DEFAULT_NETWORK, MOCK_SIGNER, TEST_ADDR } from '../constants'

import { mockProvider } from './mockEthersProvider'

const DEFAULT_CONNECTOR = {
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
	defaultSynthetixjs: null,
	l2Synthetixjs: null,
	l2SynthsMap: {},
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
