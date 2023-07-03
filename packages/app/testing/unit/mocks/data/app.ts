import { NetworkId } from '@kwenta/sdk/dist/types'
import { Wallet } from 'ethers'

import { PRICES_INITIAL_STATE } from 'state/prices/reducer'
import { PricesInfoMap } from 'state/prices/types'

export const TEST_ADDR = '0x1c099210997E5C5689189A256C6145ca743B2610'
export const TEST_PK = 'b826c22c04853f6ba05575275494a3a5c9eff298c36cb58d11370f83c87574e4'

export const MOCK_SIGNER = new Wallet(TEST_PK)

export const DEFAULT_NETWORK = {
	id: 420,
	name: 'optimism-goerli',
}

export const CHAINS = [
	{
		id: 10,
		name: 'Optimism',
		network: 'optimism',
		nativeCurrency: {
			name: 'Ether',
			symbol: 'ETH',
			decimals: 18,
		},
		rpcUrls: {
			alchemy: 'https://opt-mainnet.g.alchemy.com/v2',
			default: 'https://optimism-mainnet.infura.io/v3',
			infura: 'https://optimism-mainnet.infura.io/v3',
			public: 'https://mainnet.optimism.io',
		},
		blockExplorers: {
			etherscan: {
				name: 'Etherscan',
				url: 'https://optimistic.etherscan.io',
			},
			default: {
				name: 'Etherscan',
				url: 'https://optimistic.etherscan.io',
			},
		},
		multicall: {
			address: '0xca11bde05977b3631167028862be2a173976ca11',
			blockCreated: 4286263,
		},
	},
	{
		id: 1,
		name: 'Ethereum',
		network: 'homestead',
		nativeCurrency: {
			name: 'Ether',
			symbol: 'ETH',
			decimals: 18,
		},
		rpcUrls: {
			alchemy: 'https://eth-mainnet.alchemyapi.io/v2',
			default: 'https://mainnet.infura.io/v3',
			infura: 'https://mainnet.infura.io/v3',
			public: 'https://eth-mainnet.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
		},
		blockExplorers: {
			etherscan: {
				name: 'Etherscan',
				url: 'https://etherscan.io',
			},
			default: {
				name: 'Etherscan',
				url: 'https://etherscan.io',
			},
		},
		ens: {
			address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
		},
		multicall: {
			address: '0xca11bde05977b3631167028862be2a173976ca11',
			blockCreated: 14353601,
		},
	},
	{
		id: 420,
		name: 'Optimism Goerli',
		network: 'optimism-goerli',
		nativeCurrency: {
			name: 'Goerli Ether',
			symbol: 'ETH',
			decimals: 18,
		},
		rpcUrls: {
			alchemy: 'https://opt-goerli.g.alchemy.com/v2',
			default: 'https://optimism-goerli.infura.io/v3',
			infura: 'https://optimism-goerli.infura.io/v3',
			public: 'https://goerli.optimism.io',
		},
		blockExplorers: {
			default: {
				name: 'Blockscout',
				url: 'https://blockscout.com/optimism/goerli',
			},
		},
		multicall: {
			address: '0xca11bde05977b3631167028862be2a173976ca11',
			blockCreated: 49461,
		},
		testnet: true,
	},
	{
		id: 5,
		name: 'Goerli',
		network: 'goerli',
		nativeCurrency: {
			name: 'Goerli Ether',
			symbol: 'ETH',
			decimals: 18,
		},
		rpcUrls: {
			alchemy: 'https://eth-goerli.alchemyapi.io/v2',
			default: 'https://goerli.infura.io/v3',
			infura: 'https://goerli.infura.io/v3',
			public: 'https://eth-goerli.alchemyapi.io/v2/_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC',
		},
		blockExplorers: {
			etherscan: {
				name: 'Etherscan',
				url: 'https://goerli.etherscan.io',
			},
			default: {
				name: 'Etherscan',
				url: 'https://goerli.etherscan.io',
			},
		},
		ens: {
			address: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
		},
		multicall: {
			address: '0xca11bde05977b3631167028862be2a173976ca11',
			blockCreated: 6507670,
		},
		testnet: true,
	},
]

export const PRELOADED_STATE = {
	wallet: { networkId: 10 as NetworkId, walletAddress: TEST_ADDR },
	prices: {
		...PRICES_INITIAL_STATE,
		onChainPrices: { sETH: { price: '1810.50', change: 'up' } } as PricesInfoMap,
		offChainPrices: { sETH: { price: '1810.50', change: 'up' } } as PricesInfoMap,
	},
}
