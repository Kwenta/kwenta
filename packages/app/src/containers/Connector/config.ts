import { Chain, connectorsForWallets } from '@rainbow-me/rainbowkit'
import {
	braveWallet,
	coinbaseWallet,
	injectedWallet,
	ledgerWallet,
	metaMaskWallet,
	rainbowWallet,
	trustWallet,
	walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { configureChains, createClient } from 'wagmi'
import {
	arbitrum,
	avalanche,
	bsc,
	mainnet,
	polygon,
	optimism,
	goerli,
	optimismGoerli,
} from 'wagmi/chains'
import { infuraProvider } from 'wagmi/providers/infura'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { publicProvider } from 'wagmi/providers/public'

import BinanceIcon from 'assets/png/rainbowkit/binance.png'
import Frame from '../../components/Rainbowkit/Frame'
import Safe from '../../components/Rainbowkit/Gnosis'
import Tally from '../../components/Rainbowkit/Tally'
import { BLAST_NETWORK_LOOKUP, STALL_TIMEOUT } from '../../constants/network'

const bscWithIcon: Chain = {
	...bsc,
	iconUrl: async () => BinanceIcon,
}

export const chain = {
	optimism,
	mainnet,
	arbitrum,
	polygon,
	avalanche,
	bsc: bscWithIcon,
	goerli,
	optimismGoerli,
}

const { chains, provider } = configureChains(Object.values(chain), [
	infuraProvider({
		apiKey: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID!,
		stallTimeout: STALL_TIMEOUT,
		priority: process.env.NEXT_PUBLIC_PROVIDER_ID === 'INFURA' ? 0 : 2,
	}),
	jsonRpcProvider({
		rpc: (networkChain) => ({
			http: !BLAST_NETWORK_LOOKUP[networkChain.id]
				? networkChain.rpcUrls.default.http[0]
				: `https://${BLAST_NETWORK_LOOKUP[networkChain.id]}.blastapi.io/${
						process.env.NEXT_PUBLIC_BLASTAPI_PROJECT_ID
				  }`,
		}),
		stallTimeout: STALL_TIMEOUT,
		priority: 1,
	}),
	publicProvider({ stallTimeout: STALL_TIMEOUT, priority: 5 }),
])

const connectors = connectorsForWallets([
	{
		groupName: 'Popular',
		wallets: [
			Safe({ chains }),
			metaMaskWallet({ chains }),
			rainbowWallet({ chains }),
			coinbaseWallet({ appName: 'Kwenta', chains }),
			walletConnectWallet({ chains }),
		],
	},
	{
		groupName: 'More',
		wallets: [
			ledgerWallet({ chains }),
			braveWallet({ chains, shimDisconnect: true }),
			trustWallet({ chains }),
			Tally({ chains, shimDisconnect: true }),
			Frame({ chains, shimDisconnect: true }),
			injectedWallet({ chains, shimDisconnect: true }),
		],
	},
])

export const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
})

export const activeChainIds = [
	chain.optimism.id,
	chain.mainnet.id,
	chain.optimismGoerli.id,
	chain.goerli.id,
]

export { chains }
