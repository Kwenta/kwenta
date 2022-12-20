import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
	braveWallet,
	coinbaseWallet,
	injectedWallet,
	ledgerWallet,
	metaMaskWallet,
	rainbowWallet,
	trustWallet,
	walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { chain, configureChains, createClient } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';

import Frame from 'components/Rainbowkit/Frame';
import Safe from 'components/Rainbowkit/Gnosis';
import Tally from 'components/Rainbowkit/Tally';
import { BLAST_NETWORK_LOOKUP } from 'constants/network';

const { chains, provider } = configureChains(
	[chain.optimism, chain.mainnet, chain.optimismGoerli, chain.goerli],
	[
		infuraProvider({
			apiKey: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID!,
			stallTimeout: 5000,
			priority: process.env.NEXT_PUBLIC_PROVIDER_ID === 'INFURA' ? 0 : 2,
		}),
		jsonRpcProvider({
			rpc: (networkChain) => {
				return !BLAST_NETWORK_LOOKUP[networkChain.id]
					? {
							http: networkChain.rpcUrls.default,
					  }
					: {
							http: `https://${BLAST_NETWORK_LOOKUP[networkChain.id]}.blastapi.io/${
								process.env.NEXT_PUBLIC_BLASTAPI_PROJECT_ID
							}`,
					  };
			},
			stallTimeout: 5000,
			priority: 1,
		}),
		publicProvider({ stallTimeout: 5000, priority: 5 }),
	]
);

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
]);

export const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
});

export { chains };
